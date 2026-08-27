import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extraerMensajeError } from '../api/errors';
import { SaludYaPortalLogo } from '../components/SaludYaPortalLogo';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const u = await login(email, password);
      // Si quien ingresa es personal de salud, redirigir al portal profesional
      if (u.rol !== 'paciente') {
        navigate('/profesionales');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo iniciar sesión'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <form className="auth-form" onSubmit={onSubmit} style={{ maxWidth: '440px' }}>
        <img
          src="/logo-pacientes.jpg"
          alt="SaludYa — Pacientes"
          style={{
            width: '100%',
            height: '135px',
            objectFit: 'cover',
            borderRadius: '10px',
            marginBottom: '1rem',
            border: '1px solid var(--color-border)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        />
        <div style={{ marginBottom: '1rem' }}>
          <SaludYaPortalLogo portal="pacientes" layout="vertical" size={26} />
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            marginTop: 0,
            marginBottom: '1.5rem',
          }}
        >
          Accedé a tus turnos, recetas digitales pendientes de retirar e historia clínica
        </p>

        {error && <p className="error">{error}</p>}

        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tuemail@ejemplo.com"
            required
            autoComplete="username"
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar al Portal Pacientes'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1.25rem' }}>
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>

        <div
          style={{
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '0.88rem',
            background: 'var(--color-bg)',
            padding: '0.75rem',
            borderRadius: '8px',
          }}
        >
          <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
            ¿Sos médico, enfermero o farmacéutico?
          </div>
          <Link
            to="/profesionales/login"
            style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}
          >
            Ingresar al Portal de Profesionales →
          </Link>
        </div>
      </form>
    </div>
  );
}
