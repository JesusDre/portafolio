// ─────────────────────────────────────────────────────────────
//  Contenido del portafolio. Edita aquí sin tocar el resto.
// ─────────────────────────────────────────────────────────────

window.PROFILE = {
  name: "Jesus Juarez",
  fullName: "Jesus Juarez",
  handle: "JesusDre",
  role: "Desarrollador full-stack",
  location: "Morelos, México",
  github: "https://github.com/JesusDre",
  email: "juarez.jesus.dev@gmail.com",
  linkedin: "https://www.linkedin.com/in/jesus-juarez-perez-079191276/",
  headline:
    "Construyo aplicaciones de punta a punta: arquitectura, base de datos, API, interfaz y despliegue en la nube.",
  about: [
    "Desarrollador full-stack enfocado en código limpio, documentado y testeable, con interés en soluciones escalables y de alto rendimiento.",
    "Trabajo con alta autonomía en entornos remotos y aprovecho a fondo las herramientas de IA para diseñar pruebas, depurar y refactorizar más rápido sin perder calidad.",
    "Fuera del código: aprendo idiomas y viajo en motocicleta.",
  ],
  // Cada categoría se muestra como un bloque en PERFIL
  stack: [
    { k: "Lenguajes", v: ["Java", "Python", "JavaScript", "SQL", "HTML", "CSS"] },
    { k: "Frameworks backend", v: ["Spring Boot 3", "Django", "Django REST", "JUnit"] },
    { k: "Frontend y móvil", v: ["React", "Bootstrap 5"] },
    { k: "Bases de datos", v: ["MySQL", "MongoDB", "DynamoDB", "Amazon RDS"] },
    { k: "Arquitecturas", v: ["APIs REST", "Microservicios", "Contenedores", "Auth JWT + 2FA", "Modelado ERD"] },
    { k: "DevOps y nube", v: ["Docker", "Dokploy", "AWS EC2", "AWS S3", "AWS Lambda", "AWS Amplify", "Git", "GitHub"] },
    { k: "Herramientas de IA", v: ["Claude", "Gemini", "GitHub Copilot", "Ingeniería de prompts", "Pruebas asistidas", "Depuración y refactorización"] },
    { k: "Visión por computadora", v: ["OpenCV", "YOLOv10", "ByteTrack"] },
    { k: "Metodologías", v: ["Ágil · Kanban", "Control de versiones", "Documentación técnica", "Análisis de requerimientos"] },
    { k: "Sistemas operativos", v: ["Linux", "Windows", "macOS"] },
  ],
  languages: [
    { name: "Español", level: "Nativo", value: 100 },
    { name: "Francés", level: "Intermedio", value: 60 },
    { name: "Inglés", level: "Intermedio · preparación de certificación", value: 55 },
  ],
  soft: ["Adaptabilidad", "Comunicación efectiva", "Aprendizaje continuo", "Proactivo", "Resolutivo", "Responsable"],
};

// ─────────────────────────────────────────────────────────────
//  EXPERIENCIA — hoja de personaje
//  Cada misión suma XP a los atributos. Los valores son una
//  autoevaluación: ajústalos cuando quieras.
// ─────────────────────────────────────────────────────────────
window.ATTRS = [
  { id: "back", name: "Backend" },
  { id: "front", name: "Frontend" },
  { id: "data", name: "Datos" },
  { id: "ops", name: "DevOps / Nube" },
  { id: "sec", name: "Seguridad" },
  { id: "arch", name: "Arquitectura" },
  { id: "ai", name: "IA / Visión" },
  { id: "team", name: "Gestión ágil" },
];

// Punto de partida (formación antes de la primera misión)
window.BASE = { back: 22, front: 16, data: 18, ops: 6, sec: 8, arch: 8, ai: 6, team: 10 };

