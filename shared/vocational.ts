export type AreaKey = "Salud y Bienestar" | "Tecnología e Innovación" | "Industria, Ambiente y Seguridad" | "Gastronomía, Turismo y Patrimonio" | "Diseño y Arte Aplicado";

export const INTEREST_KEYS = ["R", "I", "A", "S", "E", "C"] as const;
export type InterestKey = (typeof INTEREST_KEYS)[number];
export type InterestVector = Record<InterestKey, number>;
export type QuestionMode = "choice" | "binary" | "slider" | "preference";

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
  area: AreaKey;
  profile: string;
  professionalProfile: string;
  graduateRole: string;
  tasks: string[];
  field: string;
  subjects: string[];
  interests: InterestVector;
};
export type TestOption = { label: string; interests: InterestVector; neutral?: boolean };
export type TestQuestion = { id: number; icon: string; prompt: string; mode: QuestionMode; options: TestOption[]; institutional?: boolean; sliderLabels?: { min: string; max: string } };

export const AREA_META: Record<AreaKey, { icon: string; color: string; soft: string }> = {
  "Salud y Bienestar": { icon: "🩺", color: "#1588b9", soft: "#dff3ff" },
  "Tecnología e Innovación": { icon: "⌘", color: "#315fc5", soft: "#e5edff" },
  "Industria, Ambiente y Seguridad": { icon: "◒", color: "#176fa3", soft: "#d9eefb" },
  "Gastronomía, Turismo y Patrimonio": { icon: "◌", color: "#1297b8", soft: "#d8f4f8" },
  "Diseño y Arte Aplicado": { icon: "✦", color: "#3d76c3", soft: "#e2eeff" },
};

export const INSTITUTION_INFO = {
  name: "Instituto de Educación Superior N.° 11",
  offer: "Oferta académica vigente: 18 Tecnicaturas Superiores.",
  address: "Alvear 1151, San Salvador de Jujuy.",
  enrolment: "Preinscripción: consultá la plataforma NEXO de Educación de Jujuy y los canales institucionales para fechas vigentes.",
  website: "https://ies11jujuy.wixsite.com/misitio",
  sources: ["https://educacion.jujuy.gob.ar/2025/11/26/inician-las-preinscripciones-para-el-ingreso-a-carreras-de-educacion-superior-2026/", "https://unjudiario.unju.edu.ar/destacadas/el-ies-n-11-presenta-su-oferta-academica-2026-con-19-tecnicaturas-superiores", "https://ies11jujuy.wixsite.com/misitio"],
};

