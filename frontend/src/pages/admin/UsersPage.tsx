import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { crearUsuario, desactivarUsuario, listarUsuarios } from '../../api/usuarios';
import { extraerMensajeError } from '../../api/errors';
import { useAuth } from '../../context/AuthContext';
import type { Rol, Usuario } from '../../types';

const ROLES: Rol[] = ['paciente', 'medico', 'enfermero', 'farmaceutico', 'director', 'auditor'];

interface FormState {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  rol: Rol;
}

const formInicial: FormState = {
  email: '',
  password: '',
  nombre: '',
  apellido: '',
  dni: '',
  rol: 'medico',
};

export function UsersPage() {
  const { usuario } = useAuth();
  const esDirector = usuario?.rol === 'director';
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState<FormState>(formInicial);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    listarUsuarios()
      .then(setUsuarios)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar la lista de usuarios')));
  };

  useEffect(() => {
    cargar();
  }, []);

  const onChange =
    (campo: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [campo]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await crearUsuario(form);
      setForm(formInicial);
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo crear el usuario'));
    } finally {
      setEnviando(false);
    }
  };

  const onDesactivar = async (id: string) => {
    setError(null);
    try {
      await desactivarUsuario(id);
      cargar();
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo desactivar el usuario'));
    }
  };

  return (
    <div>
      <h1>Usuarios</h1>
      {error && <p className="error">{error}</p>}

      {esDirector && (
        <form className="inline-form" onSubmit={onSubmit}>
          <h2>Crear usuario</h2>
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
            Correo electrónico
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
            Rol
            <select value={form.rol} onChange={onChange('rol')}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={enviando}>
            {enviando ? 'Creando…' : 'Crear usuario'}
          </button>
        </form>
      )}

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo electrónico</th>
            <th>DNI</th>
            <th>Rol</th>
            <th>Estado</th>
            {esDirector && <th></th>}
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>
                {u.nombre} {u.apellido}
              </td>
              <td>{u.email}</td>
              <td>{u.dni}</td>
              <td>{u.rol}</td>
              <td>
                <span className={`badge ${u.activo ? 'badge-cerrado' : 'badge-cancelado'}`}>
                  {u.activo ? 'activo' : 'inactivo'}
                </span>
              </td>
              {esDirector && (
                <td>
                  {u.activo && u.id !== usuario?.id && (
                    <button onClick={() => onDesactivar(u.id)}>Desactivar</button>
                  )}
                </td>
              )}
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan={esDirector ? 6 : 5}>No hay usuarios cargados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
