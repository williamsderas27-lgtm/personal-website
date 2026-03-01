// Types for Workspace-x AI

export type ViewId = 'dashboard' | 'aurora' | 'music' | 'word' | 'excel' | 'ppt' | 'code' | 'canva' | 'settings';

export interface NavItem {
  id: ViewId;
  label: string;
  icon: string;
}

export interface AIModel {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Slide {
  id: number;
  content: string;
  background?: string;
}

export interface ExcelData {
  [cellId: string]: string;
}

export interface CodeContent {
  html: string;
  css: string;
  js: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
}

export const VIEW_TITLES: Record<ViewId, string> = {
  dashboard: 'Panel de control',
  aurora: 'AURORA-X Agent',
  music: 'Reproductor de Música',
  word: 'Editor de Documentos',
  excel: 'Hojas de Cálculo',
  ppt: 'Presentaciones',
  code: 'Editor de Código',
  canva: 'Diseño Gráfico',
  settings: 'Configuración'
};

export const AI_MODELS: AIModel[] = [
  { id: 'friendly', name: 'Amigable', desc: 'Conversacional y cercana', color: '#00d4aa' },
  { id: 'pro', name: 'Profesional', desc: 'Formal y directa', color: '#3b82f6' },
  { id: 'creative', name: 'Creativa', desc: 'Imaginativa y divertida', color: '#f59e0b' }
];

export const APP_CARDS = [
  {
    id: 'aurora' as ViewId,
    name: 'AURORA-X',
    desc: 'Tu agente de IA avanzado con Gemini',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  },
  {
    id: 'music' as ViewId,
    name: 'Música',
    desc: 'Reproductor estilo YouTube Music',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)'
  },
  {
    id: 'code' as ViewId,
    name: 'Código',
    desc: 'Editor HTML, CSS y JavaScript',
    gradient: 'linear-gradient(135deg, #0d9488, #14b8a6)'
  },
  {
    id: 'word' as ViewId,
    name: 'Word',
    desc: 'Procesador de textos completo',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)'
  },
  {
    id: 'excel' as ViewId,
    name: 'Excel',
    desc: 'Hojas de cálculo con fórmulas',
    gradient: 'linear-gradient(135deg, #16a34a, #22c55e)'
  },
  {
    id: 'ppt' as ViewId,
    name: 'PowerPoint',
    desc: 'Crea presentaciones visuales',
    gradient: 'linear-gradient(135deg, #ea580c, #f97316)'
  },
  {
    id: 'canva' as ViewId,
    name: 'Canva',
    desc: 'Diseño gráfico intuitivo',
    gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)'
  }
];

// PPT Templates
export const PPT_TEMPLATES = {
  title: `
    <div style="position:absolute;top:30%;left:10%;width:80%;text-align:center" contenteditable="true">
      <h1 style="font-size:48px;font-weight:bold;color:#333;margin-bottom:20px">Título de la Presentación</h1>
      <p style="font-size:24px;color:#666">Subtítulo o descripción</p>
    </div>
  `,
  twoCol: `
    <div style="position:absolute;top:15%;left:5%;width:40%;text-align:center" contenteditable="true">
      <h2 style="font-size:32px;font-weight:bold;color:#333">Columna 1</h2>
      <p style="font-size:16px;color:#666;margin-top:15px">Contenido de la primera columna</p>
    </div>
    <div style="position:absolute;top:15%;right:5%;width:40%;text-align:center" contenteditable="true">
      <h2 style="font-size:32px;font-weight:bold;color:#333">Columna 2</h2>
      <p style="font-size:16px;color:#666;margin-top:15px">Contenido de la segunda columna</p>
    </div>
  `,
  blank: `
    <div style="position:absolute;top:40%;left:10%;width:80%" contenteditable="true">
      <p style="font-size:24px;color:#333">Haz clic para editar...</p>
    </div>
  `
};
