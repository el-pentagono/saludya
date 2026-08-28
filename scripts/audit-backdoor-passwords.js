#!/usr/bin/env node
/**
 * Auditoria del backdoor de auth.service.ts (ver PR #1 / commit 7556812).
 *
 * Busca cuentas reales (no las demo oficiales) cuyo password hash coincide
 * con alguna de las dos contraseñas hardcodeadas que el backdoor aceptaba
 * ('Paciente#2026' / 'SaludYaDemo2026!'). Si coincide, es evidencia de que
 * esa cuenta pudo haber sido tomada via el backdoor (alguien probo esa
 * clave contra el email y el sistema se la puso como password real).
 *
 * Por defecto corre en modo DRY-RUN: solo reporta, no modifica nada.
 * Con --fix, a cada cuenta afectada le genera una password aleatoria nueva
 * (invalidando el acceso por la clave de demo) y la imprime UNA VEZ en la
 * salida para que se la puedas pasar vos mismo a esa persona por un canal
 * seguro -- este script no manda emails ni mensajes a nadie.
 *
 * Uso:
 *   DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=... \
 *     node scripts/audit-backdoor-passwords.js            # dry-run
 *   DB_HOST=... ... node scripts/audit-backdoor-passwords.js --fix  # aplica
 *
 * Importante (mismo gotcha ya documentado para TramitExpress/Railway):
 * si DB_HOST apunta al hostname interno de Railway (*.railway.internal),
 * este script NO va a poder conectar desde tu maquina local -- necesitas
 * el host/puerto del proxy PUBLICO de Postgres (`railway variables
 * --service <postgres>` -> DATABASE_PUBLIC_URL).
 */
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const BACKDOOR_PASSWORDS = ['Paciente#2026', 'SaludYaDemo2026!'];

// Cuentas demo oficiales: NO se tocan aunque coincidan (es esperado que
// tengan esta password -- las siembra DemoSeedService a proposito).
const DEMO_EMAILS = new Set([
  'demo.paciente@saludya.com.ar',
  'demo.medico@saludya.com.ar',
  'demo.enfermero@saludya.com.ar',
  'demo.farmaceutico@saludya.com.ar',
  'demo.director@saludya.com.ar',
  'demo.auditor@saludya.com.ar',
]);

const FIX = process.argv.includes('--fix');

function generarPasswordSegura() {
  return crypto.randomBytes(18).toString('base64url');
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'saludya',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();
  console.log(`Conectado a ${process.env.DB_NAME || 'saludya'}@${process.env.DB_HOST || 'localhost'}`);
  console.log(`Modo: ${FIX ? 'FIX (va a modificar passwords afectadas)' : 'DRY-RUN (solo reporta)'}\n`);

  const { rows } = await client.query(
    'SELECT id, email, rol, password, activo FROM usuarios ORDER BY "fechaRegistro" ASC',
  );
  console.log(`Total de cuentas en la base: ${rows.length}`);

  const afectadas = [];
  for (const usuario of rows) {
    if (DEMO_EMAILS.has(usuario.email.toLowerCase())) continue;

    for (const claveBackdoor of BACKDOOR_PASSWORDS) {
      // eslint-disable-next-line no-await-in-loop
      const coincide = await bcrypt.compare(claveBackdoor, usuario.password);
      if (coincide) {
        afectadas.push({ ...usuario, claveBackdoorDetectada: claveBackdoor });
        break;
      }
    }
  }

  if (afectadas.length === 0) {
    console.log('\n✅ No se encontró ninguna cuenta real con el password del backdoor puesto.');
    await client.end();
    return;
  }

  console.log(`\n⚠️  ${afectadas.length} cuenta(s) real(es) con la contraseña del backdoor activa:\n`);
  for (const u of afectadas) {
    console.log(`  - ${u.email} (id=${u.id}, rol=${u.rol}, activo=${u.activo}) -> coincide con "${u.claveBackdoorDetectada}"`);
  }

  if (!FIX) {
    console.log('\nCorré de nuevo con --fix para generarles una password nueva aleatoria a estas cuentas.');
    console.log('(No se manda ningún email/mensaje -- la nueva clave se imprime acá para que se la pases vos.)');
    await client.end();
    return;
  }

  console.log('\nGenerando passwords nuevas...\n');
  for (const u of afectadas) {
    const nuevaPassword = generarPasswordSegura();
    const hash = await bcrypt.hash(nuevaPassword, 10);
    // eslint-disable-next-line no-await-in-loop
    await client.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hash, u.id]);
    console.log(`  ${u.email} -> nueva password temporal: ${nuevaPassword}`);
  }
  console.log('\nListo. Pasale la password nueva a cada persona por un canal seguro (no email plano) y pedile que la cambie apenas entre.');

  await client.end();
}

main().catch((err) => {
  console.error('Error corriendo la auditoría:', err.message);
  process.exit(1);
});
