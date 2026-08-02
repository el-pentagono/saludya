import { useEffect, useState } from 'react';
import { listarDocumentos } from '../../api/documents';
import type { DocumentoEmitido } from '../../types';

const NOMBRE_TIPO: Record<DocumentoEmitido['tipo'], string> = {
  constancia_atencion: 'Constancia de atención',
  certificado_tratamiento: 'Certificado de tratamiento',
};

export function DocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoEmitido[]>([]);

  useEffect(() => {
    listarDocumentos()
      .then(setDocumentos)
      .catch(() => setDocumentos([]));
  }, []);

  return (
    <div>
      <h1>Documentos del sistema</h1>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Tipo</th>
            <th>N° constancia</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((d) => (
            <tr key={d.id}>
              <td>{new Date(d.fechaEmision).toLocaleDateString('es-AR')}</td>
              <td>{d.paciente ? `${d.paciente.nombre} ${d.paciente.apellido}` : '—'}</td>
              <td>{NOMBRE_TIPO[d.tipo]}</td>
              <td>{d.numeroConstancia}</td>
              <td>
                <a href={d.urlDescarga} target="_blank" rel="noreferrer">
                  Descargar
                </a>
              </td>
            </tr>
          ))}
          {documentos.length === 0 && (
            <tr>
              <td colSpan={5}>No hay documentos emitidos.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
