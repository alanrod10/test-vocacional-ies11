export type AreaKey = "Salud y Bienestar" | "Tecnología e Innovación" | "Industria, Ambiente y Seguridad" | "Gastronomía, Turismo y Patrimonio" | "Diseño y Arte Aplicado";

export const INTEREST_KEYS = ["R", "I", "A", "S", "E", "C"] as const;
export type InterestKey = (typeof INTEREST_KEYS)[number];
export type InterestVector = Record<InterestKey, number>;
export type QuestionMode = "choice" | "binary" | "slider" | "preference";
export type ProgramStatus = "activa" | "retirada" | "pendiente_de_modelado" | "provisional";

export const INTEREST_META: Record<InterestKey, { label: string; description: string }> = {
  R: { label: "Realista", description: "hacer, construir y aplicar técnicas" },
  I: { label: "Investigativo", description: "analizar, investigar y resolver" },
  A: { label: "Artístico", description: "crear, diseñar y comunicar" },
  S: { label: "Social", description: "acompañar, enseñar y cuidar" },
  E: { label: "Emprendedor", description: "impulsar, liderar y vincular" },
  C: { label: "Convencional", description: "organizar, registrar y planificar" },
};

const V = (values: Partial<InterestVector>): InterestVector => ({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0, ...values });

export type ProgramProfile = {
  id: string;
  name: string;
  status: ProgramStatus;
  area: AreaKey;
  profile: string;
  professionalProfile: string;
  graduateRole: string;
  tasks: string[];
  field: string;
  subjects: string[];
  interests: InterestVector;
};

export type ProgramDefinition = ProgramProfile;

export type TestOption = {
  id: string;
  label: string;
  interests: InterestVector;
  neutral?: boolean;
};

export type TestQuestion = {
  id: string;
  numericId: number;
  icon: string;
  prompt: string;
  mode: QuestionMode;
  options: TestOption[];
  institutional?: boolean;
  sliderLabels?: { min: string; max: string };
};

export const AREA_META: Record<AreaKey, { icon: string; color: string; soft: string }> = {
  "Salud y Bienestar": { icon: "🩺", color: "#1588b9", soft: "#dff3ff" },
  "Tecnología e Innovación": { icon: "⌘", color: "#315fc5", soft: "#e5edff" },
  "Industria, Ambiente y Seguridad": { icon: "◒", color: "#176fa3", soft: "#d9eefb" },
  "Gastronomía, Turismo y Patrimonio": { icon: "◌", color: "#1297b8", soft: "#d8f4f8" },
  "Diseño y Arte Aplicado": { icon: "✦", color: "#3d76c3", soft: "#e2eeff" },
};

export const INSTITUTION_INFO = {
  name: "Instituto de Educación Superior N.° 11",
  offer: "Oferta académica vigente: 17 Tecnicaturas Superiores.",
  address: "Alvear 1151, San Salvador de Jujuy.",
  enrolment: "Preinscripción: consultá la plataforma NEXO de Educación de Jujuy y los canales institucionales para fechas vigentes.",
  website: "https://ies11jujuy.wixsite.com/misitio",
  sources: [
    "https://educacion.jujuy.gob.ar/2025/11/26/inician-las-preinscripciones-para-el-ingreso-a-carreras-de-educacion-superior-2026/",
    "https://unjudiario.unju.edu.ar/destacadas/el-ies-n-11-presenta-su-oferta-academica-2026-con-19-tecnicaturas-superiores",
    "https://ies11jujuy.wixsite.com/misitio",
  ],
};

