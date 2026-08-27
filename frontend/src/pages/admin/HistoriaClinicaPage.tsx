import { useEffect, useState } from 'react';
import { listarTodasHistoriasClinicas } from '../../api/medicalRecords';
import type { MedicalRecordEntry } from '../../types';

export function HistoriaClinicaPage() {
  const [entradas, setEntradas] = useState<MedicalRecordEntry[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    listarTodasHistoriasClinicas()
      .then(setEntradas)
      .catch(() => setEntradas([]));
  }, []);

  const filtradas = entradas.filter((e) => {
    const texto = `${e.diagnostico} ${e.paciente?.nombre} ${e.paciente?.apellido} ${e.medico?.nombre} ${e.medico?.apellido} ${e.notas}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1>Historia clínica del sistema</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Acceso de lectura y auditoría al historial clínico de cualquier paciente
          </p>
        </div>

        <input
          type="search"
          placeholder="Filtrar por paciente, médico o diagnóstico…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: '340px', padding: '0.5rem 0.85rem' }}
        />
      </div>

      <ul className="lista-entradas">
        {filtradas.map((e) => (
          <li key={e.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <strong>{new Date(e.fecha).toLocaleDateString('es-AR')} — {e.diagnostico}</strong>
              <span className="detalle">
                {e.paciente && `Paciente: ${e.paciente.nombre} ${e.paciente.apellido}`}
                {e.medico && ` • Dr/a. ${e.medico.nombre} ${e.medico.apellido}`}
              </span>
            </div>
            {e.notas && <p className="notas" style={{ marginTop: '0.5rem' }}>{e.notas}</p>}
          </li>
        ))}
        {filtradas.length === 0 && (
          <li>{busqueda ? 'No se encontraron entradas con ese criterio.' : 'No hay entradas cargadas.'}</li>
        )}
      </ul>
    </div>
  );
}
