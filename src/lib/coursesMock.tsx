import { Course } from "../types/types";

export const allCourses: Course[] = [
  {
    id: "molderia-campera-parka",
    title: "Moldería y confección de campera tipo parka",
    description:
      "Moldería base y especifica. Paso a paso de corte y armado. Asistencia de alumno/a. Teoría y práctica en PDF y videos. Certificado de asistencia.",
    image: "/ejemplo-curso.png",
    level: "Inicial",
    progress: 20,
    modules: [
      {
        id: "modulo-1",
        title:
          "Introducción a MASTER DE MOLDERIA Y CONFECCION DE CAMPERON TIPO PARKA",
        description: "Introducción a la moldería y herramientas básicas.",
        contents: [
          {
            id: "molderia-contenido-1",
            type: "VIDEO",
            title:
              "Introducción a MASTER DE MOLDERIA Y CONFECCION DE CAMPERON TIPO PARKA",
            description:
              "En esta clase introductoria, aprenderás los conceptos básicos de la moldería y su importancia en la confección de prendas.",
            url: "https://www.youtube.com/embed/k6GFz1kw1bY?si=lEf81Qfu7UpPEP58",
            order: 1,
            thumbnail:
              "https://http2.mlstatic.com/D_NQ_NP_766761-MLA82625997088_032025-O.webp",
            duration: "22 min",
            completed: true,
            topics: [
              "Conceptos básicos de moldería",
              "Importancia en confección",
              "Términos técnicos",
            ],
          },
          {
            id: "molderia-contenido-2",
            type: "PDF",
            title: "Introducción a la Moldería y Confección",
            description:
              "Material teórico complementario sobre fundamentos de moldería",
            url: "/ejemplo-pdf.pdf",
            order: 2,
            duration: "Lectura 15 min",
            completed: true,
            topics: [
              "Fundamentos teóricos",
              "Herramientas básicas",
              "Conceptos clave",
            ],
          },
          {
            id: "molderia-contenido-3",
            type: "VIDEO",
            title: "PATRONAJE base de cuerpo y manga",
            description:
              "En esta clase, aprenderás a crear el patrón base del cuerpo y la manga, fundamentales para la confección de cualquier prenda.",
            url: "https://www.youtube.com/embed/mvCttGLNwE0?si=TWYd9d3vjGH9Jx9d",
            order: 3,
            thumbnail:
              "https://patterncos.com/wp-content/uploads/2018/06/Manga_sastre_Tutorial_01-1024x683.png",
            duration: "39 min",
            completed: false,
            topics: [
              "Patrón base del cuerpo",
              "Diseño de manga",
              "Proporciones y medidas",
            ],
          },
          {
            id: "molderia-contenido-4",
            type: "PDF",
            title: "Patronaje base de cuerpo y manga",
            description: "Guía detallada para crear patrones base",
            url: "/ejemplo-pdf.pdf",
            order: 4,
            duration: "Lectura 20 min",
            completed: false,
            topics: [
              "Técnicas de patronaje",
              "Medidas corporales",
              "Ajustes básicos",
            ],
          },
          {
            id: "molderia-contenido-5",
            type: "VIDEO",
            title: "MOLDERIA ESPECIFICA DE CAMPERÓN TIPO PARKA",
            description:
              "En esta clase, nos enfocaremos en la moldería específica para el camperón tipo parka, incluyendo detalles como bolsillos y capucha.",
            url: "https://www.youtube.com/embed/ZYuizK01p-U?si=Wb3V1qokJReRB7fU",
            order: 5,
            thumbnail:
              "https://i.pinimg.com/564x/47/92/49/47924957309ea96cee07ea9f525bad67.jpg",
            duration: "32 min",
            completed: false,
            topics: [
              "Características del camperón",
              "Moldería específica",
              "Bolsillos y capucha",
            ],
          },
          {
            id: "molderia-contenido-6",
            type: "PDF",
            title: "Moldería Específica de Camperón Tipo Parka",
            description:
              "Manual especializado en moldería para camperas tipo parka",
            url: "/ejemplo-pdf.pdf",
            order: 6,
            duration: "Lectura 25 min",
            completed: false,
            topics: [
              "Moldería especializada",
              "Detalles técnicos",
              "Especificaciones de diseño",
            ],
          },
        ],
      },
      {
        id: "modulo-2",
        title: "Armado y preparación de la Campera Tipo Parka",
        description:
          "En este módulo, aprenderás a armar y preparar la campera tipo parka, incluyendo el corte de las piezas y la preparación de los materiales.",
        contents: [
          {
            id: "molderia-contenido-7",
            type: "VIDEO",
            title:
              "Presentación de partes cortadas, vistas de Forrería y bolsillos",
            description:
              "En esta clase, presentaremos las partes cortadas de la campera tipo parka, incluyendo las vistas de forrería y los bolsillos.",
            url: "https://www.youtube.com/embed/f7MpCD_BXH8?si=U38KnMb_-vtyjQRQ",
            order: 1,
            thumbnail:
              "https://www.localesbambaci.com.ar/cdn/shop/files/11MRUB2213-SUNDAYPARKA-NEGRO_2x_905f8935-47b3-44c6-b973-b9ef7f099690_480x480.webp?v=1684275467",
            duration: "22 min",
            completed: false,
            topics: [
              "Partes cortadas",
              "Vistas de forrería",
              "Preparación de bolsillos",
            ],
          },
          {
            id: "molderia-contenido-8",
            type: "PDF",
            title: "Presentación de partes cortadas",
            description: "Guía visual de las partes cortadas y su preparación",
            url: "/ejemplo-pdf.pdf",
            order: 2,
            duration: "Lectura 10 min",
            completed: false,
            topics: [
              "Identificación de piezas",
              "Organización del trabajo",
              "Preparación de materiales",
            ],
          },
          {
            id: "molderia-contenido-9",
            type: "VIDEO",
            title:
              "Armado; cierre; colocación de manga; capucha; pestaña, ensamble final",
            description:
              "Proceso completo de armado de la campera tipo parka desde el ensamble hasta los detalles finales.",
            url: "https://www.youtube.com/embed/5VAO3KFsk0E?si=VA2EIqDQfndGzUbX",
            order: 3,
            thumbnail:
              "https://acdn-us.mitiendanube.com/stores/001/924/058/products/ms901-35-21-e70bd2273023df0f6316839148963374-240-0.jpg",
            duration: "49 min",
            completed: false,
            topics: [
              "Ensamble de partes",
              "Colocación de cierre",
              "Armado de mangas",
              "Instalación de capucha",
              "Acabados finales",
            ],
          },
          {
            id: "molderia-contenido-10",
            type: "PDF",
            title: "Armado, cierre, colocación de manga, capucha y pestaña",
            description: "Manual paso a paso del proceso de armado completo",
            url: "/ejemplo-pdf.pdf",
            order: 4,
            duration: "Lectura 30 min",
            completed: false,
            topics: [
              "Secuencia de armado",
              "Técnicas de costura",
              "Control de calidad",
              "Acabados profesionales",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "negocio-desde-cero",
    title: "Cómo iniciar tu propio negocio desde cero",
    description:
      "Descubre paso a paso cómo validar tu idea de negocio, crear un MVP, buscar financiamiento y lanzar tu producto al mercado.",
    image: "https://i.ytimg.com/vi/xrv2K3p6sfM/maxresdefault.jpg",
    level: "Inicial",
    progress: 15, 
    modules: [
      {
        id: "modulo-1",
        title: "Validación de tu Idea de Negocio",
        description:
          "Aprende a validar si tu idea es viable y tiene mercado antes de invertir tiempo o dinero.",
        contents: [
          {
            id: "negocio-contenido-1",
            type: "VIDEO",
            title: "¿Qué es una buena idea de negocio?",
            description:
              "En esta clase aprenderás cómo identificar ideas viables y validarlas antes de invertir tiempo o dinero.",
            url: "https://www.youtube.com/embed/2_zMt853gTw",
            order: 1,
            thumbnail:
              "https://innokabi.com/wp-content/uploads/2018/01/consejos-hacer-exitosa-idea-negocio.jpg",
            duration: "25 min",
            completed: true,
            topics: [
              "Ideas de negocio viables",
              "Necesidades del mercado",
              "Sostenibilidad empresarial",
            ],
          },
          {
            id: "negocio-contenido-2",
            type: "PDF",
            title: "Guía de validación de ideas",
            description:
              "Material complementario para validar ideas de negocio",
            url: "https://materiales.axontraining.com/materiales/28/Axon_28_4418.Pdf",
            order: 2,
            duration: "Lectura 20 min",
            completed: true,
            topics: [
              "Metodologías de validación",
              "Herramientas de análisis",
              "Casos de estudio",
            ],
          },
          {
            id: "negocio-contenido-3",
            type: "VIDEO",
            title: "Investigación de mercado básica",
            description:
              "Descubre cómo realizar una investigación de mercado efectiva sin gastar mucho. Aprenderás técnicas básicas para recopilar información sobre tus clientes potenciales y competidores.",
            url: "https://www.youtube.com/embed/20mhUzT_B2Y",
            order: 3,
            thumbnail:
              "https://www.salesforce.com/mx/blog/wp-content/uploads/sites/11/2024/08/CRM-data-strategy.webp",
            duration: "30 min",
            completed: false,
            topics: [
              "Herramientas de investigación",
              "Encuestas efectivas",
              "Análisis de competencia",
            ],
          },
          {
            id: "negocio-contenido-4",
            type: "PDF",
            title: "Plantilla encuesta de mercado",
            description:
              "Plantilla práctica para realizar encuestas de mercado",
            url: "https://ejemplo.com/plantilla-encuesta.docx",
            order: 4,
            duration: "Descarga inmediata",
            completed: false,
            topics: [
              "Plantillas de encuestas",
              "Preguntas clave",
              "Análisis de resultados",
            ],
          },
          {
            id: "negocio-contenido-5",
            type: "VIDEO",
            title: "Entrevistas a clientes potenciales",
            description:
              "Aprende a diseñar y realizar entrevistas efectivas a posibles clientes para validar tu idea de negocio y entender sus necesidades reales.",
            url: "https://www.youtube.com/embed/MnuIQ1uJokg",
            order: 5,
            thumbnail:
              "https://togrowagencia.com/wp-content/uploads/2021/08/conseguir-clientes-potenciales-1.jpg",
            duration: "28 min",
            completed: false,
            topics: [
              "Diseño de guiones",
              "Técnicas de entrevista",
              "Interpretación de resultados",
            ],
          },
          {
            id: "negocio-contenido-6",
            type: "PDF",
            title: "Guía de preguntas para entrevistar clientes",
            description:
              "Guía completa con preguntas estratégicas para entrevistas",
            url: "https://ejemplo.com/guia-entrevistas.pdf",
            order: 6,
            duration: "Lectura 15 min",
            completed: false,
            topics: [
              "Preguntas estratégicas",
              "Técnicas de comunicación",
              "Documentación de insights",
            ],
          },
        ],
      },
      {
        id: "modulo-2",
        title: "Construcción del Modelo de Negocio",
        description:
          "Diseña un modelo de negocio claro y funcional usando herramientas como el Canvas.",
        contents: [
          {
            id: "negocio-contenido-7",
            type: "VIDEO",
            title: "Introducción al Business Model Canvas",
            description:
              "Aprende a utilizar la herramienta más popular para diseñar modelos de negocio",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            order: 1,
            thumbnail:
              "https://ppcexpo.com/blog/wp-content/uploads/2024/05/what-is-a-business-model-canvas.jpg",
            duration: "30 min",
            completed: false,
            topics: [
              "Business Model Canvas",
              "Componentes clave",
              "Metodología de aplicación",
            ],
          },
          {
            id: "negocio-contenido-8",
            type: "VIDEO",
            title: "Definiendo tu propuesta de valor",
            description:
              "Crea una propuesta de valor única y diferenciada para tu negocio",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            order: 2,
            thumbnail:
              "https://webescuela.com/wp-content/uploads/2021/07/que-es-la-propuesta-de-valor.png.webp",
            duration: "25 min",
            completed: false,
            topics: [
              "Propuesta de valor",
              "Diferenciación",
              "Beneficios únicos",
            ],
          },
          {
            id: "negocio-contenido-9",
            type: "VIDEO",
            title: "Estructura de costos e ingresos",
            description:
              "Diseña la estructura financiera de tu modelo de negocio",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            order: 3,
            thumbnail:
              "https://empresaygestionbi.weebly.com/uploads/2/4/8/0/24808920/4681934_orig.jpg",
            duration: "27 min",
            completed: false,
            topics: [
              "Estructura de costos",
              "Fuentes de ingresos",
              "Viabilidad financiera",
            ],
          },
        ],
      },
      {
        id: "modulo-3",
        title: "Creación del MVP (Producto Mínimo Viable)",
        description:
          "Desarrolla un prototipo básico de tu producto o servicio para probarlo con usuarios reales.",
        contents: [
          {
            id: "negocio-contenido-10",
            type: "VIDEO",
            title: "¿Qué es un MVP y por qué es importante?",
            description:
              "Comprende el concepto de MVP y su importancia en el desarrollo de productos",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            order: 1,
            thumbnail:
              "https://i0.wp.com/www.coachcedric.com/wp-content/uploads/2020/01/MVPlogo.png?fit=389%2C259&ssl=1",
            duration: "22 min",
            completed: false,
            topics: ["Concepto de MVP", "Beneficios", "Casos de éxito"],
          },
          {
            id: "negocio-contenido-11",
            type: "VIDEO",
            title: "Cómo construir un MVP rápido y económico",
            description:
              "Estrategias prácticas para desarrollar tu MVP sin grandes inversiones",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            order: 2,
            thumbnail:
              "https://i0.wp.com/www.coachcedric.com/wp-content/uploads/2020/01/MVPlogo.png?fit=389%2C259&ssl=1",
            duration: "30 min",
            completed: false,
            topics: [
              "Desarrollo ágil",
              "Recursos mínimos",
              "Validación temprana",
            ],
          },
        ],
      },
      {
        id: "modulo-4",
        title: "Lanzamiento y Crecimiento",
        description:
          "Prepara el lanzamiento de tu producto y aprende estrategias básicas de crecimiento.",
        contents: [
          {
            id: "negocio-contenido-12",
            type: "VIDEO",
            title: "Estrategias de lanzamiento inicial",
            description:
              "Planifica y ejecuta el lanzamiento exitoso de tu producto",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            order: 1,
            thumbnail:
              "https://www.marketingdirecto.com/wp-content/uploads/2021/01/lanzamiento-producto-pasos.png",
            duration: "28 min",
            completed: false,
            topics: [
              "Estrategias de lanzamiento",
              "Timing de mercado",
              "Comunicación efectiva",
            ],
          },
          {
            id: "negocio-contenido-13",
            type: "VIDEO",
            title: "Marketing básico para emprendedores",
            description:
              "Fundamentos de marketing digital para hacer crecer tu negocio",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            order: 2,
            thumbnail:
              "https://www.businessempresarial.com.pe/wp-content/uploads/2022/06/marke.jpg",
            duration: "30 min",
            completed: false,
            topics: [
              "Marketing digital",
              "Redes sociales",
              "Estrategias de crecimiento",
            ],
          },
        ],
      },
    ],
  },
];

export default allCourses;
