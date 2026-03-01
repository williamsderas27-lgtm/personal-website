import { useState, useEffect, useRef, useCallback } from 'react';

// Types
type ViewId = 'dashboard' | 'aurora' | 'music' | 'word' | 'excel' | 'ppt' | 'code' | 'canva';

interface AIModel {
  id: string;
  name: string;
  desc: string;
  color: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Slide {
  id: number;
  content: string;
  background: string;
}

interface ExcelData {
  [cellId: string]: string;
}

interface CodeContent {
  html: string;
  css: string;
  js: string;
}

interface MusicTrack {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
}

interface DesignElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
}

// Constants
const VIEW_TITLES: Record<ViewId, string> = {
  dashboard: 'Panel de control',
  aurora: 'AURORA-X Agent',
  music: 'Reproductor de Música',
  word: 'Editor de Documentos',
  excel: 'Hojas de Cálculo',
  ppt: 'Presentaciones',
  code: 'Editor de Código',
  canva: 'Diseño Gráfico'
};

const AI_MODELS: AIModel[] = [
  { id: 'friendly', name: 'Amigable', desc: 'Conversacional y cercana', color: '#00d4aa' },
  { id: 'pro', name: 'Profesional', desc: 'Formal y directa', color: '#3b82f6' },
  { id: 'creative', name: 'Creativa', desc: 'Imaginativa y divertida', color: '#f59e0b' }
];

const APP_CARDS = [
  { id: 'aurora' as ViewId, name: 'AURORA-X', desc: 'Tu agente de IA avanzado' },
  { id: 'music' as ViewId, name: 'Música', desc: 'Reproductor integrado' },
  { id: 'code' as ViewId, name: 'Código', desc: 'Editor HTML/CSS/JS' },
  { id: 'word' as ViewId, name: 'Word', desc: 'Procesador de textos' },
  { id: 'excel' as ViewId, name: 'Excel', desc: 'Hojas de cálculo' },
  { id: 'ppt' as ViewId, name: 'PowerPoint', desc: 'Presentaciones' },
  { id: 'canva' as ViewId, name: 'Canva', desc: 'Diseño gráfico' }
];

const PPT_TEMPLATES = {
  title: '<div style="position:absolute;top:30%;left:10%;width:80%;text-align:center" contenteditable="true"><h1 style="font-size:42px;font-weight:600;color:#333;margin-bottom:16px">Título de la Presentación</h1><p style="font-size:20px;color:#666">Subtítulo o descripción</p></div>',
  twoCol: '<div style="position:absolute;top:15%;left:5%;width:40%;text-align:center" contenteditable="true"><h2 style="font-size:28px;font-weight:600;color:#333">Columna 1</h2><p style="font-size:14px;color:#666;margin-top:12px">Contenido</p></div><div style="position:absolute;top:15%;right:5%;width:40%;text-align:center" contenteditable="true"><h2 style="font-size:28px;font-weight:600;color:#333">Columna 2</h2><p style="font-size:14px;color:#666;margin-top:12px">Contenido</p></div>',
  blank: '<div style="position:absolute;top:40%;left:10%;width:80%" contenteditable="true"><p style="font-size:20px;color:#333">Haz clic para editar...</p></div>'
};

const NAV_ITEMS = [
  { id: 'dashboard' as ViewId, label: 'Inicio' },
  { id: 'aurora' as ViewId, label: 'AURORA-X' },
  { id: 'music' as ViewId, label: 'Música' },
  { id: 'word' as ViewId, label: 'Word' },
  { id: 'excel' as ViewId, label: 'Excel' },
  { id: 'ppt' as ViewId, label: 'PowerPoint' },
  { id: 'code' as ViewId, label: 'Código' },
  { id: 'canva' as ViewId, label: 'Canva' }
];

