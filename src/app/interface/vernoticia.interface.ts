import { SafeHtml } from "@angular/platform-browser";

export interface VerNoticia {
  id: string;
  fields: {
    id: number;
    fecha_publicacion: string;
    estado: string;
    titular: string;
    contenido: SafeHtml;
    galeria: string[];
    autor: string;
    fecha_creacion: string;
    comentarios: Comentario[];
  };
}

export interface Comentario {
  comentario: string;
  usuario: string;
  fecha: string | null;
}
