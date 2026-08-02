import { useEffect, useState } from 'react';
import { obtenerPerfil } from '../api/auth';
import type { Usuario } from '../types';

export function ProfilePage() {
  const [perfil, setPerfil] = useState<Usuario | null>(null);

  useEffect(() => {
    obtenerPerfil()
      .then(setPerfil)
      .catch(() => setPerfil(null));
  }, []);

  if (!perfil) return <p>Cargando…</p>;

  return (
    <div>
      <h1>Mi perfil</h1>
      <dl className="perfil">
        <dt>Nombre</dt>
        <dd>
          {perfil.nombre} {perfil.apellido}
        </dd>
        <dt>Correo electrónico</dt>
        <dd>{perfil.email}</dd>
        <dt>DNI</dt>
        <dd>{perfil.dni}</dd>
        <dt>Teléfono</dt>
        <dd>{perfil.telefono ?? '—'}</dd>
        <dt>Obra social</dt>
        <dd>{perfil.obraSocial?.nombre ?? 'Sin obra social'}</dd>
        {perfil.obraSocial && (
          <>
            <dt>Afiliación</dt>
            <dd>{perfil.afiliacionVerificada ? 'Verificada ✓' : 'No verificada'}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