function joinWithAnd(values: string[]) {
  if (values.length < 2) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} y ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} y ${values.at(-1)}`;
}

function buildProfessionalProfile(profile: string, subjects: string[], tasks: string[]) {
  return `${profile} Desde una mirada técnica, la formación articula ${joinWithAnd(subjects)} para comprender procesos, tomar decisiones fundamentadas y trabajar con criterios de calidad. En las prácticas profesionalizantes se desarrollan tareas como: ${tasks.join(" ")}`;
}

const P = (
  id: string,
  name: string,
  status: ProgramStatus,
  area: AreaKey,
  interests: InterestVector,
  profile: string,
  graduateRole: string,
  subjects: string[],
  tasks: string[],
  field: string,
): ProgramDefinition => ({
  id,
  name,
  status,
  area,
  interests,
  profile,
  professionalProfile: buildProfessionalProfile(profile, subjects, tasks),
  graduateRole,
  subjects,
  tasks,
  field,
});

export const PROGRAM_CATALOG: ProgramDefinition[] = [
  P(
    "ts_enfermeria",
    "TS en Enfermería",
    "activa",
    "Salud y Bienestar",
    V({ R: 1, I: 1, S: 5, C: 1 }),
    "Integra cuidados, observación clínica, prevención y comunicación respetuosa con pacientes, familias y equipos de salud.",
    "Al finalizar, contarías con una formación técnica para colaborar en el cuidado integral de personas en distintas etapas de la vida, siempre dentro de los alcances y protocolos profesionales vigentes.",
    ["Fundamentos de Enfermería", "Anatomía y Fisiología", "Prácticas profesionalizantes"],
    ["Brindar cuidados básicos y registrar la evolución bajo protocolos.", "Colaborar en acciones de prevención, educación para la salud y promoción del autocuidado.", "Trabajar de manera coordinada con equipos de salud y familias."],
    "Hospitales, centros de salud, sanatorios, escuelas, empresas y atención domiciliaria en Jujuy y el NOA.",
  ),
  P(
    "ts_administracion_salud",
    "TS en Administración en Servicios de Salud",
    "activa",
    "Salud y Bienestar",
    V({ I: 1, S: 2, E: 2, C: 5 }),
    "Combina organización, registros y atención para que los servicios de salud puedan funcionar de forma ordenada y centrada en las personas.",
    "Al finalizar, podrías aportar al funcionamiento administrativo de instituciones de salud mediante la gestión responsable de información, turnos, recursos y circuitos de atención.",
    ["Administración sanitaria", "Sistemas de información", "Gestión de recursos"],
    ["Organizar turnos, documentación y circuitos administrativos.", "Colaborar con el seguimiento de recursos, prestaciones e indicadores.", "Mejorar procesos de atención cuidando la confidencialidad de la información."],
    "Hospitales, clínicas, obras sociales, municipios y áreas administrativas de salud de Jujuy y el NOA.",
  ),
  P(
    "ts_agente_sanitario",
    "TS en Agente Sanitario y Promotor de la Salud",
    "activa",
    "Salud y Bienestar",
    V({ R: 1, I: 1, S: 5, E: 2, C: 1 }),
    "Acerca prevención, información confiable y redes de cuidado a comunidades, escuelas y familias desde una mirada territorial.",
    "Al finalizar, podrías participar en acciones de promoción y prevención de la salud, articulando necesidades de la comunidad con programas y equipos interdisciplinarios.",
    ["Salud comunitaria", "Promoción y prevención", "Territorio y participación"],
    ["Planificar actividades de educación y prevención en territorio.", "Relevar necesidades y orientar a las personas hacia servicios de salud.", "Fortalecer redes comunitarias y hábitos de cuidado."],
    "Centros de salud, programas sanitarios, escuelas, ONGs y comunidades de Jujuy y el NOA.",
  ),
  P(
    "ts_estadisticas_salud",
    "TS en Estadísticas de Salud",
    "activa",
    "Salud y Bienestar",
    V({ I: 4, S: 1, E: 1, C: 5 }),
    "Transforma registros en información confiable para comprender situaciones sanitarias y apoyar mejores decisiones.",
    "Al finalizar, podrías trabajar con datos, indicadores y registros sanitarios, aplicando criterios de calidad, confidencialidad y presentación clara de resultados.",
    ["Bioestadística", "Registros sanitarios", "Análisis de datos"],
    ["Ordenar y controlar la calidad de registros sanitarios.", "Calcular indicadores y elaborar reportes para equipos de gestión.", "Comunicar hallazgos con tablas, gráficos y explicaciones comprensibles."],
    "Hospitales, ministerios, obras sociales, programas de salud e investigación en Jujuy y el NOA.",
  ),
  P(
    "ts_asistente_odontologico",
    "TS en Asistente Odontológico",
    "activa",
    "Salud y Bienestar",
    V({ R: 2, I: 2, S: 4, C: 3 }),
    "Integra atención al paciente, preparación de instrumental y cuidados de bioseguridad para acompañar el trabajo odontológico.",
    "Al finalizar, podrías asistir en la organización del consultorio y en procedimientos de apoyo, aplicando normas de higiene, esterilización y trato respetuoso.",
    ["Asistencia odontológica", "Bioseguridad", "Instrumental y esterilización"],
    ["Preparar y acondicionar el consultorio e instrumental.", "Acompañar la recepción y orientación de pacientes.", "Aplicar rutinas de limpieza, esterilización y bioseguridad."],
    "Consultorios, clínicas y centros de salud públicos y privados de Jujuy y el NOA.",
  ),
  P(
    "ts_gerontologia",
    "TS en Gerontología",
    "activa",
    "Salud y Bienestar",
    V({ A: 1, S: 5, E: 1, C: 2 }),
    "Promueve la autonomía, los vínculos y la calidad de vida de personas mayores desde una perspectiva de derechos y cuidado integral.",
    "Al finalizar, podrías colaborar en propuestas de acompañamiento, recreación y cuidado para personas mayores, reconociendo sus historias, decisiones y redes afectivas.",
    ["Envejecimiento y sociedad", "Cuidados gerontológicos", "Intervención comunitaria"],
    ["Diseñar actividades que fortalezcan la autonomía y la participación.", "Acompañar rutinas y vínculos en coordinación con equipos y familias.", "Reconocer señales de necesidad y derivar según protocolos."],
    "Residencias, gerontocentros, hospitales y programas sociales de Jujuy y el NOA.",
  ),
  P(
    "ts_laboratorio_analisis_clinico",
    "TS en Laboratorio de Análisis Clínico",
    "activa",
    "Salud y Bienestar",
    V({ R: 2, I: 5, S: 1, C: 3 }),
    "Combina precisión técnica, análisis y control de procedimientos para procesar muestras que aportan datos relevantes al diagnóstico.",
    "Al finalizar, podrías desempeñarte en tareas técnicas de laboratorio, respetando protocolos de bioseguridad, trazabilidad y control de calidad establecidos.",
    ["Química clínica", "Microbiología", "Técnicas de laboratorio"],
    ["Preparar, identificar y procesar muestras según protocolos.", "Realizar controles de calidad y registrar procedimientos.", "Colaborar con la emisión ordenada de información para equipos de salud."],
    "Laboratorios, hospitales, bancos de sangre e industrias relacionadas de Jujuy y el NOA.",
  ),
  P(
    "ts_acompanamiento_terapeutico",
    "TS en Acompañamiento Terapéutico",
    "pendiente_de_modelado",
    "Salud y Bienestar",
    V({ S: 5, I: 2, A: 1, C: 1 }),
    "Integra el sostenimiento cotidiano, la revinculación social y el fortalecimiento de la autonomía de personas en situaciones de vulnerabilidad o tratamientos de salud.",
    "Al finalizar, podrías colaborar en equipos interdisciplinarios facilitando la contención, la autonomía y la participación en el entorno cotidiano e institucional.",
    ["Salud mental comunitaria", "Psicopatología y vínculos", "Estrategias de acompañamiento"],
    ["Acompañar actividades cotidianas y promover la autonomía.", "Coordinar observaciones y registros con el equipo tratante.", "Intervenir en situaciones de contención emocional y revinculación social."],
    "Centros de salud mental, instituciones educativas, dispositivos comunitarios y acompañamiento domiciliario en Jujuy y el NOA.",
  ),
  P(
    "ts_ciencias_datos_ia",
    "TS en Ciencias de Datos e Inteligencia Artificial",
    "activa",
    "Tecnología e Innovación",
    V({ I: 5, A: 1, E: 2, C: 3 }),
    "Transforma datos en conocimiento y diseña soluciones inteligentes para responder preguntas concretas de organizaciones y comunidades.",
    "Al finalizar, podrías participar en proyectos de datos e inteligencia artificial, desde la preparación de información hasta el análisis, la visualización y el desarrollo responsable de modelos.",
    ["Programación", "Estadística aplicada", "Modelos de inteligencia artificial"],
    ["Preparar, explorar y visualizar datos para detectar patrones.", "Construir prototipos de análisis o modelos de inteligencia artificial.", "Comunicar resultados y límites de una solución basada en datos."],
    "Empresas tecnológicas, salud, banca, gobierno, consultoría y trabajo remoto desde Jujuy y el NOA.",
  ),
  P(
    "ts_desarrollo_software",
    "TS en Desarrollo de Software",
    "activa",
    "Tecnología e Innovación",
    V({ R: 1, I: 5, A: 1, E: 1, C: 2 }),
    "Diseña, programa, prueba y mejora aplicaciones que responden a necesidades reales de usuarios y organizaciones.",
    "Al finalizar, podrías integrarte a equipos de desarrollo para construir y mantener soluciones web, móviles o de gestión, utilizando buenas prácticas de programación.",
    ["Programación", "Bases de datos", "Desarrollo web y móvil"],
    ["Programar y depurar funcionalidades de una aplicación.", "Diseñar estructuras de datos y conexiones con bases de datos.", "Probar, documentar y mejorar experiencias digitales."],
    "Estudios de software, startups, organismos públicos y trabajo remoto desde Jujuy y el NOA.",
  ),
  P(
    "ts_seguridad_higiene_laboral",
    "TS en Seguridad e Higiene Laboral",
    "activa",
    "Industria, Ambiente y Seguridad",
    V({ R: 4, I: 2, S: 1, E: 1, C: 4 }),
    "Observa condiciones de trabajo, identifica riesgos y ayuda a construir entornos más seguros mediante prevención y cumplimiento de normas.",
    "Al finalizar, podrías colaborar en la prevención de riesgos laborales, relevando situaciones, proponiendo mejoras y participando en acciones de capacitación y control.",
    ["Higiene industrial", "Prevención de riesgos", "Legislación laboral"],
    ["Identificar peligros y registrar condiciones de trabajo.", "Acompañar capacitaciones y planes de prevención.", "Colaborar con inspecciones, señalización y documentación de seguridad."],
    "Minería, industria, construcción, municipios, consultoras y ART de Jujuy y el NOA.",
  ),
  P(
    "ts_gestion_energias_renovables",
    "TS en Gestión de Energías Renovables",
    "activa",
    "Industria, Ambiente y Seguridad",
    V({ R: 5, I: 3, A: 1, S: 1, E: 1, C: 1 }),
    "Participa en soluciones de energía sustentable vinculando conocimiento técnico, cuidado ambiental y necesidades territoriales.",
    "Al finalizar, podrías colaborar en el relevamiento, operación, mantenimiento y gestión básica de proyectos de energías renovables, con foco en eficiencia y sostenibilidad.",
    ["Sistemas energéticos", "Energía solar", "Gestión ambiental"],
    ["Relevar condiciones para soluciones energéticas sustentables.", "Acompañar tareas técnicas de operación y mantenimiento.", "Registrar consumos, indicadores y aspectos ambientales de proyectos."],
    "Parques solares, empresas eléctricas, consultoras, municipios y proyectos ambientales de Jujuy y el NOA.",
  ),
  P(
    "ts_tecnologia_alimentos",
    "TS en Tecnología de los Alimentos",
    "activa",
    "Industria, Ambiente y Seguridad",
    V({ R: 3, I: 4, A: 1, E: 1, C: 3 }),
    "Cuida la calidad, inocuidad y mejora de procesos para transformar materias primas en alimentos seguros y consistentes.",
    "Al finalizar, podrías colaborar en el control y mejora de procesos de elaboración, aplicando buenas prácticas de manufactura, análisis básicos y registros de calidad.",
    ["Química de alimentos", "Inocuidad alimentaria", "Control de calidad"],
    ["Controlar etapas de elaboración, conservación y envasado.", "Aplicar buenas prácticas de higiene e inocuidad.", "Registrar resultados y apoyar mejoras de calidad."],
    "Industrias alimentarias, laboratorios, bromatología y emprendimientos de Jujuy y el NOA.",
  ),
  P(
    "ts_cocinas_regionales",
    "TS en Cocinas Regionales y Cultura Alimentaria",
    "activa",
    "Gastronomía, Turismo y Patrimonio",
    V({ R: 3, I: 1, A: 3, S: 1, E: 2, C: 1 }),
    "Crea propuestas gastronómicas que ponen en valor ingredientes, saberes, técnicas y relatos del territorio.",
    "Al finalizar, podrías diseñar y elaborar propuestas culinarias regionales, articulando técnica, identidad cultural, organización de cocina y experiencia de comensales.",
    ["Cocinas regionales", "Técnicas culinarias", "Cultura alimentaria"],
    ["Planificar y elaborar preparaciones con identidad local.", "Organizar estaciones de trabajo, insumos y tiempos de cocina.", "Diseñar experiencias gastronómicas para emprendimientos y eventos."],
    "Restaurantes, hoteles, eventos, emprendimientos y turismo gastronómico de Jujuy y el NOA.",
  ),
  P(
    "ts_hoteleria",
    "TS en Hotelería",
    "activa",
    "Gastronomía, Turismo y Patrimonio",
    V({ R: 1, A: 2, S: 3, E: 4, C: 3 }),
    "Gestiona servicios de alojamiento y experiencias de huéspedes, coordinando personas, espacios y procesos cotidianos.",
    "Al finalizar, podrías colaborar en la operación y gestión de establecimientos de alojamiento, cuidando la calidad del servicio, la organización y la atención al visitante.",
    ["Operación hotelera", "Servicios al huésped", "Gestión de alojamientos"],
    ["Organizar reservas, recepción y circuitos de atención.", "Coordinar servicios y resolver necesidades de huéspedes.", "Apoyar la planificación de recursos y estándares de calidad."],
    "Hoteles, hosterías, termas y alojamientos de Jujuy y destinos turísticos del NOA.",
  ),
  P(
    "ts_turismo",
    "TS en Turismo",
    "activa",
    "Gastronomía, Turismo y Patrimonio",
    V({ R: 1, I: 1, A: 2, S: 3, E: 4, C: 2 }),
    "Planifica, diseña y gestiona productos, servicios y destinos turísticos que vinculan visitantes, comunidades, patrimonio y desarrollo local sostenible.",
    "Al finalizar, podrías colaborar en el diseño, promoción y coordinación de propuestas turísticas, articulando prestadores, comunidades y experiencias con una mirada responsable sobre el territorio.",
    ["Planificación turística", "Gestión de destinos", "Turismo sustentable"],
    ["Diseñar recorridos y servicios turísticos con objetivos claros.", "Articular prestadores, comunidades y experiencias de visitantes.", "Aportar a la promoción y gestión sostenible de destinos."],
    "Agencias, operadoras, municipios y organismos de turismo de Jujuy y el NOA. Su foco es planificar y gestionar experiencias, servicios y destinos.",
  ),
  P(
    "ts_guia_turismo",
    "TS en Guía de Turismo",
    "retirada",
    "Gastronomía, Turismo y Patrimonio",
    V({ R: 2, I: 1, A: 2, S: 4, E: 3 }),
    "Conduce grupos e interpreta en terreno paisajes, historia y cultura para construir recorridos claros, seguros y significativos.",
    "Al finalizar, podrías guiar grupos y comunicar información sobre atractivos, patrimonio y normas de cuidado, adaptando cada recorrido a diferentes públicos y situaciones reales.",
    ["Guiado e interpretación", "Patrimonio regional", "Técnicas de conducción"],
    ["Conducir grupos con organización y criterios de seguridad.", "Interpretar paisajes, historia y cultura de manera accesible.", "Resolver situaciones de recorrido y orientar a visitantes."],
    "Agencias, sitios patrimoniales, ecoturismo y trabajo independiente en Jujuy y el NOA. Su foco es acompañar, orientar e interpretar durante el recorrido.",
  ),
  P(
    "ts_museologia",
    "TS en Museología",
    "activa",
    "Gastronomía, Turismo y Patrimonio",
    V({ R: 1, I: 2, A: 5, S: 2, E: 1, C: 2 }),
    "Diseña experiencias expositivas y acciones culturales que conectan colecciones, historias y públicos diversos.",
    "Al finalizar, podrías colaborar en museos y espacios culturales mediante la documentación, la mediación y el diseño de propuestas que acerquen el patrimonio a la comunidad.",
    ["Museografía", "Diseño de exposiciones", "Educación en museos"],
    ["Participar en el montaje y comunicación de exposiciones.", "Diseñar recursos para que distintos públicos comprendan una colección.", "Colaborar con registros básicos y actividades de mediación cultural."],
    "Museos, centros culturales, universidades y proyectos de mediación cultural de Jujuy y el NOA.",
  ),
  P(
    "ts_museologia_gestion_patrimonial",
    "TS en Museología y Gestión Patrimonial",
    "retirada",
    "Gastronomía, Turismo y Patrimonio",
    V({ R: 2, I: 3, A: 4, S: 3, E: 2, C: 2 }),
    "Investiga, conserva y gestiona patrimonio cultural y natural, conectando documentación, cuidado y participación comunitaria.",
    "Al finalizar, podrías colaborar en proyectos de identificación, conservación preventiva y puesta en valor de bienes patrimoniales junto a instituciones y comunidades.",
    ["Gestión patrimonial", "Conservación preventiva", "Documentación de colecciones"],
    ["Documentar bienes y relatos asociados al patrimonio.", "Aplicar criterios de conservación preventiva y manejo responsable.", "Participar en proyectos de gestión cultural y territorial."],
    "Museos, archivos, áreas de cultura y patrimonio, y proyectos territoriales de Jujuy y el NOA.",
  ),
  P(
    "ts_diseno_indumentaria",
    "TS en Diseño de Indumentaria",
    "activa",
    "Diseño y Arte Aplicado",
    V({ R: 2, I: 1, A: 5, E: 2, C: 1 }),
    "Crea prendas y colecciones que combinan investigación, moldería, confección, textiles e identidad artesanal andina.",
    "Al finalizar, podrías diseñar y desarrollar propuestas de indumentaria desde la idea hasta el prototipo, integrando criterios estéticos, técnicos y de producción.",
    ["Diseño de indumentaria", "Moldería y confección", "Textiles y producción"],
    ["Investigar referencias, materiales y necesidades de uso.", "Desarrollar bocetos, moldes, prototipos y fichas técnicas.", "Planificar pequeñas producciones o proyectos de marca."],
    "Talleres, marcas propias, cooperativas textiles y emprendimientos de moda de Jujuy y el NOA.",
  ),
];

export const PROGRAM_BY_ID: Record<string, ProgramDefinition> = Object.fromEntries(PROGRAM_CATALOG.map((p) => [p.id, p]));
export const PROGRAM_BY_NAME: Record<string, ProgramDefinition> = Object.fromEntries(PROGRAM_CATALOG.map((p) => [p.name, p]));

export const ACTIVE_PROGRAMS = PROGRAM_CATALOG.filter((p) => p.status === "activa");
export const ACTIVE_PROGRAM_IDS = ACTIVE_PROGRAMS.map((p) => p.id);
export const ACTIVE_PROGRAM_NAMES = ACTIVE_PROGRAMS.map((p) => p.name);

export const PROGRAMS: Record<string, ProgramProfile> = Object.fromEntries(ACTIVE_PROGRAMS.map((p) => [p.name, p]));
export const PROGRAM_NAMES = ACTIVE_PROGRAM_NAMES;

export const ALL_PROGRAMS: Record<string, ProgramProfile> = Object.fromEntries(PROGRAM_CATALOG.map((p) => [p.name, p]));
export const ALL_PROGRAM_NAMES = PROGRAM_CATALOG.map((p) => p.name);

export const LEGACY_PROGRAMS: Record<string, ProgramProfile> = Object.fromEntries(
  PROGRAM_CATALOG.filter((p) => p.status !== "pendiente_de_modelado").map((p) => [p.name, p]),
);
export const LEGACY_PROGRAM_NAMES = Object.keys(LEGACY_PROGRAMS);

export const ENGINE_VERSION = "2026.10-ids-estables";
export const LEGACY_CATALOG_VERSION = "2026.08-legado-19";
export const EXPO_CATALOG_VERSION = "2026.08-oficial-18";
export const CATALOG_VERSION = "2026.10-oficial-17";
export const RETIRED_PROGRAM = "TS en Museología y Gestión Patrimonial";
export const RETIRED_PROGRAMS = ["TS en Museología y Gestión Patrimonial", "TS en Guía de Turismo"];

export const NEUTRAL_RESPONSE_LABEL = "Ninguna de estas opciones me representa";
export const QUESTIONNAIRE_VERSION = "2026.08-redaccion-clara";
export const ORIGINAL_QUESTIONNAIRE_VERSION = "2026.08-original";

const ORIGINAL_OPTION_LABELS: readonly (readonly string[])[] = [
  ["Crear una identidad visual y una forma atractiva de contar la idea", "Construir un prototipo y comprobar cómo funciona", "Investigar el problema y ordenar datos antes de decidir", "Organizar tiempos, recursos y acuerdos para que el grupo avance"],
  ["Sí; me gusta cuidar, explicar y acompañar", "Prefiero aportar desde la técnica, el análisis o la organización"],
  ["Observar a las personas involucradas y entender qué necesitan", "Reunir datos, compararlos y buscar patrones antes de decidir", "Probar materiales, herramientas o un prototipo hasta que funcione", "Pensar una forma original y clara de presentar la solución"],
  ["Controlar que un alimento sea seguro y de buena calidad", "Crear una experiencia gastronómica con sabores locales", "Diseñar una prenda inspirada en textiles y cultura andina", "Montar una exposición que conecte objetos, historias y personas"],
  ["Explorar datos para descubrir patrones y tomar mejores decisiones", "Programar una solución funcional y probarla paso a paso", "Diseñar una interfaz clara y agradable para quien la use", "Definir criterios, registros y pruebas para asegurar calidad"],
  ["Coordinar recepción, habitaciones y equipos para atender bien a cada huésped", "Diseñar un circuito responsable que conecte atractivos y comunidad", "Interpretar paisajes y cultura para crear recorridos memorables", "Crear una propuesta culinaria regional para visitantes"],
  ["Inventariar, diagnosticar y planificar cómo conservarlos", "Crear una exhibición que conecte objetos, historias y visitantes", "Transformar símbolos regionales en una propuesta visual contemporánea", "Crear un catálogo digital claro para buscar y compartir información"],
  ["Cuidar y acompañar directamente a pacientes", "Asistir con instrumental, bioseguridad y procedimientos específicos", "Promover prevención y hábitos saludables junto a la comunidad", "Analizar muestras, registros o indicadores para mejorar decisiones"],
  ["Detectar riesgos y proponer condiciones de trabajo más seguras", "Diseñar y probar una solución de energía sustentable", "Medir procesos y asegurar calidad de productos alimentarios", "Organizar recursos, normas y controles para sostener una operación"],
  ["Seguir un protocolo, medir con cuidado y dejar un registro claro", "Programar, detectar un error y mejorar una solución hasta que funcione", "Coordinar a otras personas para que la atención salga bien", "Crear y perfeccionar una prenda, plato o propuesta visual"],
  ["Que una persona o comunidad haya comprendido algo útil y se sienta mejor acompañada", "Que exista una solución técnica, un registro confiable o una mejora verificable"],
  ["Convertir información desordenada en reportes, indicadores o decisiones claras", "Escribir, probar y mejorar una aplicación o sistema digital", "Preparar una muestra o un proceso con precisión, seguridad y trazabilidad", "Acompañar grupos, explicar un tema y adaptar la respuesta a cada persona"],
  ["Diseñar una actividad de prevención y escucha junto a una comunidad", "Organizar turnos, recursos y registros para que un servicio de salud funcione mejor", "Relevar riesgos, aplicar normas y proponer mejoras en un lugar de trabajo", "Revisar la calidad e inocuidad de un alimento antes de que llegue a las personas", "Planificar una estadía y resolver necesidades de huéspedes y equipos", "Documentar y conservar objetos o historias valiosas para una comunidad", "Idear, bocetar y confeccionar una pieza de indumentaria", "Explorar datos para responder una pregunta concreta con gráficos o un modelo"],
  ["Sí, quiero conocer la propuesta y los pasos para inscribirme", "Me interesa; quiero conversar con docentes o estudiantes", "Estoy explorando opciones y quiero seguir investigando", "Por ahora busco orientación, aunque agradezco conocer el IES N.° 11"],
];

const BASE_QUESTIONS: TestQuestion[] = [
  {
    id: "q_proposal",
    numericId: 1,
    icon: "✦",
    mode: "choice",
    prompt: "Imaginate que tu grupo tiene que crear una propuesta desde cero. ¿De qué parte te harías cargo primero?",
    options: [
      { id: "opt_visual", label: "Crear una identidad visual y contar la idea de forma atractiva", interests: V({ A: 4, E: 1 }) },
      { id: "opt_prototype", label: "Armar un prototipo y probar si funciona", interests: V({ R: 4, I: 1 }) },
      { id: "opt_research", label: "Investigar el problema y ordenar los datos antes de decidir", interests: V({ I: 4, C: 1 }) },
      { id: "opt_organization", label: "Organizar tiempos, recursos y acuerdos para que el grupo avance", interests: V({ E: 2, C: 3 }) },
    ],
  },
  {
    id: "q_direct_support",
    numericId: 2,
    icon: "♡",
    mode: "binary",
    prompt: "¿Te sentirías cómodo/a trabajando todos los días con personas que necesitan acompañamiento directo?",
    options: [
      { id: "opt_caring", label: "Sí, me gusta cuidar, explicar y acompañar", interests: V({ S: 5 }) },
      { id: "opt_technical", label: "Prefiero aportar desde lo técnico, el análisis o la organización", interests: V({ I: 2, R: 2, C: 2 }) },
    ],
  },
  {
    id: "q_new_problem",
    numericId: 3,
    icon: "◉",
    mode: "choice",
    prompt: "Cuando aparece un problema nuevo, ¿qué te daría más ganas de hacer primero?",
    options: [
      { id: "opt_people_needs", label: "Mirar a las personas involucradas y entender qué necesitan", interests: V({ S: 4, E: 1 }) },
      { id: "opt_data_patterns", label: "Juntar datos, compararlos y buscar patrones antes de decidir", interests: V({ I: 4, C: 2 }) },
      { id: "opt_test_tools", label: "Probar materiales, herramientas o un prototipo hasta que funcione", interests: V({ R: 4, I: 2 }) },
      { id: "opt_creative_presentation", label: "Pensar una forma original y clara de mostrar la solución", interests: V({ A: 4, E: 1 }) },
    ],
  },
  {
    id: "q_jujuy_project",
    numericId: 4,
    icon: "◈",
    mode: "preference",
    prompt: "Elegí el proyecto de Jujuy que más te entusiasmaría hacer realidad.",
    options: [
      { id: "opt_food_safety", label: "Revisar que un alimento sea seguro y de buena calidad", interests: V({ R: 3, I: 3, C: 2 }) },
      { id: "opt_gastronomy_experience", label: "Crear una experiencia gastronómica con sabores locales", interests: V({ R: 2, A: 3, E: 2 }) },
      { id: "opt_textile_design", label: "Diseñar una prenda inspirada en textiles y cultura andina", interests: V({ A: 5, R: 1 }) },
      { id: "opt_cultural_exhibition", label: "Armar una exposición que conecte objetos, historias y personas", interests: V({ A: 4, I: 2, S: 1 }) },
    ],
  },
  {
    id: "q_digital_tool",
    numericId: 5,
    icon: "⌘",
    mode: "choice",
    prompt: "Una organización quiere mejorar una herramienta digital. ¿Qué parte del desafío te interesaría más?",
    options: [
      { id: "opt_explore_data", label: "Explorar datos para descubrir patrones y tomar mejores decisiones", interests: V({ I: 5, C: 1 }) },
      { id: "opt_code_solution", label: "Programar una solución que funcione y probarla paso a paso", interests: V({ R: 3, I: 3 }) },
      { id: "opt_ui_design", label: "Diseñar una pantalla clara y agradable para quien la use", interests: V({ A: 4, I: 1 }) },
      { id: "opt_quality_criteria", label: "Definir criterios, registros y pruebas para asegurar la calidad", interests: V({ C: 4, I: 2 }) },
    ],
  },
  {
    id: "q_tourist_improvement",
    numericId: 6,
    icon: "◌",
    mode: "preference",
    prompt: "Pensá en un lugar turístico de Jujuy que recibe visitantes todo el año. ¿Qué mejora te gustaría impulsar?",
    options: [
      { id: "opt_hospitality_management", label: "Coordinar recepción, habitaciones y equipos para atender bien a cada huésped", interests: V({ E: 3, C: 2, S: 1 }) },
      { id: "opt_tour_route_design", label: "Diseñar un recorrido responsable que conecte atractivos y comunidad", interests: V({ E: 3, S: 2, C: 1 }) },
      { id: "opt_cultural_storytelling", label: "Contar paisajes y cultura para crear recorridos memorables", interests: V({ S: 3, A: 2, E: 1 }) },
      { id: "opt_regional_food", label: "Crear una propuesta de comida regional para visitantes", interests: V({ A: 3, R: 2, E: 1 }) },
    ],
  },
  {
    id: "q_community_objects",
    numericId: 7,
    icon: "◇",
    mode: "choice",
    prompt: "Una institución recupera objetos, fotos y relatos de su comunidad. ¿En qué aportarías mejor?",
    options: [
      { id: "opt_conservation_planning", label: "Registrar, revisar y planificar cómo conservarlos", interests: V({ I: 3, C: 3, R: 1 }) },
      { id: "opt_community_exhibition", label: "Crear una exhibición que conecte objetos, historias y visitantes", interests: V({ A: 4, I: 2, S: 1 }) },
      { id: "opt_regional_symbols_design", label: "Transformar símbolos regionales en una propuesta visual actual", interests: V({ A: 5, R: 1, E: 1 }) },
      { id: "opt_digital_catalog", label: "Crear un catálogo digital claro para buscar y compartir información", interests: V({ I: 3, C: 3, R: 1 }) },
    ],
  },
  {
    id: "q_health_space",
    numericId: 8,
    icon: "🩺",
    mode: "preference",
    prompt: "En un espacio de salud, ¿qué aporte sentirías que te importa más hacer?",
    options: [
      { id: "opt_patient_care", label: "Cuidar y acompañar directamente a pacientes", interests: V({ S: 5, R: 1 }) },
      { id: "opt_dental_assistance", label: "Asistir con instrumental, bioseguridad y procedimientos específicos", interests: V({ R: 3, I: 2, C: 2 }) },
      { id: "opt_health_promotion", label: "Promover la prevención y hábitos saludables junto a la comunidad", interests: V({ S: 4, E: 2 }) },
      { id: "opt_lab_analysis", label: "Revisar muestras, registros o datos para ayudar a tomar mejores decisiones", interests: V({ I: 4, C: 3 }) },
    ],
  },
  {
    id: "q_jujuy_challenge",
    numericId: 9,
    icon: "☼",
    mode: "choice",
    prompt: "Si aparece un desafío de energía, seguridad o producción en Jujuy, ¿por dónde empezarías?",
    options: [
      { id: "opt_safety_risks", label: "Detectar riesgos y proponer condiciones de trabajo más seguras", interests: V({ R: 3, C: 3, I: 1 }) },
      { id: "opt_sustainable_energy", label: "Diseñar y probar una solución de energía sustentable", interests: V({ R: 4, I: 3 }) },
      { id: "opt_food_quality", label: "Medir procesos y cuidar la calidad de alimentos", interests: V({ I: 3, R: 2, C: 2 }) },
      { id: "opt_operational_controls", label: "Organizar recursos, normas y controles para que todo funcione", interests: V({ C: 4, E: 1 }) },
    ],
  },
  {
    id: "q_repetitive_task",
    numericId: 10,
    icon: "✓",
    mode: "choice",
    prompt: "En una práctica, ¿qué tarea podrías hacer varias veces sin aburrirte?",
    options: [
      { id: "opt_protocol_registry", label: "Seguir un protocolo, medir con cuidado y dejar un registro claro", interests: V({ R: 3, I: 2, C: 4 }) },
      { id: "opt_coding_iteration", label: "Programar, encontrar un error y mejorar una solución hasta que funcione", interests: V({ R: 3, I: 4 }) },
      { id: "opt_team_coordination", label: "Coordinar a otras personas para que la atención salga bien", interests: V({ S: 3, E: 3, C: 1 }) },
      { id: "opt_craft_improving", label: "Crear y mejorar una prenda, un plato o una propuesta visual", interests: V({ A: 4, R: 2, E: 1 }) },
    ],
  },
  {
    id: "q_project_satisfaction",
    numericId: 11,
    icon: "↗",
    mode: "binary",
    prompt: "Cuando termina un proyecto, ¿qué resultado te dejaría más satisfecho/a?",
    options: [
      { id: "opt_community_impact", label: "Que una persona o comunidad haya entendido algo útil y se sienta mejor acompañada", interests: V({ S: 5, E: 1 }) },
      { id: "opt_technical_solution", label: "Que haya una solución técnica, un registro confiable o una mejora que se pueda comprobar", interests: V({ R: 2, I: 3, C: 3 }) },
    ],
  },
  {
    id: "q_daily_challenge",
    numericId: 12,
    icon: "⌁",
    mode: "preference",
    prompt: "En tu trabajo de todos los días, ¿qué tipo de desafío te gustaría tener seguido?",
    options: [
      { id: "opt_data_clarity", label: "Ordenar información desordenada en reportes, indicadores o decisiones claras", interests: V({ I: 4, C: 4 }) },
      { id: "opt_software_building", label: "Escribir, probar y mejorar una aplicación o sistema digital", interests: V({ R: 3, I: 5, C: 1 }) },
      { id: "opt_traceable_prep", label: "Preparar una muestra o un proceso con precisión, seguridad y trazabilidad", interests: V({ R: 3, I: 3, C: 4 }) },
      { id: "opt_teaching_groups", label: "Acompañar grupos, explicar un tema y adaptar la respuesta a cada persona", interests: V({ S: 5, E: 1 }) },
    ],
  },
  {
    id: "q_weekly_internship",
    numericId: 13,
    icon: "▣",
    mode: "choice",
    prompt: "Si pudieras conocer una tecnicatura desde adentro durante una semana, ¿qué experiencia elegirías?",
    options: [
      { id: "opt_intern_community_health", label: "Preparar una actividad de prevención y escucha junto a una comunidad", interests: V({ S: 5, E: 2 }) },
      { id: "opt_intern_health_admin", label: "Organizar turnos, recursos y registros para que un servicio de salud funcione mejor", interests: V({ C: 5, S: 2, E: 1 }) },
      { id: "opt_intern_workplace_safety", label: "Revisar riesgos, aplicar normas y proponer mejoras en un lugar de trabajo", interests: V({ R: 4, C: 4, I: 1 }) },
      { id: "opt_intern_food_inspection", label: "Revisar que un alimento sea seguro y de buena calidad antes de que llegue a las personas", interests: V({ R: 3, I: 4, C: 3 }) },
      { id: "opt_intern_hospitality", label: "Planificar una estadía y resolver necesidades de huéspedes y equipos", interests: V({ S: 3, E: 4, C: 3 }) },
      { id: "opt_intern_heritage_conservation", label: "Registrar y conservar objetos o historias valiosas para una comunidad", interests: V({ I: 3, A: 3, C: 3, S: 1 }) },
      { id: "opt_intern_apparel_design", label: "Imaginar, bocetar y confeccionar una pieza de indumentaria", interests: V({ A: 5, R: 3, E: 1 }) },
      { id: "opt_intern_data_science", label: "Explorar datos para responder una pregunta concreta con gráficos o un modelo", interests: V({ I: 5, C: 3, A: 1 }) },
    ],
  },
  {
    id: "q_institutional_intent",
    numericId: 14,
    icon: "✦",
    mode: "choice",
    institutional: true,
    prompt: "Para terminar: ¿te ves estudiando una Tecnicatura Superior en el IES N.° 11?",
    options: [
      { id: "opt_enroll_interest", label: "Sí, quiero conocer la propuesta y cómo inscribirme", interests: V({}) },
      { id: "opt_talk_teachers", label: "Me interesa; quiero conversar con docentes o estudiantes", interests: V({}) },
      { id: "opt_explore_options", label: "Estoy explorando opciones y quiero seguir investigando", interests: V({}) },
      { id: "opt_guidance_only", label: "Por ahora busco orientación, aunque agradezco conocer el IES N.° 11", interests: V({}) },
    ],
  },
];

export const QUESTIONS: TestQuestion[] = BASE_QUESTIONS.map((question) => ({
  ...question,
  options: [
    ...question.options,
    {
      id: "opt_neutral",
      label: question.institutional ? "Prefiero no responder esta pregunta" : NEUTRAL_RESPONSE_LABEL,
      interests: V({}),
      neutral: true,
    },
  ],
}));

export function normalizeSelections(selections: Record<string, string> | number[]): Record<string, string> {
  if (Array.isArray(selections)) {
    const record: Record<string, string> = {};
    QUESTIONS.forEach((question, index) => {
      const optionIndex = selections[index];
      if (typeof optionIndex === "number" && question.options[optionIndex]) {
        record[question.id] = question.options[optionIndex].id;
      }
    });
    return record;
  }
  return { ...selections };
}

export function selectionsToIndices(selections: Record<string, string> | number[]): number[] {
  if (Array.isArray(selections)) return [...selections];
  return QUESTIONS.map((question) => {
    const optionId = selections[question.id];
    if (!optionId) return -1;
    return question.options.findIndex((opt) => opt.id === optionId);
  });
}

export function getOptionLabelForQuestionnaireVersion(
  questionnaireVersion: string | null | undefined,
  questionRef: number | string,
  optionRef: number | string,
) {
  let questionIndex: number;
  let optionIndex: number;

  if (typeof questionRef === "number") {
    questionIndex = questionRef;
  } else {
    questionIndex = QUESTIONS.findIndex((q) => q.id === questionRef);
  }

  const question = QUESTIONS[questionIndex];
  if (!question) return NEUTRAL_RESPONSE_LABEL;

  if (typeof optionRef === "number") {
    optionIndex = optionRef;
  } else {
    optionIndex = question.options.findIndex((opt) => opt.id === optionRef);
  }

  if (questionnaireVersion === ORIGINAL_QUESTIONNAIRE_VERSION) {
    return ORIGINAL_OPTION_LABELS[questionIndex]?.[optionIndex] ?? NEUTRAL_RESPONSE_LABEL;
  }
  return question.options[optionIndex]?.label ?? NEUTRAL_RESPONSE_LABEL;
}

export const OPTION_ANCHORS: Record<string, string[]> = {
  // q_proposal
  opt_visual: ["ts_diseno_indumentaria"],
  opt_prototype: ["ts_desarrollo_software", "ts_gestion_energias_renovables"],
  opt_research: ["ts_ciencias_datos_ia", "ts_estadisticas_salud"],
  opt_organization: ["ts_administracion_salud", "ts_turismo"],

  // q_direct_support
  opt_caring: ["ts_enfermeria", "ts_gerontologia", "ts_agente_sanitario", "ts_asistente_odontologico"],
  opt_technical: ["ts_laboratorio_analisis_clinico", "ts_administracion_salud", "ts_estadisticas_salud"],

  // q_new_problem
  opt_people_needs: ["ts_enfermeria", "ts_gerontologia", "ts_agente_sanitario", "ts_guia_turismo"],
  opt_data_patterns: ["ts_ciencias_datos_ia", "ts_estadisticas_salud", "ts_administracion_salud"],
  opt_test_tools: ["ts_desarrollo_software", "ts_gestion_energias_renovables", "ts_tecnologia_alimentos"],
  opt_creative_presentation: ["ts_diseno_indumentaria", "ts_museologia"],

  // q_jujuy_project
  opt_food_safety: ["ts_tecnologia_alimentos"],
  opt_gastronomy_experience: ["ts_cocinas_regionales"],
  opt_textile_design: ["ts_diseno_indumentaria"],
  opt_cultural_exhibition: ["ts_museologia"],

  // q_digital_tool
  opt_explore_data: ["ts_ciencias_datos_ia", "ts_estadisticas_salud"],
  opt_code_solution: ["ts_desarrollo_software"],
  opt_ui_design: ["ts_diseno_indumentaria"],
  opt_quality_criteria: ["ts_seguridad_higiene_laboral", "ts_administracion_salud"],

  // q_tourist_improvement
  opt_hospitality_management: ["ts_hoteleria"],
  opt_tour_route_design: ["ts_turismo"],
  opt_cultural_storytelling: ["ts_guia_turismo"],
  opt_regional_food: ["ts_cocinas_regionales"],

  // q_community_objects
  opt_conservation_planning: ["ts_museologia"],
  opt_community_exhibition: ["ts_museologia"],
  opt_regional_symbols_design: ["ts_diseno_indumentaria"],
  opt_digital_catalog: ["ts_desarrollo_software", "ts_ciencias_datos_ia"],

  // q_health_space
  opt_patient_care: ["ts_enfermeria", "ts_gerontologia"],
  opt_dental_assistance: ["ts_asistente_odontologico", "ts_laboratorio_analisis_clinico"],
  opt_health_promotion: ["ts_agente_sanitario"],
  opt_lab_analysis: ["ts_estadisticas_salud", "ts_administracion_salud", "ts_laboratorio_analisis_clinico"],

  // q_jujuy_challenge
  opt_safety_risks: ["ts_seguridad_higiene_laboral"],
  opt_sustainable_energy: ["ts_gestion_energias_renovables"],
  opt_food_quality: ["ts_tecnologia_alimentos"],
  opt_operational_controls: ["ts_administracion_salud", "ts_seguridad_higiene_laboral"],

  // q_repetitive_task
  opt_protocol_registry: ["ts_laboratorio_analisis_clinico", "ts_tecnologia_alimentos", "ts_seguridad_higiene_laboral", "ts_estadisticas_salud"],
  opt_coding_iteration: ["ts_desarrollo_software", "ts_ciencias_datos_ia"],
  opt_team_coordination: ["ts_enfermeria", "ts_gerontologia", "ts_hoteleria", "ts_turismo"],
  opt_craft_improving: ["ts_diseno_indumentaria", "ts_cocinas_regionales"],

  // q_project_satisfaction
  opt_community_impact: ["ts_enfermeria", "ts_gerontologia", "ts_agente_sanitario", "ts_guia_turismo", "ts_museologia"],
  opt_technical_solution: ["ts_ciencias_datos_ia", "ts_desarrollo_software", "ts_estadisticas_salud", "ts_laboratorio_analisis_clinico", "ts_gestion_energias_renovables", "ts_tecnologia_alimentos"],

  // q_daily_challenge
  opt_data_clarity: ["ts_estadisticas_salud", "ts_administracion_salud", "ts_ciencias_datos_ia"],
  opt_software_building: ["ts_desarrollo_software"],
  opt_traceable_prep: ["ts_laboratorio_analisis_clinico", "ts_asistente_odontologico", "ts_tecnologia_alimentos"],
  opt_teaching_groups: ["ts_enfermeria", "ts_gerontologia", "ts_agente_sanitario", "ts_guia_turismo"],

  // q_weekly_internship
  opt_intern_community_health: ["ts_agente_sanitario", "ts_gerontologia"],
  opt_intern_health_admin: ["ts_administracion_salud"],
  opt_intern_workplace_safety: ["ts_seguridad_higiene_laboral"],
  opt_intern_food_inspection: ["ts_tecnologia_alimentos"],
  opt_intern_hospitality: ["ts_hoteleria", "ts_turismo"],
  opt_intern_heritage_conservation: ["ts_museologia"],
  opt_intern_apparel_design: ["ts_diseno_indumentaria"],
  opt_intern_data_science: ["ts_ciencias_datos_ia", "ts_estadisticas_salud"],
};

export function getInterestProfile(selections: Record<string, string> | number[]): InterestVector {
  const norm = normalizeSelections(selections);
  const profile = V({});
  QUESTIONS.forEach((question) => {
    const optionId = norm[question.id];
    if (!optionId) return;
    const option = question.options.find((opt) => opt.id === optionId);
    if (option) {
      INTEREST_KEYS.forEach((key) => {
        profile[key] += option.interests[key];
      });
    }
  });
  return profile;
}

/** Indica si la persona eligió al menos una actividad que aporte información vocacional. */
export function hasScorableSignal(selections: Record<string, string> | number[]): boolean {
  const norm = normalizeSelections(selections);
  return QUESTIONS.some((question) => {
    if (question.institutional) return false;
    const optionId = norm[question.id];
    if (!optionId) return false;
    const option = question.options.find((opt) => opt.id === optionId);
    return Boolean(option && !option.neutral);
  });
}

export function getAnchorScores(selections: Record<string, string> | number[]): Record<string, number> {
  const norm = normalizeSelections(selections);
  const activeIds = ACTIVE_PROGRAM_IDS;
  const available: Record<string, number> = Object.fromEntries(activeIds.map((id) => [id, 0]));
  const matched: Record<string, number> = Object.fromEntries(activeIds.map((id) => [id, 0]));

  Object.values(OPTION_ANCHORS).forEach((programIds) => {
    programIds.forEach((id) => {
      if (available[id] !== undefined) {
        available[id] += 1;
      }
    });
  });

  Object.values(norm).forEach((optionId) => {
    const targetProgramIds = OPTION_ANCHORS[optionId] ?? [];
    targetProgramIds.forEach((id) => {
      if (matched[id] !== undefined) {
        matched[id] += 1;
      }
    });
  });

  const result: Record<string, number> = {};
  ACTIVE_PROGRAMS.forEach((program) => {
    const avail = Math.max(available[program.id] ?? 0, 1);
    const match = matched[program.id] ?? 0;
    const score = Math.round((match / avail) * 100);
    result[program.id] = score;
    result[program.name] = score;
  });

  return result;
}

function normalize(vector: InterestVector) {
  const total = INTEREST_KEYS.reduce((sum, key) => sum + vector[key], 0) || 1;
  return V(Object.fromEntries(INTEREST_KEYS.map((key) => [key, vector[key] / total])) as Partial<InterestVector>);
}

function similarity(a: InterestVector, b: InterestVector) {
  const left = normalize(a);
  const right = normalize(b);
  const distance = INTEREST_KEYS.reduce((sum, key) => sum + Math.abs(left[key] - right[key]), 0) / 2;
  const dot = INTEREST_KEYS.reduce((sum, key) => sum + left[key] * right[key], 0);
  const normA = Math.sqrt(INTEREST_KEYS.reduce((sum, key) => sum + left[key] ** 2, 0));
  const normB = Math.sqrt(INTEREST_KEYS.reduce((sum, key) => sum + right[key] ** 2, 0));
  const cosine = normA && normB ? dot / (normA * normB) : 0;
  return Math.round(Math.max(0, Math.min(100, ((1 - distance) * 0.6 + cosine * 0.4) * 100)));
}

export function scoreSelections(selections: Record<string, string> | number[]) {
  const norm = normalizeSelections(selections);
  const interests = getInterestProfile(norm);
  const anchors = getAnchorScores(norm);

  return ACTIVE_PROGRAMS.map((program) => {
    const sim = similarity(interests, program.interests);
    const anchorScore = anchors[program.id] ?? 0;
    const score = Math.round(sim * 0.55 + anchorScore * 0.45);
    return {
      id: program.id,
      program: program.name,
      score,
      area: program.area,
    };
  }).sort((a, b) => b.score - a.score || a.program.localeCompare(b.program));
}
