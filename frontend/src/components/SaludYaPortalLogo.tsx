import React from 'react';

export interface SaludYaPortalLogoProps {
  portal: 'pacientes' | 'profesionales';
  size?: number;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  showEmblemOnly?: boolean;
}

export const SaludYaPortalLogo: React.FC<SaludYaPortalLogoProps> = ({
  portal,
  size = 32,
  layout = 'horizontal',
  className = '',
  showEmblemOnly = false,
}) => {
  const isProfesionales = portal === 'profesionales';

  if (showEmblemOnly) {
    return (
      <img
        src="/logo-emblema-saludya.jpg"
        alt={`SaludYa — ${isProfesionales ? 'Profesionales de Salud' : 'Pacientes'}`}
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        }}
      />
    );
  }

  if (layout === 'vertical') {
    return (
      <div
        className={`portal-logo-vertical ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem',
          textAlign: 'center',
        }}
      >
        <img
          src="/logo-emblema-saludya.jpg"
          alt="SaludYa Emblema"
          style={{
            width: size * 2.2,
            height: size * 2.2,
            objectFit: 'contain',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: '2px solid rgba(255,255,255,0.8)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 800,
              fontSize: '1.85rem',
              color: isProfesionales ? '#064e3b' : 'var(--color-primary-dark, #045364)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            SaludYa
          </span>
          <span
            style={{
              marginTop: '0.4rem',
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.8rem',
              borderRadius: '999px',
              background: isProfesionales
                ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
                : 'linear-gradient(135deg, #0089a8 0%, #0891b2 100%)',
              color: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            {isProfesionales ? 'Profesionales de Salud' : 'Pacientes'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`portal-logo-horizontal ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        textDecoration: 'none',
      }}
    >
      <img
        src="/logo-emblema-saludya.jpg"
        alt="SaludYa"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 800,
            fontSize: '1.25rem',
            color: '#ffffff',
            letterSpacing: '0.01em',
          }}
        >
          SaludYa
        </span>
        <span
          style={{
            marginTop: '0.15rem',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isProfesionales ? '#bbf7d0' : '#b8e4ea',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isProfesionales ? '#4ade80' : '#38bdf8',
            }}
          />
          {isProfesionales ? 'Profesionales de Salud' : 'Pacientes'}
        </span>
      </div>
    </div>
  );
};

export default SaludYaPortalLogo;