function joinWithAnd(values: string[]) {
  if (values.length < 2) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} y ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} y ${values.at(-1)}`;
}

function buildProfessionalProfile(profile: string, subjects: string[], tasks: string[]) {
  return `${profile} Desde una mirada técnica, la formación articula ${joinWithAnd(subjects)} para comprender procesos, tomar decisiones fundamentadas y trabajar con criterios de calidad. En las prácticas profesionalizantes se desarrollan tareas como: ${tasks.join(" ")}`;
}

const P = (area: AreaKey, interests: InterestVector, profile: string, graduateRole: string, subjects: string[], tasks: string[], field: string): ProgramProfile => ({ area, interests, profile, professionalProfile: buildProfessionalProfile(profile, subjects, tasks), graduateRole, subjects, tasks, field });

export const LEGACY_PROGRAMS: Record<string, ProgramProfile> = {
  "TS en Enfermería": P("Salud y Bienestar", V({ R: 1, I: 1, S: 5, C: 1 }), "Integra cuidados, observación clínica, prevención y comunicación respetuosa con pacientes, familias y equipos de salud.", "Al finalizar, contarías con una formación técnica para colaborar en el cuidado integral de personas en distintas etapas de la vida, siempre dentro de los alcances y protocolos profesionales vigentes.", ["Fundamentos de Enfermería", "Anatomía y Fisiología", "Prácticas profesionalizantes"], ["Brindar cuidados básicos y registrar la evolución bajo protocolos.", "Colaborar en acciones de prevención, educación para la salud y promoción del autocuidado.", "Trabajar de manera coordinada con equipos de salud y familias."], "Hospitales, centros de salud, sanatorios, escuelas, empresas y atención domiciliaria en Jujuy y el NOA."),
  "TS en Administración en Servicios de Salud": P("Salud y Bienestar", V({ I: 1, S: 2, E: 2, C: 5 }), "Combina organización, registros y atención para que los servicios de salud puedan funcionar de forma ordenada y centrada en las personas.", "Al finalizar, podrías aportar al funcionamiento administrativo de instituciones de salud mediante la gestión responsable de información, turnos, recursos y circuitos de atención.", ["Administración sanitaria", "Sistemas de información", "Gestión de recursos"], ["Organizar turnos, documentación y circuitos administrativos.", "Colaborar con el seguimiento de recursos, prestaciones e indicadores.", "Mejorar procesos de atención cuidando la confidencialidad de la información."], "Hospitales, clínicas, obras sociales, municipios y áreas administrativas de salud de Jujuy y el NOA."),
  "TS en Agente Sanitario y Promotor de la Salud": P("Salud y Bienestar", V({ R: 1, I: 1, S: 5, E: 2, C: 1 }), "Acerca prevención, información confiable y redes de cuidado a comunidades, escuelas y familias desde una mirada territorial.", "Al finalizar, podrías participar en acciones de promoción y prevención de la salud, articulando necesidades de la comunidad con programas y equipos interdisciplinarios.", ["Salud comunitaria", "Promoción y prevención", "Territorio y participación"], ["Planificar actividades de educación y prevención en territorio.", "Relevar necesidades y orientar a las personas hacia servicios de salud.", "Fortalecer redes comunitarias y hábitos de cuidado."], "Centros de salud, programas sanitarios, escuelas, ONGs y comunidades de Jujuy y el NOA."),
  "TS en Estadísticas de Salud": P("Salud y Bienestar", V({ I: 4, S: 1, E: 1, C: 5 }), "Transforma registros en información confiable para comprender situaciones sanitarias y apoyar mejores decisiones.", "Al finalizar, podrías trabajar con datos, indicadores y registros sanitarios, aplicando criterios de calidad, confidencialidad y presentación clara de resultados.", ["Bioestadística", "Registros sanitarios", "Análisis de datos"], ["Ordenar y controlar la calidad de registros sanitarios.", "Calcular indicadores y elaborar reportes para equipos de gestión.", "Comunicar hallazgos con tablas, gráficos y explicaciones comprensibles."], "Hospitales, ministerios, obras sociales, programas de salud e investigación en Jujuy y el NOA."),
  "TS en Asistente Odontológico": P("Salud y Bienestar", V({ R: 2, I: 2, S: 4, C: 3 }), "Integra atención al paciente, preparación de instrumental y cuidados de bioseguridad para acompañar el trabajo odontológico.", "Al finalizar, podrías asistir en la organización del consultorio y en procedimientos de apoyo, aplicando normas de higiene, esterilización y trato respetuoso.", ["Asistencia odontológica", "Bioseguridad", "Instrumental y esterilización"], ["Preparar y acondicionar el consultorio e instrumental.", "Acompañar la recepción y orientación de pacientes.", "Aplicar rutinas de limpieza, esterilización y bioseguridad."], "Consultorios, clínicas y centros de salud públicos y privados de Jujuy y el NOA."),
  "TS en Gerontología": P("Salud y Bienestar", V({ A: 1, S: 5, E: 1, C: 2 }), "Promueve la autonomía, los vínculos y la calidad de vida de personas mayores desde una perspectiva de derechos y cuidado integral.", "Al finalizar, podrías colaborar en propuestas de acompañamiento, recreación y cuidado para personas mayores, reconociendo sus historias, decisiones y redes afectivas.", ["Envejecimiento y sociedad", "Cuidados gerontológicos", "Intervención comunitaria"], ["Diseñar actividades que fortalezcan la autonomía y la participación.", "Acompañar rutinas y vínculos en coordinación con equipos y familias.", "Reconocer señales de necesidad y derivar según protocolos."], "Residencias, gerontocentros, hospitales y programas sociales de Jujuy y el NOA."),
  "TS en Laboratorio de Análisis Clínico": P("Salud y Bienestar", V({ R: 2, I: 5, S: 1, C: 3 }), "Combina precisión técnica, análisis y control de procedimientos para procesar muestras que aportan datos relevantes al diagnóstico.", "Al finalizar, podrías desempeñarte en tareas técnicas de laboratorio, respetando protocolos de bioseguridad, trazabilidad y control de calidad establecidos.", ["Química clínica", "Microbiología", "Técnicas de laboratorio"], ["Preparar, identificar y procesar muestras según protocolos.", "Realizar controles de calidad y registrar procedimientos.", "Colaborar con la emisión ordenada de información para equipos de salud."], "Laboratorios, hospitales, bancos de sangre e industrias relacionadas de Jujuy y el NOA."),
  "TS en Ciencias de Datos e Inteligencia Artificial": P("Tecnología e Innovación", V({ I: 5, A: 1, E: 2, C: 3 }), "Transforma datos en conocimiento y diseña soluciones inteligentes para responder preguntas concretas de organizaciones y comunidades.", "Al finalizar, podrías participar en proyectos de datos e inteligencia artificial, desde la preparación de información hasta el análisis, la visualización y el desarrollo responsable de modelos.", ["Programación", "Estadística aplicada", "Modelos de inteligencia artificial"], ["Preparar, explorar y visualizar datos para detectar patrones.", "Construir prototipos de análisis o modelos de inteligencia artificial.", "Comunicar resultados y límites de una solución basada en datos."], "Empresas tecnológicas, salud, banca, gobierno, consultoría y trabajo remoto desde Jujuy y el NOA."),
  "TS en Desarrollo de Software": P("Tecnología e Innovación", V({ R: 1, I: 5, A: 1, E: 1, C: 2 }), "Diseña, programa, prueba y mejora aplicaciones que responden a necesidades reales de usuarios y organizaciones.", "Al finalizar, podrías integrarte a equipos de desarrollo para construir y mantener soluciones web, móviles o de gestión, utilizando buenas prácticas de programación.", ["Programación", "Bases de datos", "Desarrollo web y móvil"], ["Programar y depurar funcionalidades de una aplicación.", "Diseñar estructuras de datos y conexiones con bases de datos.", "Probar, documentar y mejorar experiencias digitales."], "Estudios de software, startups, organismos públicos y trabajo remoto desde Jujuy y el NOA."),
  "TS en Seguridad e Higiene Laboral": P("Industria, Ambiente y Seguridad", V({ R: 4, I: 2, S: 1, E: 1, C: 4 }), "Observa condiciones de trabajo, identifica riesgos y ayuda a construir entornos más seguros mediante prevención y cumplimiento de normas.", "Al finalizar, podrías colaborar en la prevención de riesgos laborales, relevando situaciones, proponiendo mejoras y participando en acciones de capacitación y control.", ["Higiene industrial", "Prevención de riesgos", "Legislación laboral"], ["Identificar peligros y registrar condiciones de trabajo.", "Acompañar capacitaciones y planes de prevención.", "Colaborar con inspecciones, señalización y documentación de seguridad."], "Minería, industria, construcción, municipios, consultoras y ART de Jujuy y el NOA."),
  "TS en Gestión de Energías Renovables": P("Industria, Ambiente y Seguridad", V({ R: 5, I: 3, A: 1, S: 1, E: 1, C: 1 }), "Participa en soluciones de energía sustentable vinculando conocimiento técnico, cuidado ambiental y necesidades territoriales.", "Al finalizar, podrías colaborar en el relevamiento, operación, mantenimiento y gestión básica de proyectos de energías renovables, con foco en eficiencia y sostenibilidad.", ["Sistemas energéticos", "Energía solar", "Gestión ambiental"], ["Relevar condiciones para soluciones energéticas sustentables.", "Acompañar tareas técnicas de operación y mantenimiento.", "Registrar consumos, indicadores y aspectos ambientales de proyectos."], "Parques solares, empresas eléctricas, consultoras, municipios y proyectos ambientales de Jujuy y el NOA."),
  "TS en Tecnología de los Alimentos": P("Industria, Ambiente y Seguridad", V({ R: 3, I: 4, A: 1, E: 1, C: 3 }), "Cuida la calidad, inocuidad y mejora de procesos para transformar materias primas en alimentos seguros y consistentes.", "Al finalizar, podrías colaborar en el control y mejora de procesos de elaboración, aplicando buenas prácticas de manufactura, análisis básicos y registros de calidad.", ["Química de alimentos", "Inocuidad alimentaria", "Control de calidad"], ["Controlar etapas de elaboración, conservación y envasado.", "Aplicar buenas prácticas de higiene e inocuidad.", "Registrar resultados y apoyar mejoras de calidad."], "Industrias alimentarias, laboratorios, bromatología y emprendimientos de Jujuy y el NOA."),
  "TS en Cocinas Regionales y Cultura Alimentaria": P("Gastronomía, Turismo y Patrimonio", V({ R: 3, I: 1, A: 3, S: 1, E: 2, C: 1 }), "Crea propuestas gastronómicas que ponen en valor ingredientes, saberes, técnicas y relatos del territorio.", "Al finalizar, podrías diseñar y elaborar propuestas culinarias regionales, articulando técnica, identidad cultural, organización de cocina y experiencia de comensales.", ["Cocinas regionales", "Técnicas culinarias", "Cultura alimentaria"], ["Planificar y elaborar preparaciones con identidad local.", "Organizar estaciones de trabajo, insumos y tiempos de cocina.", "Diseñar experiencias gastronómicas para emprendimientos y eventos."], "Restaurantes, hoteles, eventos, emprendimientos y turismo gastronómico de Jujuy y el NOA."),
  "TS en Hotelería": P("Gastronomía, Turismo y Patrimonio", V({ R: 1, A: 2, S: 3, E: 4, C: 3 }), "Gestiona servicios de alojamiento y experiencias de huéspedes, coordinando personas, espacios y procesos cotidianos.", "Al finalizar, podrías colaborar en la operación y gestión de establecimientos de alojamiento, cuidando la calidad del servicio, la organización y la atención al visitante.", ["Operación hotelera", "Servicios al huésped", "Gestión de alojamientos"], ["Organizar reservas, recepción y circuitos de atención.", "Coordinar servicios y resolver necesidades de huéspedes.", "Apoyar la planificación de recursos y estándares de calidad."], "Hoteles, hosterías, termas y alojamientos de Jujuy y destinos turísticos del NOA."),
  "TS en Turismo": P("Gastronomía, Turismo y Patrimonio", V({ R: 1, I: 1, A: 2, S: 3, E: 4, C: 2 }), "Planifica, diseña y gestiona productos, servicios y destinos turísticos que vinculan visitantes, comunidades, patrimonio y desarrollo local sostenible.", "Al finalizar, podrías colaborar en el diseño, promoción y coordinación de propuestas turísticas, articulando prestadores, comunidades y experiencias con una mirada responsable sobre el territorio.", ["Planificación turística", "Gestión de destinos", "Turismo sustentable"], ["Diseñar recorridos y servicios turísticos con objetivos claros.", "Articular prestadores, comunidades y experiencias de visitantes.", "Aportar a la promoción y gestión sostenible de destinos."], "Agencias, operadoras, municipios y organismos de turismo de Jujuy y el NOA. Su foco es planificar y gestionar experiencias, servicios y destinos."),
  "TS en Guía de Turismo": P("Gastronomía, Turismo y Patrimonio", V({ R: 2, I: 1, A: 2, S: 4, E: 3 }), "Conduce grupos e interpreta en terreno paisajes, historia y cultura para construir recorridos claros, seguros y significativos.", "Al finalizar, podrías guiar grupos y comunicar información sobre atractivos, patrimonio y normas de cuidado, adaptando cada recorrido a diferentes públicos y situaciones reales.", ["Guiado e interpretación", "Patrimonio regional", "Técnicas de conducción"], ["Conducir grupos con organización y criterios de seguridad.", "Interpretar paisajes, historia y cultura de manera accesible.", "Resolver situaciones de recorrido y orientar a visitantes."], "Agencias, sitios patrimoniales, ecoturismo y trabajo independiente en Jujuy y el NOA. Su foco es acompañar, orientar e interpretar durante el recorrido."),
  "TS en Museología": P("Gastronomía, Turismo y Patrimonio", V({ R: 1, I: 2, A: 5, S: 2, E: 1, C: 2 }), "Diseña experiencias expositivas y acciones culturales que conectan colecciones, historias y públicos diversos.", "Al finalizar, podrías colaborar en museos y espacios culturales mediante la documentación, la mediación y el diseño de propuestas que acerquen el patrimonio a la comunidad.", ["Museografía", "Diseño de exposiciones", "Educación en museos"], ["Participar en el montaje y comunicación de exposiciones.", "Diseñar recursos para que distintos públicos comprendan una colección.", "Colaborar con registros básicos y actividades de mediación cultural."], "Museos, centros culturales, universidades y proyectos de mediación cultural de Jujuy y el NOA."),
  "TS en Museología y Gestión Patrimonial": P("Gastronomía, Turismo y Patrimonio", V({ R: 2, I: 3, A: 4, S: 3, E: 2, C: 2 }), "Investiga, conserva y gestiona patrimonio cultural y natural, conectando documentación, cuidado y participación comunitaria.", "Al finalizar, podrías colaborar en proyectos de identificación, conservación preventiva y puesta en valor de bienes patrimoniales junto a instituciones y comunidades.", ["Gestión patrimonial", "Conservación preventiva", "Documentación de colecciones"], ["Documentar bienes y relatos asociados al patrimonio.", "Aplicar criterios de conservación preventiva y manejo responsable.", "Participar en proyectos de gestión cultural y territorial."], "Museos, archivos, áreas de cultura y patrimonio, y proyectos territoriales de Jujuy y el NOA."),
  "TS en Diseño de Indumentaria": P("Diseño y Arte Aplicado", V({ R: 2, I: 1, A: 5, E: 2, C: 1 }), "Crea prendas y colecciones que combinan investigación, moldería, confección, textiles e identidad artesanal andina.", "Al finalizar, podrías diseñar y desarrollar propuestas de indumentaria desde la idea hasta el prototipo, integrando criterios estéticos, técnicos y de producción.", ["Diseño de indumentaria", "Moldería y confección", "Textiles y producción"], ["Investigar referencias, materiales y necesidades de uso.", "Desarrollar bocetos, moldes, prototipos y fichas técnicas.", "Planificar pequeñas producciones o proyectos de marca."], "Talleres, marcas propias, cooperativas textiles y emprendimientos de moda de Jujuy y el NOA."),
};

export const LEGACY_CATALOG_VERSION = "2026.08-legado-19";
export const CATALOG_VERSION = "2026.08-oficial-18";
export const RETIRED_PROGRAM = "TS en Museología y Gestión Patrimonial";
export const LEGACY_PROGRAM_NAMES = Object.keys(LEGACY_PROGRAMS);
export const PROGRAMS = Object.fromEntries(
  Object.entries(LEGACY_PROGRAMS).filter(([program]) => program !== RETIRED_PROGRAM),
) as Record<string, ProgramProfile>;
export const ALL_PROGRAMS = LEGACY_PROGRAMS;
export const PROGRAM_NAMES = Object.keys(PROGRAMS);
const sliderOptions = Array.from({ length: 11 }, (_, value) => ({ label: String(value), interests: V({ S: Math.round((10 - value) / 2), I: Math.round(value / 2), R: value > 6 ? 2 : 0 }) }));

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
  { id: 1, icon: "✦", mode: "choice", prompt: "Imaginate que tu grupo tiene que crear una propuesta desde cero. ¿De qué parte te harías cargo primero?", options: [{ label: "Crear una identidad visual y contar la idea de forma atractiva", interests: V({ A: 4, E: 1 }) }, { label: "Armar un prototipo y probar si funciona", interests: V({ R: 4, I: 1 }) }, { label: "Investigar el problema y ordenar los datos antes de decidir", interests: V({ I: 4, C: 1 }) }, { label: "Organizar tiempos, recursos y acuerdos para que el grupo avance", interests: V({ E: 2, C: 3 }) }] },
  { id: 2, icon: "♡", mode: "binary", prompt: "¿Te sentirías cómodo/a trabajando todos los días con personas que necesitan acompañamiento directo?", options: [{ label: "Sí, me gusta cuidar, explicar y acompañar", interests: V({ S: 5 }) }, { label: "Prefiero aportar desde lo técnico, el análisis o la organización", interests: V({ I: 2, R: 2, C: 2 }) }] },
  { id: 3, icon: "◉", mode: "choice", prompt: "Cuando aparece un problema nuevo, ¿qué te daría más ganas de hacer primero?", options: [{ label: "Mirar a las personas involucradas y entender qué necesitan", interests: V({ S: 4, E: 1 }) }, { label: "Juntar datos, compararlos y buscar patrones antes de decidir", interests: V({ I: 4, C: 2 }) }, { label: "Probar materiales, herramientas o un prototipo hasta que funcione", interests: V({ R: 4, I: 2 }) }, { label: "Pensar una forma original y clara de mostrar la solución", interests: V({ A: 4, E: 1 }) }] },
  { id: 4, icon: "◈", mode: "preference", prompt: "Elegí el proyecto de Jujuy que más te entusiasmaría hacer realidad.", options: [{ label: "Revisar que un alimento sea seguro y de buena calidad", interests: V({ R: 3, I: 3, C: 2 }) }, { label: "Crear una experiencia gastronómica con sabores locales", interests: V({ R: 2, A: 3, E: 2 }) }, { label: "Diseñar una prenda inspirada en textiles y cultura andina", interests: V({ A: 5, R: 1 }) }, { label: "Armar una exposición que conecte objetos, historias y personas", interests: V({ A: 4, I: 2, S: 1 }) }] },
  { id: 5, icon: "⌘", mode: "choice", prompt: "Una organización quiere mejorar una herramienta digital. ¿Qué parte del desafío te interesaría más?", options: [{ label: "Explorar datos para descubrir patrones y tomar mejores decisiones", interests: V({ I: 5, C: 1 }) }, { label: "Programar una solución que funcione y probarla paso a paso", interests: V({ R: 3, I: 3 }) }, { label: "Diseñar una pantalla clara y agradable para quien la use", interests: V({ A: 4, I: 1 }) }, { label: "Definir criterios, registros y pruebas para asegurar la calidad", interests: V({ C: 4, I: 2 }) }] },
  { id: 6, icon: "◌", mode: "preference", prompt: "Pensá en un lugar turístico de Jujuy que recibe visitantes todo el año. ¿Qué mejora te gustaría impulsar?", options: [{ label: "Coordinar recepción, habitaciones y equipos para atender bien a cada huésped", interests: V({ E: 3, C: 2, S: 1 }) }, { label: "Diseñar un recorrido responsable que conecte atractivos y comunidad", interests: V({ E: 3, S: 2, C: 1 }) }, { label: "Contar paisajes y cultura para crear recorridos memorables", interests: V({ S: 3, A: 2, E: 1 }) }, { label: "Crear una propuesta de comida regional para visitantes", interests: V({ A: 3, R: 2, E: 1 }) }] },
  { id: 7, icon: "◇", mode: "choice", prompt: "Una institución recupera objetos, fotos y relatos de su comunidad. ¿En qué aportarías mejor?", options: [{ label: "Registrar, revisar y planificar cómo conservarlos", interests: V({ I: 3, C: 3, R: 1 }) }, { label: "Crear una exhibición que conecte objetos, historias y visitantes", interests: V({ A: 4, I: 2, S: 1 }) }, { label: "Transformar símbolos regionales en una propuesta visual actual", interests: V({ A: 5, R: 1, E: 1 }) }, { label: "Crear un catálogo digital claro para buscar y compartir información", interests: V({ I: 3, C: 3, R: 1 }) }] },
  { id: 8, icon: "🩺", mode: "preference", prompt: "En un espacio de salud, ¿qué aporte sentirías que te importa más hacer?", options: [{ label: "Cuidar y acompañar directamente a pacientes", interests: V({ S: 5, R: 1 }) }, { label: "Asistir con instrumental, bioseguridad y procedimientos específicos", interests: V({ R: 3, I: 2, C: 2 }) }, { label: "Promover la prevención y hábitos saludables junto a la comunidad", interests: V({ S: 4, E: 2 }) }, { label: "Revisar muestras, registros o datos para ayudar a tomar mejores decisiones", interests: V({ I: 4, C: 3 }) }] },
  { id: 9, icon: "☼", mode: "choice", prompt: "Si aparece un desafío de energía, seguridad o producción en Jujuy, ¿por dónde empezarías?", options: [{ label: "Detectar riesgos y proponer condiciones de trabajo más seguras", interests: V({ R: 3, C: 3, I: 1 }) }, { label: "Diseñar y probar una solución de energía sustentable", interests: V({ R: 4, I: 3 }) }, { label: "Medir procesos y cuidar la calidad de alimentos", interests: V({ I: 3, R: 2, C: 2 }) }, { label: "Organizar recursos, normas y controles para que todo funcione", interests: V({ C: 4, E: 1 }) }] },
  { id: 10, icon: "✓", mode: "choice", prompt: "En una práctica, ¿qué tarea podrías hacer varias veces sin aburrirte?", options: [{ label: "Seguir un protocolo, medir con cuidado y dejar un registro claro", interests: V({ R: 3, I: 2, C: 4 }) }, { label: "Programar, encontrar un error y mejorar una solución hasta que funcione", interests: V({ R: 3, I: 4 }) }, { label: "Coordinar a otras personas para que la atención salga bien", interests: V({ S: 3, E: 3, C: 1 }) }, { label: "Crear y mejorar una prenda, un plato o una propuesta visual", interests: V({ A: 4, R: 2, E: 1 }) }] },
  { id: 11, icon: "↗", mode: "binary", prompt: "Cuando termina un proyecto, ¿qué resultado te dejaría más satisfecho/a?", options: [{ label: "Que una persona o comunidad haya entendido algo útil y se sienta mejor acompañada", interests: V({ S: 5, E: 1 }) }, { label: "Que haya una solución técnica, un registro confiable o una mejora que se pueda comprobar", interests: V({ R: 2, I: 3, C: 3 }) }] },
  { id: 12, icon: "⌁", mode: "preference", prompt: "En tu trabajo de todos los días, ¿qué tipo de desafío te gustaría tener seguido?", options: [{ label: "Ordenar información desordenada en reportes, indicadores o decisiones claras", interests: V({ I: 4, C: 4 }) }, { label: "Escribir, probar y mejorar una aplicación o sistema digital", interests: V({ R: 3, I: 5, C: 1 }) }, { label: "Preparar una muestra o un proceso con precisión, seguridad y trazabilidad", interests: V({ R: 3, I: 3, C: 4 }) }, { label: "Acompañar grupos, explicar un tema y adaptar la respuesta a cada persona", interests: V({ S: 5, E: 1 }) }] },
  { id: 13, icon: "▣", mode: "choice", prompt: "Si pudieras conocer una tecnicatura desde adentro durante una semana, ¿qué experiencia elegirías?", options: [{ label: "Preparar una actividad de prevención y escucha junto a una comunidad", interests: V({ S: 5, E: 2 }) }, { label: "Organizar turnos, recursos y registros para que un servicio de salud funcione mejor", interests: V({ C: 5, S: 2, E: 1 }) }, { label: "Revisar riesgos, aplicar normas y proponer mejoras en un lugar de trabajo", interests: V({ R: 4, C: 4, I: 1 }) }, { label: "Revisar que un alimento sea seguro y de buena calidad antes de que llegue a las personas", interests: V({ R: 3, I: 4, C: 3 }) }, { label: "Planificar una estadía y resolver necesidades de huéspedes y equipos", interests: V({ S: 3, E: 4, C: 3 }) }, { label: "Registrar y conservar objetos o historias valiosas para una comunidad", interests: V({ I: 3, A: 3, C: 3, S: 1 }) }, { label: "Imaginar, bocetar y confeccionar una pieza de indumentaria", interests: V({ A: 5, R: 3, E: 1 }) }, { label: "Explorar datos para responder una pregunta concreta con gráficos o un modelo", interests: V({ I: 5, C: 3, A: 1 }) }] },
  { id: 14, icon: "✦", mode: "choice", institutional: true, prompt: "Para terminar: ¿te ves estudiando una Tecnicatura Superior en el IES N.° 11?", options: [{ label: "Sí, quiero conocer la propuesta y cómo inscribirme", interests: V({}) }, { label: "Me interesa; quiero conversar con docentes o estudiantes", interests: V({}) }, { label: "Estoy explorando opciones y quiero seguir investigando", interests: V({}) }, { label: "Por ahora busco orientación, aunque agradezco conocer el IES N.° 11", interests: V({}) }] },
];

export const QUESTIONS: TestQuestion[] = BASE_QUESTIONS.map((question) => ({
  ...question,
  options: [
    ...question.options,
    {
      label: question.institutional ? "Prefiero no responder esta pregunta" : NEUTRAL_RESPONSE_LABEL,
      interests: V({}),
      neutral: true,
    },
  ],
}));

export function getOptionLabelForQuestionnaireVersion(questionnaireVersion: string | null | undefined, questionIndex: number, optionIndex: number) {
  if (questionnaireVersion === ORIGINAL_QUESTIONNAIRE_VERSION) {
    return ORIGINAL_OPTION_LABELS[questionIndex]?.[optionIndex] ?? NEUTRAL_RESPONSE_LABEL;
  }
  return QUESTIONS[questionIndex]?.options[optionIndex]?.label ?? NEUTRAL_RESPONSE_LABEL;
}

export const OPTION_ANCHORS: Record<number, Record<number, string[]>> = {
  1: { 0: ["TS en Diseño de Indumentaria"], 1: ["TS en Desarrollo de Software", "TS en Gestión de Energías Renovables"], 2: ["TS en Ciencias de Datos e Inteligencia Artificial", "TS en Estadísticas de Salud"], 3: ["TS en Administración en Servicios de Salud", "TS en Turismo"] },
  2: { 0: ["TS en Enfermería", "TS en Gerontología", "TS en Agente Sanitario y Promotor de la Salud", "TS en Asistente Odontológico"], 1: ["TS en Laboratorio de Análisis Clínico", "TS en Administración en Servicios de Salud", "TS en Estadísticas de Salud"] },
  3: { 0: ["TS en Enfermería", "TS en Gerontología", "TS en Agente Sanitario y Promotor de la Salud", "TS en Guía de Turismo"], 1: ["TS en Ciencias de Datos e Inteligencia Artificial", "TS en Estadísticas de Salud", "TS en Administración en Servicios de Salud"], 2: ["TS en Desarrollo de Software", "TS en Gestión de Energías Renovables", "TS en Tecnología de los Alimentos"], 3: ["TS en Diseño de Indumentaria", "TS en Museología"] },
  4: { 0: ["TS en Tecnología de los Alimentos"], 1: ["TS en Cocinas Regionales y Cultura Alimentaria"], 2: ["TS en Diseño de Indumentaria"], 3: ["TS en Museología"] },
  5: { 0: ["TS en Ciencias de Datos e Inteligencia Artificial", "TS en Estadísticas de Salud"], 1: ["TS en Desarrollo de Software"], 2: ["TS en Diseño de Indumentaria"], 3: ["TS en Seguridad e Higiene Laboral", "TS en Administración en Servicios de Salud"] },
  6: { 0: ["TS en Hotelería"], 1: ["TS en Turismo"], 2: ["TS en Guía de Turismo"], 3: ["TS en Cocinas Regionales y Cultura Alimentaria"] },
  7: { 0: ["TS en Museología"], 1: ["TS en Museología"], 2: ["TS en Diseño de Indumentaria"], 3: ["TS en Desarrollo de Software", "TS en Ciencias de Datos e Inteligencia Artificial"] },
  8: { 0: ["TS en Enfermería", "TS en Gerontología"], 1: ["TS en Asistente Odontológico", "TS en Laboratorio de Análisis Clínico"], 2: ["TS en Agente Sanitario y Promotor de la Salud"], 3: ["TS en Estadísticas de Salud", "TS en Administración en Servicios de Salud", "TS en Laboratorio de Análisis Clínico"] },
  9: { 0: ["TS en Seguridad e Higiene Laboral"], 1: ["TS en Gestión de Energías Renovables"], 2: ["TS en Tecnología de los Alimentos"], 3: ["TS en Administración en Servicios de Salud", "TS en Seguridad e Higiene Laboral"] },
  10: { 0: ["TS en Laboratorio de Análisis Clínico", "TS en Tecnología de los Alimentos", "TS en Seguridad e Higiene Laboral", "TS en Estadísticas de Salud"], 1: ["TS en Desarrollo de Software", "TS en Ciencias de Datos e Inteligencia Artificial"], 2: ["TS en Enfermería", "TS en Gerontología", "TS en Hotelería", "TS en Turismo"], 3: ["TS en Diseño de Indumentaria", "TS en Cocinas Regionales y Cultura Alimentaria"] },
  11: { 0: ["TS en Enfermería", "TS en Gerontología", "TS en Agente Sanitario y Promotor de la Salud", "TS en Guía de Turismo", "TS en Museología"], 1: ["TS en Ciencias de Datos e Inteligencia Artificial", "TS en Desarrollo de Software", "TS en Estadísticas de Salud", "TS en Laboratorio de Análisis Clínico", "TS en Gestión de Energías Renovables", "TS en Tecnología de los Alimentos"] },
  12: { 0: ["TS en Estadísticas de Salud", "TS en Administración en Servicios de Salud", "TS en Ciencias de Datos e Inteligencia Artificial"], 1: ["TS en Desarrollo de Software"], 2: ["TS en Laboratorio de Análisis Clínico", "TS en Asistente Odontológico", "TS en Tecnología de los Alimentos"], 3: ["TS en Enfermería", "TS en Gerontología", "TS en Agente Sanitario y Promotor de la Salud", "TS en Guía de Turismo"] },
  13: { 0: ["TS en Agente Sanitario y Promotor de la Salud", "TS en Gerontología"], 1: ["TS en Administración en Servicios de Salud"], 2: ["TS en Seguridad e Higiene Laboral"], 3: ["TS en Tecnología de los Alimentos"], 4: ["TS en Hotelería", "TS en Turismo"], 5: ["TS en Museología"], 6: ["TS en Diseño de Indumentaria"], 7: ["TS en Ciencias de Datos e Inteligencia Artificial", "TS en Estadísticas de Salud"] },
};

export function getInterestProfile(selectionIndexes: number[]): InterestVector {
  const profile = V({});
  QUESTIONS.forEach((question, index) => {
    const option = question.options[selectionIndexes[index]];
    if (option) INTEREST_KEYS.forEach((key) => { profile[key] += option.interests[key]; });
  });
  return profile;
}

/** Indica si la persona eligió al menos una actividad que aporte información vocacional. */
export function hasScorableSignal(selectionIndexes: number[]) {
  return QUESTIONS.some((question, index) => {
    const option = question.options[selectionIndexes[index]];
    return Boolean(option && !question.institutional && !option.neutral);
  });
}

export function getAnchorScores(selectionIndexes: number[]) {
  const available = Object.fromEntries(PROGRAM_NAMES.map((program) => [program, 0])) as Record<string, number>;
  const matched = Object.fromEntries(PROGRAM_NAMES.map((program) => [program, 0])) as Record<string, number>;
  Object.values(OPTION_ANCHORS).forEach((options) => Object.values(options).forEach((programs) => programs.forEach((program) => { available[program] += 1; })));
  selectionIndexes.forEach((optionIndex, questionIndex) => {
    const question = QUESTIONS[questionIndex];
    ((question && OPTION_ANCHORS[question.id]?.[optionIndex]) ?? []).forEach((program) => { matched[program] += 1; });
  });
  return Object.fromEntries(PROGRAM_NAMES.map((program) => [program, Math.round((matched[program] / Math.max(available[program], 1)) * 100)])) as Record<string, number>;
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

export function scoreSelections(selectionIndexes: number[]) {
  const interests = getInterestProfile(selectionIndexes);
  const anchors = getAnchorScores(selectionIndexes);
  return PROGRAM_NAMES.map((program) => ({ program, score: Math.round(similarity(interests, PROGRAMS[program].interests) * 0.55 + anchors[program] * 0.45), area: PROGRAMS[program].area })).sort((a, b) => b.score - a.score || a.program.localeCompare(b.program));
}
