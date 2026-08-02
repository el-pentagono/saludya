/**
 * Ícono liviano en SVG que insinúa la Estrella de la Vida (seis puntas),
 * sin reproducir el símbolo oficial. Usa currentColor para heredar el
 * color de texto del elemento contenedor.
 */
export function StarOfLifeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="50,6 89,75 11,75" fill="currentColor" />
      <polygon points="50,94 11,25 89,25" fill="currentColor" />
    </svg>
  );
}