const COLORS = ['#00d4aa', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// API endpoints - Backend handles the SDK calls
const API_BASE = '/api';

// Icons
const HomeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const AuroraIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>;
const MusicIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
const WordIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
const ExcelIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>;
const PptIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
const CodeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const CanvaIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M8 12a4 4 0 0 0 8 0" /></svg>;

const getIcon = (id: ViewId) => {
  switch (id) {
    case 'dashboard': return <HomeIcon />;
    case 'aurora': return <AuroraIcon />;
    case 'music': return <MusicIcon />;
    case 'word': return <WordIcon />;
    case 'excel': return <ExcelIcon />;
    case 'ppt': return <PptIcon />;
    case 'code': return <CodeIcon />;
    case 'canva': return <CanvaIcon />;
    default: return <HomeIcon />;
  }
};

// Sidebar Component
function Sidebar({ currentView, onNavigate }: { currentView: ViewId; onNavigate: (view: ViewId) => void }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">WX</div>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-item ${currentView === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{getIcon(item.id)}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// Main App Component
export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  
  // Aurora AI State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: '¡Hola! Soy **AURORA-X**, tu asistente de IA. ¿En qué puedo ayudarte?', sender: 'ai', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(AI_MODELS[0]);
  const [errorState, setErrorState] = useState<string | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  // Music State
  const [musicSearch, setMusicSearch] = useState('');
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Word State
  const wordEditorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('3');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  // Excel State
  const [excelData, setExcelData] = useState<ExcelData>({});
  const [activeCell, setActiveCell] = useState('A1');
  const [rows] = useState(20);
  const [cols] = useState(10);
  const [formulaBar, setFormulaBar] = useState('');
  
  // PowerPoint State
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, content: PPT_TEMPLATES.title, background: '#ffffff' }
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Code State
  const [codeContent, setCodeContent] = useState<CodeContent>({
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Página</title>
</head>
<body>
  <h1>¡Hola Mundo!</h1>
  <p>Este es mi primer proyecto</p>
</body>
</html>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea, #764ba2);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}
h1 { font-size: 3rem; margin-bottom: 1rem; }
p { font-size: 1.2rem; opacity: 0.9; }`,
    js: `document.addEventListener('DOMContentLoaded', () => {
  console.log('¡Página cargada!');
  const h1 = document.querySelector('h1');
  h1?.addEventListener('click', () => {
    h1.style.color = '#' + Math.floor(Math.random()*16777215).toString(16);
  });
});`
  });
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const previewRef = useRef<HTMLIFrameElement>(null);
  
  // Canva State
  const [elements, setElements] = useState<DesignElement[]>([
    { id: '1', type: 'text', x: 250, y: 200, width: 300, height: 60, color: '#f0f0f5', text: 'Tu Diseño', fontSize: 32, fontWeight: '600', opacity: 1, rotation: 0 }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasBg, setCanvasBg] = useState('#1a1a24');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElement = elements.find(el => el.id === selectedId);

  // Utility Functions
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColName = (index: number) => String.fromCharCode(65 + index);

  // Auto-scroll chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Code Preview
  const runCode = useCallback(() => {
    if (previewRef.current) {
      previewRef.current.srcdoc = `<!DOCTYPE html><html><head><style>${codeContent.css}</style></head><body>${codeContent.html}<script>${codeContent.js}<\/script></body></html>`;
    }
  }, [codeContent]);

  // Navigation
  const navigateTo = useCallback((view: ViewId) => {
    setCurrentView(view);
    if (view === 'code') setTimeout(() => runCode(), 100);
  }, [runCode]);

  // Aurora AI Functions
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    setErrorState(null);
    const userMessage: ChatMessage = { id: Date.now().toString(), text: inputText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          personality: currentModel.desc
        })
      });
      if (!response.ok) throw new Error('Error de conexión');
      const data = await response.json();
      const aiText = data.response || 'No pude generar una respuesta.';
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiText, sender: 'ai', timestamp: new Date() }]);
    } catch (error) {
      setErrorState('Error');
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: '⚠️ Error al procesar tu solicitud. Verifica tu conexión.', sender: 'ai', timestamp: new Date() }]);
    }
    setIsLoading(false);
  };

  const clearChat = () => setMessages([{ id: '1', text: '¡Hola! Soy **AURORA-X**, tu asistente de IA. ¿En qué puedo ayudarte?', sender: 'ai', timestamp: new Date() }]);

  // Music Functions
  const searchMusic = async () => {
    if (!musicSearch.trim()) {
      loadPopularMusic();
      return;
    }
    setIsMusicLoading(true);
    try {
      const response = await fetch(`${API_BASE}/music/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: musicSearch })
      });
      if (!response.ok) throw new Error('Error en la búsqueda');
      const data = await response.json();
      if (data.success && data.tracks.length > 0) {
        setPlaylist(data.tracks);
        setCurrentTrack(0);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setIsMusicLoading(false);
  };

  const loadPopularMusic = async () => {
    setIsMusicLoading(true);
    try {
      const response = await fetch(`${API_BASE}/music/popular`);
      if (!response.ok) throw new Error('Error al cargar música');
      const data = await response.json();
      if (data.success && data.tracks.length > 0) {
        setPlaylist(data.tracks);
        setCurrentTrack(0);
      }
    } catch (error) {
      console.error('Load popular error:', error);
    }
    setIsMusicLoading(false);
  };

  useEffect(() => {
    if (currentView === 'music' && !youtubeReady) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = () => setYoutubeReady(true);
    }
  }, [currentView, youtubeReady]);

  // Load popular music when entering music view
  useEffect(() => {
    if (currentView === 'music' && playlist.length === 0) {
      loadPopularMusic();
    }
  }, [currentView]);

  const createPlayer = (videoId: string) => {
    const container = document.getElementById('youtube-player');
    if (!container || !videoId) return;
    container.innerHTML = '<div id="yt-iframe"></div>';
    const YT = (window as any).YT;
    if (YT) {
      playerRef.current = new YT.Player('yt-iframe', {
        videoId,
        playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: (e: any) => {
            e.target.playVideo();
            e.target.setVolume(volume);
            if (progressInterval.current) clearInterval(progressInterval.current);
            progressInterval.current = setInterval(() => {
              try {
                if (playerRef.current) {
                  setProgress(playerRef.current.getCurrentTime?.() || 0);
                  setDuration(playerRef.current.getDuration?.() || 0);
                }
              } catch {}
            }, 1000);
          },
          onStateChange: (e: any) => {
            if (e.data === 0) {
              if (repeatMode === 'one') playerRef.current.playVideo?.();
              else if (shuffleMode) playTrack(Math.floor(Math.random() * playlist.length));
              else playTrack(currentTrack + 1);
            }
            setIsPlaying(e.data === 1);
          }
        }
      });
    }
  };

  const playTrack = (index: number) => {
    if (playlist.length === 0) return;
    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;
    setCurrentTrack(index);
    setIsPlaying(true);
    if (!youtubeReady) {
      const checkYT = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          clearInterval(checkYT);
          setYoutubeReady(true);
          createPlayer(playlist[index]?.id);
        }
      }, 100);
    } else if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(playlist[index].id);
    } else {
      createPlayer(playlist[index]?.id);
    }
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) playerRef.current.pauseVideo?.();
      else playerRef.current.playVideo?.();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (playerRef.current && duration) {
      playerRef.current.seekTo?.(percent * duration);
    }
  };

  // Word Functions
  const execCommand = (cmd: string, value: string = '') => {
    document.execCommand(cmd, false, value);
    wordEditorRef.current?.focus();
  };

  const exportWord = () => {
    const content = wordEditorRef.current?.innerHTML || '';
    const blob = new Blob([`<!DOCTYPE html><html><head><style>body{font-family:${fontFamily},serif;}</style></head><body>${content}</body></html>`], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'documento.html';
    a.click();
  };

  const clearWord = () => {
    if (wordEditorRef.current) wordEditorRef.current.innerHTML = '<h1 style="text-align:center">Documento Nuevo</h1><p>Comienza a escribir aquí...</p>';
  };

  // Excel Functions
  const resolveFormula = (formula: string): string => {
    try {
      const f = formula.toUpperCase();
      if (f.startsWith('=SUM(') || f.startsWith('=SUMA(')) {
        const range = f.replace(/^=SUM[A]?\(/, '').replace(/\)$/, '');
        if (range.includes(':')) {
          const [start, end] = range.split(':');
          const startCol = start.match(/[A-Z]+/)?.[0] || '';
          const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
          const endCol = end.match(/[A-Z]+/)?.[0] || '';
          const endRow = parseInt(end.match(/\d+/)?.[0] || '1');
          let sum = 0;
          for (let c = startCol.charCodeAt(0); c <= endCol.charCodeAt(0); c++) {
            for (let r = startRow; r <= endRow; r++) {
              const val = parseFloat(excelData[String.fromCharCode(c) + r] || '0');
              if (!isNaN(val)) sum += val;
            }
          }
          return sum.toString();
        }
        const cells = range.split(',').map(c => parseFloat(excelData[c.trim()] || '0'));
        return cells.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0).toString();
      }
      if (f.startsWith('=AVG(') || f.startsWith('=PROMEDIO(')) {
        const range = f.replace(/^=AVG\(/, '').replace(/^=PROMEDIO\(/, '').replace(/\)$/, '');
        const cells = range.split(',').map(c => parseFloat(excelData[c.trim()] || '0')).filter(n => !isNaN(n));
        return cells.length ? (cells.reduce((a, b) => a + b, 0) / cells.length).toFixed(2) : '0';
      }
      if (f.startsWith('=COUNT(') || f.startsWith('=CONTAR(')) {
        const range = f.replace(/^=COUNT\(/, '').replace(/^=CONTAR\(/, '').replace(/\)$/, '');
        const cells = range.split(',').filter(c => excelData[c.trim()] && excelData[c.trim()] !== '');
        return cells.length.toString();
      }
      if (f.startsWith('=MAX(')) {
        const range = f.replace(/^=MAX\(/, '').replace(/\)$/, '');
        const cells = range.split(',').map(c => parseFloat(excelData[c.trim()] || '0')).filter(n => !isNaN(n));
        return cells.length ? Math.max(...cells).toString() : '0';
      }
      if (f.startsWith('=MIN(')) {
        const range = f.replace(/^=MIN\(/, '').replace(/\)$/, '');
        const cells = range.split(',').map(c => parseFloat(excelData[c.trim()] || '0')).filter(n => !isNaN(n));
        return cells.length ? Math.min(...cells).toString() : '0';
      }
      if (f.startsWith('=CONCAT(') || f.startsWith('=CONCATENAR(')) {
        const range = f.replace(/^=CONCAT\(/, '').replace(/^=CONCATENAR\(/, '').replace(/\)$/, '');
        return range.split(',').map(c => excelData[c.trim()] || '').join('');
      }
    } catch {}
    return formula;
  };

  const handleCellChange = (cellId: string, value: string) => {
    setExcelData(prev => ({ ...prev, [cellId]: value }));
    setFormulaBar(value);
  };

  const handleCellBlur = (cellId: string, value: string) => {
    if (value.startsWith('=')) {
      const result = resolveFormula(value);
      setExcelData(prev => ({ ...prev, [cellId]: result }));
    }
  };

  const handleFormulaSubmit = () => {
    if (activeCell && formulaBar) {
      const result = formulaBar.startsWith('=') ? resolveFormula(formulaBar) : formulaBar;
      setExcelData(prev => ({ ...prev, [activeCell]: result }));
    }
  };

  const exportCSV = () => {
    let csv = '';
    for (let r = 1; r <= rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(excelData[`${getColName(c)}${r}`] || '');
      csv += row.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hoja.csv';
    a.click();
  };

  // PowerPoint Functions
  const addSlide = () => {
    setSlides([...slides, { id: Date.now(), content: PPT_TEMPLATES.blank, background: '#ffffff' }]);
    setCurrentSlide(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== currentSlide);
      setSlides(newSlides);
      setCurrentSlide(Math.max(0, currentSlide - 1));
    }
  };

  const applyTemplate = (template: 'title' | 'twoCol' | 'blank') => {
    const newSlides = [...slides];
    newSlides[currentSlide] = { ...newSlides[currentSlide], content: PPT_TEMPLATES[template] };
    setSlides(newSlides);
  };

  const changeSlideBackground = (color: string) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = { ...newSlides[currentSlide], background: color };
    setSlides(newSlides);
  };

  const exportPPT = () => {
    const html = slides.map((slide, i) => `<div style="width:960px;height:540px;background:${slide.background};position:relative;margin:20px auto;box-shadow:0 4px 20px rgba(0,0,0,0.1);page-break-after:always">${slide.content}<div style="position:absolute;bottom:10px;right:20px;font-size:14px;color:#999">${i + 1}</div></div>`).join('');
    const blob = new Blob([`<!DOCTYPE html><html><head><title>Presentación</title></head><body>${html}</body></html>`], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'presentacion.html';
    a.click();
  };

  // Canva Functions
  const addElement = (type: DesignElement['type']) => {
    const newElement: DesignElement = {
      id: Date.now().toString(),
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === 'text' ? 200 : type === 'circle' ? 100 : type === 'line' ? 150 : 150,
      height: type === 'text' ? 40 : type === 'circle' ? 100 : type === 'line' ? 4 : 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      text: type === 'text' ? 'Nuevo Texto' : undefined,
      fontSize: type === 'text' ? 24 : undefined,
      fontWeight: type === 'text' ? '500' : undefined,
      borderRadius: type === 'circle' ? 50 : 0,
      opacity: 1,
      rotation: 0
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const element = elements.find(el => el.id === id);
    if (element) {
      setDragOffset({ x: e.clientX - element.x, y: e.clientY - element.y });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(800 - 20, e.clientX - rect.left - dragOffset.x));
      const newY = Math.max(0, Math.min(500 - 20, e.clientY - rect.top - dragOffset.y));
      updateElement(selectedId, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const exportDesign = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="${canvasBg}"/>${elements.map(el => {
      if (el.type === 'text') return `<text x="${el.x}" y="${el.y + (el.fontSize || 24)}" font-size="${el.fontSize || 24}" fill="${el.color}">${el.text || ''}</text>`;
      if (el.type === 'circle') return `<circle cx="${el.x + el.width/2}" cy="${el.y + el.height/2}" r="${el.width/2}" fill="${el.color}"/>`;
      if (el.type === 'line') return `<line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y}" stroke="${el.color}" stroke-width="4"/>`;
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.color}" rx="${el.borderRadius || 0}"/>`;
    }).join('')}</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'design.svg';
    a.click();
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedId(null);
  };

  // Code auto-run
  useEffect(() => {
    if (currentView === 'code') {
      const timer = setTimeout(runCode, 500);
      return () => clearTimeout(timer);
    }
  }, [codeContent, currentView, runCode]);

  // Render Excel
  const renderExcel = () => {
    const cells = [];
    for (let r = 1; r <= rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const cellId = `${getColName(c)}${r}`;
        row.push(
          <input
            key={cellId}
            className="excel-cell"
            value={excelData[cellId] || ''}
            onFocus={() => { setActiveCell(cellId); setFormulaBar(excelData[cellId] || ''); }}
            onChange={e => handleCellChange(cellId, e.target.value)}
            onBlur={e => handleCellBlur(cellId, e.target.value)}
          />
        );
      }
      cells.push(<tr key={r}><td className="excel-row-header">{r}</td>{row}</tr>);
    }
    return cells;
  };

  // Render Markdown
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="app">
      <div className="bg-mesh" />
      <Sidebar currentView={currentView} onNavigate={navigateTo} />
      <main className="main-content">
        <header className="header">
          <span className="header-title">{VIEW_TITLES[currentView]}</span>
        </header>
        <div className="view-container">
          {/* Dashboard */}
          {currentView === 'dashboard' && (
            <div className="dashboard-view">
              <h1 className="hero-title">Bienvenido a <span className="gradient-text">Workspace-x AI</span></h1>
              <p className="hero-desc">Tu suite de productividad inteligente con IA integrada.</p>
              <div className="apps-grid">
                {APP_CARDS.map(card => (
                  <div key={card.id} className="app-card" onClick={() => navigateTo(card.id)}>
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="24" height="24">
                        {card.id === 'aurora' && <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>}
                        {card.id === 'music' && <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>}
                        {card.id === 'code' && <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>}
                        {card.id === 'word' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>}
                        {card.id === 'excel' && <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>}
                        {card.id === 'ppt' && <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>}
                        {card.id === 'canva' && <><circle cx="12" cy="12" r="10" /><path d="M8 12a4 4 0 0 0 8 0" /></>}
                      </svg>
                    </div>
                    <h3 className="card-title">{card.name}</h3>
                    <p className="card-desc">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aurora AI */}
          {currentView === 'aurora' && (
            <div className="aurora-view">
              <div className="aurora-sidebar">
                <div className="model-section">
                  <span className="section-label">Personalidad</span>
                  {AI_MODELS.map(model => (
                    <div key={model.id} className={`model-card ${currentModel.id === model.id ? 'selected' : ''}`} onClick={() => setCurrentModel(model)}>
                      <div className="model-header"><span className="model-dot" style={{ background: model.color }} /><span className="model-name">{model.name}</span></div>
                      <span className="model-desc">{model.desc}</span>
                    </div>
                  ))}
                </div>
                <div className="status-section">
                  <span className="section-label">Estado</span>
                  <span className="status-text"><span className={`status-dot ${errorState ? 'error' : ''}`} />{errorState ? 'Error' : 'Conectado'}</span>
                  <button className="clear-chat-btn" onClick={clearChat}>Limpiar Chat</button>
                </div>
              </div>
              <div className="chat-area">
                <div className="chat-messages" ref={chatMessagesRef}>
                  {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                      <div className="message-bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                    </div>
                  ))}
                  {isLoading && <div className="message ai"><div className="message-bubble"><div className="typing-indicator"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div></div>}
                </div>
                <div className="chat-input-area">
                  <input type="text" className="chat-input" placeholder="Escribe tu mensaje..." value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} />
                  <button className="btn-primary" onClick={sendMessage} disabled={isLoading}>{isLoading ? 'Enviando...' : 'Enviar'}</button>
                </div>
              </div>
            </div>
          )}

          {/* Music */}
          {currentView === 'music' && (
            <div className="music-view-yt">
              <div className="music-sidebar-yt">
                <div className="music-search">
                  <div className="search-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input type="text" placeholder="Buscar canciones o artistas..." value={musicSearch} onChange={e => setMusicSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && searchMusic()} />
                  </div>
                </div>
                <div className="playlist-section">
                  <h3 className="playlist-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                    Playlist ({playlist.length})
                  </h3>
                  <div className="playlist-scroll">
                    {isMusicLoading ? (
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Buscando música...</p>
                      </div>
                    ) : playlist.length === 0 ? (
                      <div className="empty-playlist">
                        <div className="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="48" height="48"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg></div>
                        <p>Busca música para empezar</p>
                        <span>Tus canciones aparecerán aquí</span>
                      </div>
                    ) : playlist.map((track, index) => (
                      <div key={track.id} className={`track-card ${currentTrack === index ? 'active' : ''}`} onClick={() => playTrack(index)}>
                        <div className="track-thumb-wrapper">
                          <img src={track.thumbnail} alt="" className="track-thumb-img" />
                          {currentTrack === index && isPlaying && <div className="playing-overlay"><div className="sound-wave"><span></span><span></span><span></span><span></span></div></div>}
                        </div>
                        <div className="track-details">
                          <span className="track-name">{track.title}</span>
                          <span className="track-artist">{track.channel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="music-main-yt">
                {playlist.length > 0 && playlist[currentTrack] ? (
                  <>
                    <div className="now-playing-hero">
                      <div className="album-art-large"><img src={playlist[currentTrack].thumbnail} alt={playlist[currentTrack].title} /></div>
                      <div className="song-info-large">
                        <h1 className="song-title-large">{playlist[currentTrack].title}</h1>
                        <p className="song-artist-large">{playlist[currentTrack].channel}</p>
                      </div>
                    </div>
                    <div className="player-controls">
                      <div className="progress-container">
                        <span className="time-current">{formatTime(progress)}</span>
                        <div className="progress-bar" onClick={handleSeek}><div className="progress-fill" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} /></div>
                        <span className="time-total">{formatTime(duration)}</span>
                      </div>
                      <div className="control-buttons">
                        <button className={`control-btn secondary ${shuffleMode ? 'active' : ''}`} onClick={() => setShuffleMode(!shuffleMode)} title="Aleatorio">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>
                        </button>
                        <button className="control-btn secondary" onClick={() => playTrack(currentTrack - 1)} title="Anterior">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" /></svg>
                        </button>
                        <button className="control-btn primary" onClick={togglePlay} title={isPlaying ? 'Pausar' : 'Reproducir'}>
                          {isPlaying ? <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg> : <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
                        </button>
                        <button className="control-btn secondary" onClick={() => playTrack(currentTrack + 1)} title="Siguiente">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" /></svg>
                        </button>
                        <button className={`control-btn secondary ${repeatMode !== 'none' ? 'active' : ''}`} onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')} title="Repetir">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                          {repeatMode === 'one' && <span className="repeat-badge">1</span>}
                        </button>
                      </div>
                      <div className="volume-control">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                        <input type="range" min="0" max="100" value={volume} onChange={e => { setVolume(Number(e.target.value)); playerRef.current?.setVolume?.(Number(e.target.value)); }} className="volume-slider" />
                        <span className="volume-value">{volume}%</span>
                      </div>
                    </div>
                    <div id="youtube-player" style={{ display: 'none' }} />
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="80" height="80"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" /></svg></div>
                    <h2>Sin música reproduciéndose</h2>
                    <p>Busca tu música favorita para empezar</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Word */}
          {currentView === 'word' && (
            <div className="word-view">
              <div className="toolbar">
                <div className="toolbar-group">
                  <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); execCommand('fontName', e.target.value); }}>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                  <select value={fontSize} onChange={e => { setFontSize(e.target.value); execCommand('fontSize', e.target.value); }}>
                    <option value="1">8pt</option>
                    <option value="2">10pt</option>
                    <option value="3">12pt</option>
                    <option value="4">14pt</option>
                    <option value="5">18pt</option>
                    <option value="6">24pt</option>
                    <option value="7">36pt</option>
                  </select>
                </div>
                <div className="toolbar-group">
                  <button className="tool-btn" onClick={() => execCommand('bold')} title="Negrita (Ctrl+B)"><b>B</b></button>
                  <button className="tool-btn" onClick={() => execCommand('italic')} title="Cursiva (Ctrl+I)"><i>I</i></button>
                  <button className="tool-btn" onClick={() => execCommand('underline')} title="Subrayado (Ctrl+U)"><u>U</u></button>
                  <button className="tool-btn" onClick={() => execCommand('strikeThrough')} title="Tachado"><s>S</s></button>
                </div>
                <div className="toolbar-group">
                  <button className="tool-btn" onClick={() => execCommand('insertUnorderedList')} title="Lista">•</button>
                  <button className="tool-btn" onClick={() => execCommand('insertOrderedList')} title="Lista numerada">1.</button>
                </div>
                <div className="toolbar-group">
                  <button className="tool-btn" onClick={() => execCommand('justifyLeft')} title="Alinear izquierda">⬅</button>
                  <button className="tool-btn" onClick={() => execCommand('justifyCenter')} title="Centrar">≡</button>
                  <button className="tool-btn" onClick={() => execCommand('justifyRight')} title="Alinear derecha">➡</button>
                </div>
                <div className="toolbar-group">
                  <label className="color-label">
                    <input type="color" value={textColor} onChange={e => { setTextColor(e.target.value); execCommand('foreColor', e.target.value); }} title="Color de texto" />
                  </label>
                  <label className="color-label">
                    <input type="color" value={bgColor} onChange={e => { setBgColor(e.target.value); execCommand('hiliteColor', e.target.value); }} title="Color de fondo" />
                  </label>
                </div>
                <div className="toolbar-group" style={{ borderRight: 'none' }}>
                  <button className="btn-secondary btn-sm" onClick={exportWord}>Exportar HTML</button>
                  <button className="btn-secondary btn-sm" onClick={clearWord}>Limpiar</button>
                </div>
              </div>
              <div className="word-editor-container">
                <div ref={wordEditorRef} className="word-page" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: '<h1 style="text-align:center">Documento Nuevo</h1><p>Comienza a escribir aquí...</p>' }} />
              </div>
            </div>
          )}

          {/* Excel */}
          {currentView === 'excel' && (
            <div className="excel-view">
              <div className="excel-toolbar">
                <div className="formula-bar-container">
                  <span className="cell-info">Celda: <strong>{activeCell}</strong></span>
                  <input type="text" className="formula-input" placeholder="Fórmula (=SUM, =AVG, =MAX, =MIN, =COUNT, =CONCAT) o valor..." value={formulaBar} onChange={e => setFormulaBar(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleFormulaSubmit()} />
                </div>
                <button className="btn-secondary btn-sm" onClick={handleFormulaSubmit}>Aplicar</button>
                <button className="btn-secondary btn-sm" onClick={exportCSV}>Exportar CSV</button>
                <button className="btn-secondary btn-sm" onClick={() => { setExcelData({}); setFormulaBar(''); }}>Limpiar</button>
              </div>
              <div className="excel-container">
                <table className="excel-table">
                  <thead>
                    <tr>
                      <th className="excel-header excel-row-header" />
                      {Array.from({ length: cols }, (_, i) => <th key={i} className="excel-header">{getColName(i)}</th>)}
                    </tr>
                  </thead>
                  <tbody>{renderExcel()}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* PowerPoint */}
          {currentView === 'ppt' && (
            <div className="ppt-view">
              <div className="ppt-sidebar">
                <div className="slide-list">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className={`slide-thumbnail ${currentSlide === index ? 'active' : ''}`} onClick={() => setCurrentSlide(index)} dangerouslySetInnerHTML={{ __html: slide.content }} />
                  ))}
                </div>
                <button className="btn-secondary" onClick={addSlide}>+ Nueva Diapositiva</button>
                <button className="btn-secondary" onClick={deleteSlide} disabled={slides.length <= 1}>Eliminar</button>
              </div>
              <div className="ppt-main">
                <div className="ppt-toolbar">
                  <button className="btn-secondary btn-sm" onClick={() => applyTemplate('title')}>Título</button>
                  <button className="btn-secondary btn-sm" onClick={() => applyTemplate('twoCol')}>Dos Columnas</button>
                  <button className="btn-secondary btn-sm" onClick={() => applyTemplate('blank')}>Blanco</button>
                  <label className="color-label">
                    Fondo: <input type="color" value={slides[currentSlide]?.background || '#ffffff'} onChange={e => changeSlideBackground(e.target.value)} />
                  </label>
                  <button className="btn-secondary btn-sm" onClick={exportPPT}>Exportar</button>
                </div>
                <div className="ppt-canvas">
                  <div className="slide-main" style={{ background: slides[currentSlide]?.background }} dangerouslySetInnerHTML={{ __html: slides[currentSlide]?.content || '' }} />
                </div>
              </div>
            </div>
          )}

          {/* Code */}
          {currentView === 'code' && (
            <div className="code-view">
              <div className="code-editor-panel">
                <div className="code-tabs">
                  {(['html', 'css', 'js'] as const).map(tab => (
                    <button key={tab} className={`code-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                      {tab === 'html' ? 'HTML' : tab === 'css' ? 'CSS' : 'JavaScript'}
                    </button>
                  ))}
                </div>
                <textarea
                  className="code-textarea"
                  value={codeContent[activeTab]}
                  onChange={e => setCodeContent(prev => ({ ...prev, [activeTab]: e.target.value }))}
                  spellCheck={false}
                />
              </div>
              <div className="code-preview">
                <iframe ref={previewRef} title="Preview" sandbox="allow-scripts" />
              </div>
            </div>
          )}

          {/* Canva */}
          {currentView === 'canva' && (
            <div className="canva-view">
              <div className="canvas-area">
                <div
                  ref={canvasRef}
                  className="design-canvas"
                  style={{ background: canvasBg }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={() => setSelectedId(null)}
                >
                  {elements.map(el => (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        backgroundColor: el.type !== 'text' ? el.color : 'transparent',
                        borderRadius: el.borderRadius || 0,
                        opacity: el.opacity,
                        cursor: 'move',
                        color: el.color,
                        fontSize: el.fontSize,
                        fontWeight: el.fontWeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: selectedId === el.id ? '2px solid var(--accent)' : 'none',
                        boxShadow: selectedId === el.id ? '0 0 12px var(--accent-glow)' : 'none'
                      }}
                      onMouseDown={e => handleMouseDown(e, el.id)}
                      contentEditable={el.type === 'text' && selectedId === el.id}
                      suppressContentEditableWarning
                      onBlur={e => updateElement(el.id, { text: e.currentTarget.textContent || '' })}
                    >
                      {el.type === 'text' && el.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="canvas-toolbar">
                <div className="toolbar-section">
                  <h4>Elementos</h4>
                  <div className="element-buttons">
                    <button className="element-btn" onClick={() => addElement('text')} title="Texto">T</button>
                    <button className="element-btn" onClick={() => addElement('rectangle')} title="Rectángulo">▢</button>
                    <button className="element-btn" onClick={() => addElement('circle')} title="Círculo">○</button>
                    <button className="element-btn" onClick={() => addElement('line')} title="Línea">─</button>
                  </div>
                </div>
                <div className="toolbar-section">
                  <h4>Canvas</h4>
                  <div className="property-row">
                    <label>Fondo</label>
                    <input type="color" value={canvasBg} onChange={e => setCanvasBg(e.target.value)} style={{ width: '100%', height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                  </div>
                </div>
                {selectedElement && (
                  <div className="toolbar-section">
                    <h4>Propiedades</h4>
                    <div className="properties-panel">
                      <div className="property-row">
                        <label>Color</label>
                        <input type="color" value={selectedElement.color} onChange={e => updateElement(selectedElement.id, { color: e.target.value })} style={{ width: '100%', height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                      </div>
                      {selectedElement.type === 'text' && (
                        <>
                          <div className="property-row">
                            <label>Texto</label>
                            <input type="text" value={selectedElement.text || ''} onChange={e => updateElement(selectedElement.id, { text: e.target.value })} />
                          </div>
                          <div className="property-row">
                            <label>Tamaño</label>
                            <input type="number" value={selectedElement.fontSize || 24} onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })} min={8} max={72} />
                          </div>
                        </>
                      )}
                      <div className="property-row">
                        <label>Opacidad</label>
                        <input type="range" min={0} max={1} step={0.1} value={selectedElement.opacity || 1} onChange={e => updateElement(selectedElement.id, { opacity: Number(e.target.value) })} />
                      </div>
                      <button className="btn-secondary btn-sm" onClick={() => deleteElement(selectedElement.id)} style={{ marginTop: 8, borderColor: '#ef4444', color: '#ef4444' }}>Eliminar</button>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn-primary" onClick={exportDesign}>Exportar SVG</button>
                  <button className="btn-secondary" onClick={clearCanvas}>Limpiar Canvas</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
