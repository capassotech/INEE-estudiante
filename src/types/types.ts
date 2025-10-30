

export interface RegisterData {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    dni: string;
    aceptaTerminos: boolean;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    user: {
        uid: string;
        email: string;
        nombre: string;
        apellido: string;
        role: string;
    };
    customToken?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    nombre: string;
    apellido: string;
    dni: string;
    role: string;
    fechaRegistro: string;
    aceptaTerminos: boolean;
    ruta_aprendizaje: string | null;
    respuestas_test_vocacional?: Array<{
        id_pregunta: string;
        id_respuesta: string;
    }>;
}

export interface ContentItem {
    id: string;
    descripcion: string;
    duracion: string;
    titulo: string;
    tipo_contenido: "VIDEO" | "PDF" | "DOCX" | "QUIZ" | "IMAGE";
    url_contenido: string;
    url_miniatura: string;
    completed?: boolean;
}

export interface Module {
    id: string;
    titulo: string;
    descripcion: string;
    contenido: ContentItem[];
    fechaActualizacion?: string;
    fechaCreacion?: string;
    id_curso: string;
    temas: string[];
}

export interface Course {
    titulo: string;
    imagen: string;
    descripcion: string;
    nivel: string;
    duracion: number;
    estado: string;
    id: string;
    id_modulos: string[];
    id_profesor: string;
    modalidad: string;
    pilar: string;
    precio: number;
    tags: string[];
}
