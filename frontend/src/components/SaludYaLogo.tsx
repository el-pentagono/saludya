interface SaludYaLogoProps {
  className?: string;
  size?: number;
}

export const SaludYaLogo = ({ className = 'w-8 h-8', size }: SaludYaLogoProps) => {

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="SaludYa — El Pentágono Digital"
    >
      <defs>
        <linearGradient id="syGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="syCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="syGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Pentágono Exterior Base (El Pentágono Digital) */}
      <polygon
        points="32,4 60,24 49,58 15,58 4,24"
        stroke="url(#syGoldGrad)"
        strokeWidth="2.8"
        fill="#1A1D21"
        strokeLinejoin="round"
      />

      {/* Pentágono Interior Geométrico */}
      <polygon
        points="32,13 51,27 44,51 20,51 13,27"
        stroke="#1E293B"
        strokeWidth="1.4"
        fill="#0D1322"
        strokeLinejoin="round"
      />

      {/* Vértices Dorados */}
      <circle cx="32" cy="4" r="2.8" fill="#F59E0B" />
      <circle cx="60" cy="24" r="2.8" fill="#F59E0B" />
      <circle cx="49" cy="58" r="2.8" fill="#F59E0B" />
      <circle cx="15" cy="58" r="2.8" fill="#F59E0B" />
      <circle cx="4" cy="24" r="2.8" fill="#F59E0B" />

      {/* Cruz Médica / Pulso Vital Pentagonal SaludYa */}
      <line
        x1="32"
        y1="19"
        x2="32"
        y2="45"
        stroke="url(#syCyanGrad)"
        strokeWidth="3.8"
        strokeLinecap="round"
        filter="url(#syGlow)"
      />
      <line
        x1="19"
        y1="32"
        x2="45"
        y2="32"
        stroke="url(#syCyanGrad)"
        strokeWidth="3.8"
        strokeLinecap="round"
        filter="url(#syGlow)"
      />

      {/* Trazo de Pulso Cardíaco Dinámico en Oro */}
      <path
        d="M 22,32 L 27,32 L 30,25 L 34,39 L 37,32 L 42,32"
        fill="none"
        stroke="url(#syGoldGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Núcleo Vital Central */}
      <circle cx="32" cy="32" r="3.2" fill="#00D2FF" filter="url(#syGlow)" />
      <circle cx="32" cy="32" r="1.5" fill="#FFFFFF" />
    </svg>
  );
};

export default SaludYaLogo;
