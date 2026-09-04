import { Link } from 'react-router-dom';
import { SaludYaPortalLogo } from '../components/SaludYaPortalLogo';

// Fecha de última actualización -- actualizar manualmente cada vez que
// cambie el contenido de esta página (no se calcula automáticamente a
// propósito: la fecha debe reflejar la última revisión real del texto).
const ULTIMA_ACTUALIZACION = '29 de agosto de 2026';

// Casilla confirmada por el responsable del proyecto -- la monitorea él
// directamente. Ver conversación de confirmación antes de este commit.
const EMAIL_CONTACTO_PRIVACIDAD = 'gustavogastongonzalez@gmail.com';

export function PrivacyPolicyPage() {
  return (
    <div className="auth-page" style={{ display: 'block', padding: '2.5rem 1.25rem' }}>
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '2.5rem',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <SaludYaPortalLogo portal="pacientes" layout="horizontal" size={30} className="privacy-logo" />
        </div>

        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Política de Privacidad de SaludYa</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>
          Última actualización: {ULTIMA_ACTUALIZACION}
        </p>

        <p>
          Esta política aplica a las dos aplicaciones de SaludYa (Portal de Pacientes y Portal de
          Profesionales de Salud), desarrolladas por El Pentágono Digital. Describe qué datos
          recolectamos, para qué los usamos, y qué derechos tenés sobre ellos.
        </p>

        <h2 style={sectionTitle}>1. Qué datos recolectamos</h2>
        <p>Según el rol de la cuenta, SaludYa recolecta:</p>
        <ul style={list}>
          <li>
            <strong>Datos de identificación:</strong> nombre, apellido, email, DNI y, opcionalmente,
            teléfono.
          </li>
          <li>
            <strong>Datos de salud:</strong> historia clínica, recetas digitales, órdenes de estudio,
            tratamientos, turnos médicos y registros de triaje, según corresponda a tu rol como
            paciente o profesional de la salud.
          </li>
          <li>
            <strong>Datos de menores a cargo:</strong> si usás la función "Mi Familia", se registran
            datos de salud de tus hijos o menores a cargo, junto con documentación (DNI o partida de
            nacimiento) para verificar tu vínculo legal y patria potestad.
          </li>
        </ul>
        <p>
          SaludYa <strong>no</strong> recolecta datos de ubicación geográfica, no integra ningún SDK
          de publicidad ni de analítica de terceros, y no procesa información financiera o de medios
          de pago.
        </p>

        <h2 style={sectionTitle}>2. Para qué usamos tus datos</h2>
        <ul style={list}>
          <li>Prestar el servicio: gestión de turnos, recetas digitales, historia clínica y seguimiento de tratamientos.</li>
          <li>Verificar tu identidad y, cuando corresponda, tu vínculo legal con un menor a cargo.</li>
          <li>Permitir que el personal de salud habilitado (médicos, enfermería, farmacia, dirección y auditoría) acceda a la información clínica necesaria para tu atención.</li>
        </ul>
        <p>No usamos tus datos con fines publicitarios ni los vendemos ni cedemos a terceros ajenos a la prestación del servicio.</p>

        <h2 style={sectionTitle}>3. Quién accede a tus datos</h2>
        <p>
          Los datos de salud de un paciente son accedidos únicamente por el personal de salud
          habilitado que interviene en su atención, a través del Portal de Profesionales, bajo
          confidencialidad profesional. No compartimos datos personales ni de salud con terceros con
          fines comerciales o publicitarios.
        </p>

        <h2 style={sectionTitle}>4. Menores de edad</h2>
        <p>
          SaludYa está diseñada para ser utilizada por personas adultas -- pacientes, madres, padres,
          tutores legales y profesionales de la salud. La gestión de perfiles de salud de menores de
          16 años dentro de "Mi Familia" la realiza exclusivamente el adulto responsable, quien debe
          declarar y aceptar expresamente su vínculo legal antes de registrar al menor. Los menores no
          operan la aplicación directamente.
        </p>

        <h2 style={sectionTitle}>5. Seguridad</h2>
        <p>
          Toda la comunicación entre la aplicación y nuestros servidores viaja cifrada (HTTPS). Las
          contraseñas se almacenan con hash criptográfico, nunca en texto plano.
        </p>

        <h2 style={sectionTitle}>6. Tus derechos</h2>
        <p>
          Podés solicitar acceso, rectificación, actualización o eliminación de tus datos personales
          escribiendo a{' '}
          <a href={`mailto:${EMAIL_CONTACTO_PRIVACIDAD}`} style={{ color: 'var(--color-primary)' }}>
            {EMAIL_CONTACTO_PRIVACIDAD}
          </a>
          . Actualmente estas solicitudes se procesan de forma manual por nuestro equipo; no hay un
          plazo automático de eliminación de cuenta.
        </p>

        <h2 style={sectionTitle}>7. Cambios a esta política</h2>
        <p>
          Si modificamos esta política de forma significativa, actualizaremos la fecha al inicio de
          esta página.
        </p>

        <h2 style={sectionTitle}>8. Contacto</h2>
        <p>
          Ante cualquier consulta sobre privacidad o tratamiento de datos personales, escribinos a{' '}
          <a href={`mailto:${EMAIL_CONTACTO_PRIVACIDAD}`} style={{ color: 'var(--color-primary)' }}>
            {EMAIL_CONTACTO_PRIVACIDAD}
          </a>
          .
        </p>

        <p style={{ marginTop: '2.5rem' }}>
          <Link to="/login" style={{ color: 'var(--color-primary)' }}>
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: '1.1rem',
  marginTop: '2rem',
  marginBottom: '0.6rem',
};

const list: React.CSSProperties = {
  paddingLeft: '1.25rem',
  lineHeight: 1.7,
};
