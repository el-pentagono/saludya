import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarObrasSociales } from '../api/obrasSociales';
import { extraerMensajeError } from '../api/errors';
import { useAuth } from '../context/AuthContext';
import type { ObraSocial } from '../types';

interface FormState {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  obraSocialId: string;
  numeroAfiliado: string;
}

const formInicial: FormState = {
  email: '',
  password: '',
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  obraSocialId: '',
  numeroAfiliado: '',
};

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [form, setForm] = useState<FormState>(formInicial);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarObrasSociales()
      .then(setObrasSociales)
      .catch(() => setObrasSociales([]));
  }, []);

  const onChange =
    (campo: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [campo]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni,
        telefono: form.telefono || undefined,
        obraSocialId: form.obraSocialId || undefined,
        numeroAfiliado: form.obraSocialId ? form.numeroAfiliado : undefined,
      });
      navigate('/');
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo completar el registro'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Crear cuenta</h1>
        {error && <p className="error">{error}</p>}
        <label>
          Nombre
          <input value={form.nombre} onChange={onChange('nombre')} required />
        </label>
        <label>
          Apellido
          <input value={form.apellido} onChange={onChange('apellido')} required />
        </label>
        <label>
          DNI
          <input value={form.dni} onChange={onChange('dni')} required />
        </label>
        <label>
          Teléfono (opcional)
          <input value={form.telefono} onChange={onChange('telefono')} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={onChange('email')} required />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={onChange('password')}
            minLength={8}
            required
          />
        </label>
        <label>
          Obra social (opcional)
          <select value={form.obraSocialId} onChange={onChange('obraSocialId')}>
            <option value="">Particular / sin obra social</option>
            {obrasSociales.map((os) => (
              <option key={os.id} value={os.id}>
                {os.nombre}
              </option>
            ))}
          </select>
        </label>
        {form.obraSocialId && (
          <label>
            Número de afiliado
            <input value={form.numeroAfiliado} onChange={onChange('numeroAfiliado')} required />
          </label>
        )}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Registrarme'}
        </button>
        <p>
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </form>
    </div>
  );
}
