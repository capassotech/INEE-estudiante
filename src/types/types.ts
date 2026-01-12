

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
    membresia: string | null;
    ruta_aprendizaje: string | null;
    respuestas_test_vocacional?: Array<{
        id_pregunta: string;
        id_respuesta: string;
    }>;
}

export interface ContentItem {
    id: string;
    descripcion: string;
    duracion: string | number;
    titulo: string;
    tipo_contenido: "video" | "pdf" | "contenido_extra"
    url_contenido?: string; // URL individual (opcional, puede usar urls_contenido en su lugar)
    urls_contenido?: string[]; // Array de URLs (usado por videos y PDFs)
    url_miniatura: string | null;
    urls_bibliografia: string | string[] | null;
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


export interface Membership {
    nombre: string;
    descripcion: string;
    precio: number;
    estado: string;
    fecha_alta: string;
    old_price: number;
}