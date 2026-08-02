import { useEffect, useState } from 'react';
import { listarTranscripciones } from '../../api/ambientAi';
import type { TranscripcionConsulta } from '../../types';

export function AmbientAiPage() {
  const [transcripciones, setTranscripciones] = useState<TranscripcionConsulta[]>([]);

  useEffect(() => {
    listarTranscripciones()
      .then(setTranscripciones)
      .catch(() => setTranscripciones([]));
  }, []);

  return (
    <div>
      <h1>Transcripciones Ambient AI del sistema</h1>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Resumen</th>
            <th>Confirmada</th>
          </tr>
        </thead>
        <tbody>
          {transcripciones.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.fechaCreacion).toLocaleDateString('es-AR')}</td>
              <td>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : '—'}</td>
              <td>{t.resumen}</td>
              <td>
                <span className={`badge ${t.medicalRecordId ? 'badge-cerrado' : 'badge-pendiente'}`}>
                  {t.medicalRecordId ? 'Sí' : 'No'}
                </span>
              </td>
            </tr>
          ))}
          {transcripciones.length === 0 && (
            <tr>
              <td colSpan={4}>No hay transcripciones generadas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
