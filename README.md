# SaludYa

**App del ecosistema El Pentágono**

Plataforma de **salud digital** que conecta pacientes con profesionales de la salud. Gestión de turnos, historia clínica digital, teleconsulta y seguimiento de tratamientos, con documentación certificada via TramitExpress.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS + TypeScript |
| Base de datos | PostgreSQL + TypeORM |
| Autenticación | JWT |
| Verificación de identidad | ShieldAI SDK (puerto 3010) |
| Documentos clínicos | TramitExpress (puerto 3020) |
| Puerto | 3070 |

---

## Funcionalidades principales

- **Turnos online** — Reserva de turnos con profesionales de la salud
- **Historia clínica digital** — Registro médico unificado por paciente
- **Teleconsulta** — Videoconsulta integrada entre paciente y profesional
- **Seguimiento de tratamientos** — Control de medicación, estudios y evolución
- **Certificados médicos** — Generación de constancias y certificados vía TramitExpress
- **Verificación de profesionales** — Validación de matrícula via ShieldAI

---

## Integraciones del ecosistema

| Servicio | Puerto | Uso |
|----------|--------|-----|
| ShieldAI | 3010 | Verificación de matrícula e identidad de profesionales |
| TramitExpress | 3020 | Generación de certificados y constancias médicas |

---

## Módulos

- **auth** — Registro, login, JWT para pacientes y profesionales
- **users** — Perfiles de pacientes y profesionales de la salud
- **appointments** — Gestión de turnos y agenda médica
- **medical-records** — Historia clínica digital
- **teleconsult** — Videoconsulta y sala virtual
- **treatments** — Seguimiento de tratamientos y prescripciones
- **documents** — Certificados y constancias via TramitExpress

---

## Instalación y desarrollo

```bash
# 1. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 2. Instalar dependencias
npm install

# 3. Levantar base de datos con Docker
docker-compose up postgres -d

# 4. Correr en desarrollo
npm run start:dev
```

La API estará disponible en `http://localhost:3070`.

Requiere que ShieldAI esté corriendo en `http://localhost:3010` y TramitExpress en `http://localhost:3020`.

---

## Docker (entorno completo)

```bash
docker-compose up -d
```

---

## Variables de entorno requeridas

```env
DATABASE_URL=postgresql://user:password@localhost:5432/saludya
JWT_SECRET=
SHIELDAI_URL=http://localhost:3010
TRAMITEXPRESS_URL=http://localhost:3020
PORT=3070
```

---

## El Pentágono — Ecosistema de apps

### Motores
- ShieldAI — Verificación de identidad (puerto 3010)
- TramitExpress — Gestión de trámites y documentos (puerto 3020)

### Apps
- Oneiros — Bienestar integral (3030)
- Galatea — IA autónoma del ecosistema (3031)
- DenunciaYa — Denuncias ciudadanas (3040)
- RastroBus — Certificación de evidencia GPS (3050)
- FemDrive — Movilidad femenina segura (3060)
- **SaludYa — Salud digital (3070)** ← esta app
- AlertasDeHistoria — Alertas históricas (3080)
- SafeVibe — Seguridad personal (3090)
- VacantesYa — Gestión de vacantes (3100)
- AulaEnfocada — Educación (3110)

---

## Licencia

Privado — El Pentágono © 2026. Todos los derechos reservados.
