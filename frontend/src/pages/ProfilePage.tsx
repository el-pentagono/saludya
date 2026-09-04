import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { actualizarPerfil, obtenerPerfil } from '../api/auth';
import { extraerMensajeError } from '../api/errors';
import { listarObrasSociales } from '../api/obrasSociales';
import type { ObraSocial, Usuario } from '../types';

export function ProfilePage() {
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);

  const [editandoTelefono, setEditandoTelefono] = useState(false);
  const [telefonoDraft, setTelefonoDraft] = useState('');
  const [guardandoTelefono, setGuardandoTelefono] = useState(false);
  const [errorTelefono, setErrorTelefono] = useState<string | null>(null);

  const [editandoObraSocial, setEditandoObraSocial] = useState(false);
  const [obraSocialIdDraft, setObraSocialIdDraft] = useState('');
  const [numeroAfiliadoDraft, setNumeroAfiliadoDraft] = useState('');
  const [guardandoObraSocial, setGuardandoObraSocial] = useState(false);
  const [errorObraSocial, setErrorObraSocial] = useState<string | null>(null);

  useEffect(() => {
    obtenerPerfil()
      .then(setPerfil)
      .catch(() => setPerfil(null));
    listarObrasSociales()
      .then(setObrasSociales)
      .catch(() => setObrasSociales([]));
  }, []);

  if (!perfil) return <p>Cargando…</p>;

  const onEditarTelefono = () => {
    setTelefonoDraft(perfil.telefono ?? '');
    setErrorTelefono(null);
    setEditandoTelefono(true);
  };

  const onGuardarTelefono = async (e: FormEvent) => {
    e.preventDefault();
    setErrorTelefono(null);
    setGuardandoTelefono(true);
    try {
      const actualizado = await actualizarPerfil(perfil.id, {
        telefono: telefonoDraft.trim() || null,
      });
      setPerfil(actualizado);
      setEditandoTelefono(false);
    } catch (err: unknown) {
      setErrorTelefono(extraerMensajeError(err, 'No se pudo actualizar el teléfono'));
    } finally {
      setGuardandoTelefono(false);
    }
  };

  const onEditarObraSocial = () => {
    setObraSocialIdDraft(perfil.obraSocialId ?? '');
    setNumeroAfiliadoDraft(perfil.numeroAfiliado ?? '');
    setErrorObraSocial(null);
    setEditandoObraSocial(true);
  };

  const onGuardarObraSocial = async (e: FormEvent) => {
    e.preventDefault();
    if (obraSocialIdDraft && !numeroAfiliadoDraft.trim()) {
      setErrorObraSocial('Ingresá tu número de afiliado.');
      return;
    }
    setErrorObraSocial(null);
    setGuardandoObraSocial(true);
    try {
      const actualizado = await actualizarPerfil(perfil.id, {
        obraSocialId: obraSocialIdDraft || null,
        numeroAfiliado: obraSocialIdDraft ? numeroAfiliadoDraft.trim() : null,
      });
      setPerfil(actualizado);
      setEditandoObraSocial(false);
    } catch (err: unknown) {
      setErrorObraSocial(extraerMensajeError(err, 'No se pudo actualizar la obra social'));
    } finally {
      setGuardandoObraSocial(false);
    }
  };

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
        <dd>
          {editandoTelefono ? (
            <form className="perfil-form" onSubmit={onGuardarTelefono}>
              <input
                type="tel"
                value={telefonoDraft}
                onChange={(e) => setTelefonoDraft(e.target.value)}
                placeholder="Ej: 11 5555-0000"
                autoFocus
              />
              {errorTelefono && <p className="error">{errorTelefono}</p>}
              <div className="perfil-acciones">
                <button type="submit" disabled={guardandoTelefono}>
                  {guardandoTelefono ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setEditandoTelefono(false)}
                  disabled={guardandoTelefono}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="perfil-campo">
              <span>{perfil.telefono ?? '—'}</span>
              <button type="button" className="btn-editar-campo" onClick={onEditarTelefono}>
                ✏️ Editar
              </button>
            </div>
          )}
        </dd>

        <dt>Obra social</dt>
        <dd>
          {editandoObraSocial ? (
            <form className="perfil-form" onSubmit={onGuardarObraSocial}>
              <select
                value={obraSocialIdDraft}
                onChange={(e) => setObraSocialIdDraft(e.target.value)}
              >
                <option value="">Sin obra social</option>
                {obrasSociales.map((os) => (
                  <option key={os.id} value={os.id}>
                    {os.nombre}
                  </option>
                ))}
              </select>
              {obraSocialIdDraft && (
                <input
                  type="text"
                  value={numeroAfiliadoDraft}
                  onChange={(e) => setNumeroAfiliadoDraft(e.target.value)}
                  placeholder="Número de afiliado"
                />
              )}
              {errorObraSocial && <p className="error">{errorObraSocial}</p>}
              <div className="perfil-acciones">
                <button type="submit" disabled={guardandoObraSocial}>
                  {guardandoObraSocial ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setEditandoObraSocial(false)}
                  disabled={guardandoObraSocial}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="perfil-campo">
              <span>{perfil.obraSocial?.nombre ?? 'Sin obra social'}</span>
              <button type="button" className="btn-editar-campo" onClick={onEditarObraSocial}>
                ✏️ Editar
              </button>
            </div>
          )}
        </dd>

        {perfil.obraSocial && !editandoObraSocial && (
          <>
            <dt>N.º de afiliado</dt>
            <dd>{perfil.numeroAfiliado ?? '—'}</dd>
            <dt>Afiliación</dt>
            <dd>{perfil.afiliacionVerificada ? 'Verificada ✓' : 'No verificada'}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
