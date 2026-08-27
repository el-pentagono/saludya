# Ficha Técnica y Guía de Publicación — Google Play Console

**Aplicación**: SaludYa  
**Organización**: El Pentágono Digital  
**Package Name (Application ID)**: `com.elpentagonodigital.saludya`  
**Versión**: `1.0.0` (Version Code: `1`)  
**Fecha de Generación**: 27 de Agosto de 2026  

---

## 1. Paquete de Producción Generado

- **Archivo**: `SaludYa-release.aab` (Android App Bundle firmado)
- **Ruta local**: `/Users/gastongonzalez/proyectos/saludya/frontend/final_console_upload/SaludYa-release.aab`
- **Tamaño**: ~4.7 MB
- **Esquema de firma**: V1, V2 y V3 habilitados con certificado RSA 2048 bits válido hasta Enero de 2054.
- **Huella SHA-256 del Keystore**:
  `4B:57:CD:8A:27:F4:63:2A:22:2D:53:1E:9B:A4:90:6A:08:D3:69:70:97:EB:AC:6A:F3:6F:2C:DD:E0:B6:99:D5`
- **Huella SHA-1 del Keystore**:
  `16:21:DE:5E:E6:BA:95:99:6D:52:32:EA:6A:F0:57:83:FA:53:D9:22`

---

## 2. Assets Gráficos Incluidos en `final_console_upload/`

| Archivo | Dimensiones | Requisito de Consola | Estado |
| :--- | :--- | :--- | :--- |
| `icon-512.png` | 512 x 512 px (PNG 32-bit) | Ícono de la aplicación en alta resolución | ✓ Listo |
| `feature-graphic.png` | 1024 x 500 px (PNG) | Gráfico de funciones promocional | ✓ Listo |
| `screenshot-1.png` | 1080 x 2400 px (PNG) | Captura Teléfono: Mi Familia (&lt;16 años) | ✓ Listo |
| `screenshot-2.png` | 1080 x 2400 px (PNG) | Captura Teléfono: Agendamiento Dinámico | ✓ Listo |
| `screenshot-3.png` | 1080 x 2400 px (PNG) | Captura Teléfono: Portal Profesional | ✓ Listo |

---

## 3. Checklist de Configuración en Google Play Console

### A. Subida del Bundle
1. Ir a **Producción** (o Pruebas cerradas / abiertas).
2. Crear nueva versión y arrastrar el archivo:  
   `SaludYa-release.aab`.

### B. Contenido de la Ficha Principal de Play Store
- **Nombre de la app**: `SaludYa — Salud Digital & Gestión Familiar`
- **Descripción breve (máx 80 caracteres)**:  
  `Turnos dinámicos, historia clínica digital y gestión de salud de menores a cargo.`
- **Descripción completa**:
  > SaludYa es la plataforma integral de salud digital de El Pentágono Digital. Permite a los pacientes gestionar su salud y la de su grupo familiar con la máxima seguridad, confidencialidad y rapidez.
  > 
  > Características principales:
  > • Gestión Familiar: Registro y seguimiento de fichas pediátricas de menores de 16 años con consentimiento explícito auditable y verificación documental.
  > • Agendamiento Dinámico Inteligente: Reserva de turnos en 1 clic mediante cruce automático de disponibilidad médica y personal.
  > • Portal de Pacientes: Acceso a recetas digitales, órdenes de estudio, historia clínica completa y carnet de vacunación.
  > • Portal de Profesionales de Salud: Triaje asistencial, atención de consultas, prescripción digital y seguimiento de tratamientos.
  > • Cumplimiento normativo y cifrado de datos de extremo a extremo.

### C. Declaración de Políticas para Familias y Menores (Crítico)
- En **Audiencia objetivo y contenido**:
  - Declarar que la app está dirigida a **Adultos (padres/madres/tutores)** que administran la salud de sus hijos menores.
  - Marcar que la app cuenta con **Consentimiento Informado Previo y Auditable** para el tratamiento de datos de menores de 16 años.
  - La app **no contiene anuncios dirigidos a niños** ni recolección de datos no consentida.

### D. Seguridad de los Datos (Data Safety Section)
- **Datos de salud y estado físico**: Recopilados con fines de funcionalidad médica y gestión de salud (cifrados en tránsito, no se comparten con terceros ni para fines publicitarios).
- **Información personal (Nombre, DNI, Email)**: Recopilada para autenticación de cuenta y emisión legal de recetas y constancias.
- **Documentos subidos (DNI / Partida de nacimiento)**: Cifrados y utilizados exclusivamente para verificar la representación jurídica y patria potestad del menor.