window.EXPERIENCE = [
  {
    id: "cds",
    org: "Centro de Desarrollo de Software · UTEZ",
    role: "Desarrollador full-stack",
    kind: "Estadía profesional",
    period: "Abr 2025 — Ago 2025",
    title: "Visión artificial para el flujo de personas",
    points: [
      "Solución de visión por computadora en Python para analizar el flujo de personas en espacios físicos.",
      "Detección y seguimiento de trayectorias en tiempo real con OpenCV, YOLOv10 y ByteTrack.",
      "Métricas de movilidad por trayectorias y zonas de interés, con interfaz de visualización.",
      "Requerimientos, documentación técnica y seguimiento ágil con Kanban.",
    ],
    gains: { back: 10, front: 10, data: 16, ops: 4, sec: 0, arch: 8, ai: 44, team: 16 },
    loot: ["Python", "OpenCV", "YOLOv10", "ByteTrack", "Kanban"],
    achievements: ["Ojo en tiempo real", "Primer sistema en producción interna"],
  },
  {
    id: "law",
    org: "Despacho jurídico (confidencial)",
    role: "Desarrollador full-stack",
    kind: "Proyecto para cliente",
    period: "Jul 2026 — Nov 2026",
    title: "Plataforma web y móvil para un despacho de abogados",
    points: [
      "Ciclo de vida completo, del diseño al despliegue, como desarrollador único.",
      "Arquitectura del sistema y modelado de la base de datos (ERD).",
      "Backend en Java con Spring Boot, seguridad con JWT y autenticación de dos pasos (2FA).",
      "Diseño de pantallas y frontend web y móvil en React consumiendo la API REST.",
      "Despliegue en AWS: contenedores Docker en EC2 y documentos en Amazon S3.",
    ],
    gains: { back: 34, front: 28, data: 20, ops: 42, sec: 40, arch: 36, ai: 6, team: 18 },
    loot: ["Spring Boot", "React", "JWT + 2FA", "Docker", "AWS EC2", "AWS S3"],
    achievements: ["Ciclo completo en solitario", "Primer deploy en AWS", "Bóveda 2FA"],
  },
];

// Proyectos que vamos a construir. Nombres provisionales.
window.ROADMAP = [
  {
    code: "LNGA",
    name: "Lingua",
    type: "EdTech",
    tagline: "Aprender idiomas sintiendo el avance",
    stack: ["Java", "Spring Boot", "React", "PostgreSQL"],
    points: [
      "Ruta progresiva por niveles (inglés primero)",
      "Simulador TOEFL ITP con repasos dirigidos",
      "Tarjetas con repetición espaciada",
      "Rachas, ligas y dashboard de progreso",
    ],
    progress: 12,
    state: "Diseño",
  },
  {
    code: "HNGR",
    name: "Hangar",
    type: "Infraestructura",
    tagline: "Panel de hosting en contenedores para pymes",
    stack: ["Docker", "Proxy inverso", "Métricas"],
    points: [
      "Un espacio aislado por cliente",
      "Failover automático a otro VPS",
      "Recursos según el tráfico real",
      "Panel simple para administrar clientes",
    ],
    progress: 5,
    state: "Investigación",
  },
  {
    code: "TLLR",
    name: "Taller",
    type: "Constructor web",
    tagline: "Constructor de tiendas y landing pages",
    stack: ["React", "Editor visual", "Analítica"],
    points: [
      "Modo guiado (plantilla) y modo libre",
      "Arrastrar imagen, texto y secciones",
      "Visitas y ventas en un dashboard",
      "Venta directa por WhatsApp y redes",
    ],
    progress: 5,
    state: "Investigación",
  },
  {
    code: "PIV",
    name: "Proyecto IV",
    type: "Videojuego",
    tagline: "Estrategia espacial grimdark en el navegador",
    stack: ["Backend escalable", "Tiempo real"],
    points: [
      "Varias razas y recursos",
      "Historia y facciones con lore propio",
      "NPCs que viajan y reaccionan en el mapa",
      "Arquitectura pensada para escalar",
    ],
    progress: 3,
    state: "Concepto",
  },
];
