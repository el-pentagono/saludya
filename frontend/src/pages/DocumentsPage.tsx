import { useEffect, useState } from 'react';
import { listarTurnos } from '../api/appointments';
import { generarConstanciaAtencion, listarDocumentos } from '../api/documents';
import { extraerMensajeError } from '../api/errors';
import type { Appointment, DocumentoEmitido } from '../types';

const NOMBRE_TIPO: Record<DocumentoEmitido['tipo'], string> = {
  constancia_atencion: 'Constancia de atención',
  certificado_tratamiento: 'Certificado de tratamiento',
};

export function DocumentsPage() {
  const [documentos, setDocumentos] = useState<DocumentoEmitido[]>([]);
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generandoId, setGenerandoId] = useState<string | null>(null);

  const cargarDocumentos = () => {
    listarDocumentos()
      .then(setDocumentos)
      .catch(() => setDocumentos([]));
  };

  useEffect(() => {
    cargarDocumentos();
    listarTurnos()
      .then(setTurnos)
      .catch(() => setTurnos([]));
  }, []);

  const elegibles = turnos.filter(
    (t) =>
      t.estado !== 'cancelado' &&
      new Date(t.fecha) <= new Date() &&
      !documentos.some((d) => d.appointmentId === t.id),
  );

  const onGenerar = async (appointmentId: string) => {
    setError(null);
    setGenerandoId(appointmentId);
    try {
      await generarConstanciaAtencion(appointmentId);
      cargarDocumentos();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo generar la constancia'));
    } finally {
      setGenerandoId(null);
    }
  };

  return (
    <div>
      <h1>Mis documentos</h1>
      {error && <p className="error">{error}</p>}

      <h2>Generar constancia de atención</h2>
      {elegibles.length === 0 ? (
        <p>No tenés turnos ya realizados pendientes de constancia.</p>
      ) : (
        <ul>
          {elegibles.map((t) => (
            <li key={t.id}>
              {new Date(t.fecha).toLocaleString('es-AR')}
              {t.medico && ` — Dr/a. ${t.medico.nombre} ${t.medico.apellido}`}
              <button disabled={generandoId === t.id} onClick={() => onGenerar(t.id)}>
                {generandoId === t.id ? 'Generando…' : 'Generar constancia'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2>Documentos emitidos</h2>
      <table className="tabla">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>N° constancia</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((d) => (
            <tr key={d.id}>
              <td>{NOMBRE_TIPO[d.tipo]}</td>
              <td>{d.numeroConstancia}</td>
              <td>{new Date(d.fechaEmision).toLocaleDateString('es-AR')}</td>
              <td>
                <a href={d.urlDescarga} target="_blank" rel="noreferrer">
                  Descargar
                </a>
              </td>
            </tr>
          ))}
          {documentos.length === 0 && (
            <tr>
              <td colSpan={4}>Todavía no generaste ningún documento.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
