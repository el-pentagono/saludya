import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { extraerMensajeError } from '../../api/errors';
import { SaludYaPortalLogo } from '../../components/SaludYaPortalLogo';
import { useAuth } from '../../context/AuthContext';

// Emails demo de Profesionales (ver DEMO_USUARIOS en AuthContext y los
// botones de acceso rápido más abajo) -- son los únicos habilitados para el
// fallback offline si el backend no responde.
const DEMO_EMAILS_PROFESIONALES = [
  'demo.medico@saludya.com.ar',
  'demo.enfermero@saludya.com.ar',
  'demo.farmaceutico@saludya.com.ar',
  'demo.director@saludya.com.ar',
];

export function ProfessionalLoginPage() {
  const { login, loginDemoOffline, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [esPacienteRechazado, setEsPacienteRechazado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEsPacienteRechazado(false);
    setEnviando(true);
    try {
      const u = await login(email, password);
      if (u.rol === 'paciente') {
        logout();
        setEsPacienteRechazado(true);
        setError(
          'Esta cuenta corresponde a un perfil de Paciente. Por favor, utilizá el Portal de Pacientes para gestionar tus turnos y recetas.',
        );
        return;
      }
      navigate('/profesionales');
    } catch (err) {
      // Igual que en el Portal de Pacientes: si es una cuenta demo conocida
      // y el backend real no responde (sin red, servidor caído, etc.), no
      // bloqueamos -- entramos igual con datos locales para poder mostrar/
      // testear la interfaz durante una demo comercial. Las cuentas reales
      // siempre requieren el login real contra el backend.
      const sinRespuestaDelServidor = !(err as AxiosError)?.response;
      const emailNormalizado = email.trim().toLowerCase();
      if (DEMO_EMAILS_PROFESIONALES.includes(emailNormalizado) && sinRespuestaDelServidor) {
        const u = loginDemoOffline(emailNormalizado);
        if (u) {
          navigate('/profesionales');
          return;
        }
      }
      setError(extraerMensajeError(err, 'No se pudo iniciar sesión en el portal profesional'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page professional-login-page">
      <form className="auth-form" onSubmit={onSubmit} style={{ maxWidth: '440px' }}>
        <img
          src="/logo-profesionales.jpg"
          alt="SaludYa — Profesionales de Salud"
          style={{
            width: '100%',
            height: '135px',
            objectFit: 'cover',
            borderRadius: '10px',
            marginBottom: '1rem',
            border: '1px solid #a7f3d0',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
          }}
        />
        <div style={{ marginBottom: '1rem' }}>
          <SaludYaPortalLogo portal="profesionales" layout="vertical" size={26} />
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
          Acceso exclusivo para Médicos, Enfermeros, Farmacéuticos y Administración Hospitalaria
        </p>

        {error && (
          <div className="error" style={{ marginBottom: '1rem' }}>
            {error}
            {esPacienteRechazado && (
              <div style={{ marginTop: '0.75rem' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-block',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Ir al Portal de Pacientes →
                </Link>
              </div>
            )}
          </div>
        )}

        <label>
          Correo electrónico profesional
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@saludya.com.ar"
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

        <button
          type="submit"
          disabled={enviando}
          style={{
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            boxShadow: '0 2px 4px rgba(6, 95, 70, 0.25)',
          }}
        >
          {enviando ? 'Verificando credenciales…' : 'Ingresar al Portal Profesional'}
        </button>

        {/* Acceso Rápido DEMO Comercial */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px dashed #34d399',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: '#a7f3d0',
              fontWeight: 700,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Acceso Rápido — Demo Comercial
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('demo.medico@saludya.com.ar');
                setPassword('SaludYaDemo2026!');
              }}
              style={{
                background: '#047857',
                color: '#ffffff',
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #10b981',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Dr. Navarro (Médico)
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('demo.enfermero@saludya.com.ar');
                setPassword('SaludYaDemo2026!');
              }}
              style={{
                background: '#047857',
                color: '#ffffff',
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #10b981',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Lic. Pérez (Enfermera)
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('demo.farmaceutico@saludya.com.ar');
                setPassword('SaludYaDemo2026!');
              }}
              style={{
                background: '#047857',
                color: '#ffffff',
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #10b981',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Farm. Delgado (Farmacia)
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('demo.director@saludya.com.ar');
                setPassword('SaludYaDemo2026!');
              }}
              style={{
                background: '#047857',
                color: '#ffffff',
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #10b981',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Dra. Roldán (Directora)
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '0.88rem',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>¿Sos paciente? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>
            Ingresá aquí al Portal de Pacientes
          </Link>
        </div>
      </form>
    </div>
  );
}
