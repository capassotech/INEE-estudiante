

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
}


export interface ContentItem {
    id: string;
    type: "VIDEO" | "PDF" | "QUIZ" | "DOCX" | "IMAGE";
    title: string;
    description: string;
    url: string;
    order: number;
    thumbnail?: string;
    duration: string;
    completed: boolean;
    topics?: string[];
}

export interface Module {
    id: string;
    title: string;
    description: string;
    contents: ContentItem[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    image: string;
    level: string;
    progress: number;
    modules: Module[];
}
