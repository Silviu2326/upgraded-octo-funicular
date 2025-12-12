import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider, ObsidianInput } from './ui/ObsidianElements';
import {
  Camera, Mic, Play, Box, Layers, User, Wand2, RefreshCw, PenTool,
  Plus, Video, Image, Film, Volume2, Download, Share2, Trash2,
  Edit2, Eye, ChevronRight, Upload, FileVideo, Sparkles, Check,
  X, Grid3x3, LayoutGrid, FolderOpen, Pause, StopCircle, Mic2,
  Settings, ArrowLeft, CheckCircle, AlertCircle, Loader
} from 'lucide-react';

// --- Types ---
type ViewMode = 'gallery' | 'create-avatar' | 'video-editor' | 'voice-library' | 'scene-library' | 'content-gallery';
type AvatarCreationMethod = 'photo' | 'video' | 'scan' | null;
type RenderStatus = 'idle' | 'processing' | 'completed' | 'failed';

interface Avatar {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: Date;
  method: 'photo' | 'video' | 'scan';
  personality: string;
  voiceId?: string;
}

interface Voice {
  id: string;
  name: string;
  language: string;
  sampleUrl?: string;
  createdAt: Date;
  quality: number;
}

interface Scene {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  createdAt: Date;
  category: string;
}

interface VideoContent {
  id: string;
  name: string;
  thumbnail: string;
  duration: number;
  avatarId: string;
  voiceId: string;
  sceneId?: string;
  script: string;
  status: RenderStatus;
  progress: number;
  createdAt: Date;
  downloadUrl?: string;
}

interface Personality {
  id: string;
  name: string;
  description: string;
  voiceTone: string;
  bodyLanguage: string;
}

// --- Sample Data ---
const SAMPLE_AVATARS: Avatar[] = [
  {
    id: 'av-001',
    name: 'CEO Formal',
    thumbnail: '',
    createdAt: new Date(Date.now() - 86400000 * 5),
    method: 'photo',
    personality: 'Formal Executive',
    voiceId: 'voice-001'
  },
  {
    id: 'av-002',
    name: 'Ventas Amigable',
    thumbnail: '',
    createdAt: new Date(Date.now() - 86400000 * 2),
    method: 'video',
    personality: 'Friendly Advisor',
    voiceId: 'voice-001'
  }
];

const SAMPLE_VOICES: Voice[] = [
  {
    id: 'voice-001',
    name: 'Mi Voz Principal',
    language: 'ES',
    createdAt: new Date(Date.now() - 86400000 * 5),
    quality: 95
  },
  {
    id: 'voice-002',
    name: 'Voz Alternativa',
    language: 'EN',
    createdAt: new Date(Date.now() - 86400000 * 3),
    quality: 88
  }
];

const SAMPLE_SCENES: Scene[] = [
  {
    id: 'scene-001',
    name: 'Oficina Minimalista',
    description: 'Escritorio moderno con ventana a la ciudad',
    thumbnail: '',
    createdAt: new Date(Date.now() - 86400000 * 4),
    category: 'Oficina'
  },
  {
    id: 'scene-002',
    name: 'Estudio Podcast',
    description: 'Set de podcast profesional con luces cálidas',
    thumbnail: '',
    createdAt: new Date(Date.now() - 86400000 * 2),
    category: 'Estudio'
  },
  {
    id: 'scene-003',
    name: 'Sala de Juntas',
    description: 'Sala de conferencias ejecutiva',
    thumbnail: '',
    createdAt: new Date(Date.now() - 86400000 * 1),
    category: 'Corporativo'
  }
];

const PERSONALITIES: Personality[] = [
  {
    id: 'formal',
    name: 'Formal Executive',
    description: 'Profesional y autoritario',
    voiceTone: 'Grave, pausado',
    bodyLanguage: 'Postura erguida, gestos mínimos'
  },
  {
    id: 'friendly',
    name: 'Friendly Advisor',
    description: 'Cercano y accesible',
    voiceTone: 'Cálido, conversacional',
    bodyLanguage: 'Relajado, gestos expresivos'
  },
  {
    id: 'aggressive',
    name: 'Aggressive Sales',
    description: 'Energético y persuasivo',
    voiceTone: 'Enérgico, enfático',
    bodyLanguage: 'Dinámico, gestos amplios'
  }
];

const AvatarStudio: React.FC = () => {
  // --- State Management ---
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [avatars, setAvatars] = useState<Avatar[]>(SAMPLE_AVATARS);
  const [voices, setVoices] = useState<Voice[]>(SAMPLE_VOICES);
  const [scenes, setScenes] = useState<Scene[]>(SAMPLE_SCENES);
  const [videoContents, setVideoContents] = useState<VideoContent[]>([]);

  // Avatar Creation
  const [creationMethod, setCreationMethod] = useState<AvatarCreationMethod>(null);
  const [creationStep, setCreationStep] = useState(1);
  const [newAvatarForm, setNewAvatarForm] = useState({
    name: '',
    personality: 'formal',
    file: null as File | null
  });

  // Video Editor
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [videoScript, setVideoScript] = useState('');
  const [videoName, setVideoName] = useState('');

  // Voice Recording
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [newVoiceName, setNewVoiceName] = useState('');

  // Scene Creation
  const [sceneDescription, setSceneDescription] = useState('');
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Canvas Animation for Avatar Preview ---
  useEffect(() => {
    if (viewMode !== 'video-editor' && viewMode !== 'create-avatar') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3D Points Generation
    const points: {x: number, y: number, z: number}[] = [];
    const layers = 15;
    for (let i = 0; i < layers; i++) {
      const y = -1 + (i / (layers - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const segments = 12;
      for (let j = 0; j < segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        points.push({
          x: Math.cos(angle) * radius * 0.6,
          y: y * 0.8 - 0.2,
          z: Math.sin(angle) * radius * 0.6
        });
      }
    }

    for(let i=0; i<20; i++) {
      const angle = (i/20) * Math.PI;
      points.push({
        x: Math.cos(angle) * 1.2,
        y: 1.2,
        z: Math.sin(angle) * 0.5
      });
    }

    let time = 0;
    let animationId: number;

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      time += 0.01;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 300;

      // Floor Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=-5; i<=5; i++) {
        const y = cy + 150 + i * 10;
        ctx.moveTo(cx - 200, y);
        ctx.lineTo(cx + 200, y);
      }
      ctx.stroke();

      // Avatar Points
      points.forEach(p => {
        const rx = p.x * Math.cos(time) - p.z * Math.sin(time);
        const rz = p.x * Math.sin(time) + p.z * Math.cos(time);

        const scale = fov / (fov + rz + 4);
        const x2d = rx * scale * 150 + cx;
        const y2d = p.y * scale * 150 + cy;

        const alpha = (rz + 2) / 3;
        ctx.fillStyle = `rgba(245, 245, 247, ${Math.max(0.1, alpha * 0.8)})`;

        let isEye = false;
        if (Math.abs(p.y + 0.2) < 0.1 && p.z > 0) {
          ctx.fillStyle = '#6A4FFB';
          isEye = true;
        }

        ctx.beginPath();
        ctx.arc(x2d, y2d, isEye ? 2 : 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        if (Math.random() > 0.95) {
          ctx.strokeStyle = 'rgba(106, 79, 251, 0.2)';
          ctx.beginPath();
          ctx.moveTo(x2d, y2d);
          ctx.lineTo(x2d + (Math.random()-0.5)*20, y2d + (Math.random()-0.5)*20);
          ctx.stroke();
        }
      });

      // Scanline
      const scanY = cy + Math.sin(time * 2) * 150;
      const gradient = ctx.createLinearGradient(0, scanY, 0, scanY + 20);
      gradient.addColorStop(0, 'rgba(106, 79, 251, 0.0)');
      gradient.addColorStop(0.5, 'rgba(106, 79, 251, 0.1)');
      gradient.addColorStop(1, 'rgba(106, 79, 251, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(cx - 150, scanY - 10, 300, 20);

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [viewMode]);

  // --- Handlers ---
  const handleCreateAvatar = () => {
    if (!newAvatarForm.name || !creationMethod) return;

    const newAvatar: Avatar = {
      id: `av-${String(avatars.length + 1).padStart(3, '0')}`,
      name: newAvatarForm.name,
      thumbnail: '',
      createdAt: new Date(),
      method: creationMethod,
      personality: newAvatarForm.personality,
      voiceId: voices[0]?.id
    };

    setAvatars([...avatars, newAvatar]);
    setViewMode('gallery');
    setCreationStep(1);
    setCreationMethod(null);
    setNewAvatarForm({ name: '', personality: 'formal', file: null });
  };

  const handleRenderVideo = () => {
    if (!selectedAvatarId || !videoScript || !videoName) {
      alert('Por favor completa todos los campos');
      return;
    }

    const newVideo: VideoContent = {
      id: `vid-${String(videoContents.length + 1).padStart(3, '0')}`,
      name: videoName,
      thumbnail: '',
      duration: 0,
      avatarId: selectedAvatarId,
      voiceId: selectedVoiceId || voices[0]?.id || '',
      sceneId: selectedSceneId,
      script: videoScript,
      status: 'processing',
      progress: 0,
      createdAt: new Date()
    };

    setVideoContents([...videoContents, newVideo]);

    // Simulate rendering
    const interval = setInterval(() => {
      setVideoContents(prev => prev.map(v => {
        if (v.id === newVideo.id && v.progress < 100) {
          const newProgress = v.progress + 2;
          return {
            ...v,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'processing',
            downloadUrl: newProgress >= 100 ? `#download-${v.id}` : undefined,
            duration: newProgress >= 100 ? 45 : 0
          };
        }
        return v;
      }));
    }, 100);

    setTimeout(() => clearInterval(interval), 5000);

    // Reset form
    setVideoScript('');
    setVideoName('');
    setSelectedSceneId(null);
  };

  const handleRecordVoice = () => {
    setIsRecordingVoice(true);
    setRecordingProgress(0);

    const interval = setInterval(() => {
      setRecordingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRecordingVoice(false);

          // Create new voice
          if (newVoiceName) {
            const newVoice: Voice = {
              id: `voice-${String(voices.length + 1).padStart(3, '0')}`,
              name: newVoiceName,
              language: 'ES',
              createdAt: new Date(),
              quality: 90 + Math.floor(Math.random() * 10)
            };
            setVoices([...voices, newVoice]);
            setNewVoiceName('');
          }

          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleGenerateScene = () => {
    if (!sceneDescription) return;

    setIsGeneratingScene(true);

    setTimeout(() => {
      const newScene: Scene = {
        id: `scene-${String(scenes.length + 1).padStart(3, '0')}`,
        name: sceneDescription.substring(0, 30),
        description: sceneDescription,
        thumbnail: '',
        createdAt: new Date(),
        category: 'Personalizado'
      };

      setScenes([...scenes, newScene]);
      setSceneDescription('');
      setIsGeneratingScene(false);
    }, 3000);
  };

  // --- Render Functions ---
  const renderGallery = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide mb-1">Avatar Studio & Media</h1>
            <p className="text-sm text-obsidian-text-muted">Fábrica de contenido con clones digitales</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('voice-library')}
              className="px-4 py-2 border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.05] transition-all flex items-center gap-2"
            >
              <Mic2 size={16} />
              Voces
            </button>
            <button
              onClick={() => setViewMode('scene-library')}
              className="px-4 py-2 border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.05] transition-all flex items-center gap-2"
            >
              <Box size={16} />
              Escenas
            </button>
            <button
              onClick={() => setViewMode('content-gallery')}
              className="px-4 py-2 border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.05] transition-all flex items-center gap-2"
            >
              <FolderOpen size={16} />
              Contenido
            </button>
          </div>
        </div>
      </div>

      {/* Avatars Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-normal text-white">Mis Avatares</h2>
          <ObsidianButton
            onClick={() => setViewMode('create-avatar')}
            icon={<Plus size={16} />}
          >
            Nuevo Avatar
          </ObsidianButton>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {avatars.map(avatar => (
            <ObsidianCard key={avatar.id} className="group cursor-pointer hover:bg-white/[0.02] transition-all">
              <div className="aspect-square bg-[#16161A] rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                <User size={48} className="text-obsidian-text-muted opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button className="p-1.5 bg-obsidian-accent rounded text-white">
                      <Eye size={12} />
                    </button>
                    <button className="p-1.5 bg-white/10 rounded text-white">
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-normal text-white mb-1">{avatar.name}</h3>
              <div className="flex items-center gap-2 text-xs text-obsidian-text-muted">
                <span className="capitalize">{avatar.method}</span>
                <span>•</span>
                <span>{avatar.personality}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedAvatarId(avatar.id);
                  setSelectedVoiceId(avatar.voiceId || null);
                  setViewMode('video-editor');
                }}
                className="w-full mt-3 py-2 bg-obsidian-accent/10 border border-obsidian-accent/30 rounded text-obsidian-accent text-xs hover:bg-obsidian-accent/20 transition-all"
              >
                Crear Video
              </button>
            </ObsidianCard>
          ))}
        </div>

        {avatars.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-obsidian-text-muted">
            <User size={64} className="mb-4 opacity-20" />
            <p className="text-sm mb-4">No tienes avatares creados</p>
            <ObsidianButton
              onClick={() => setViewMode('create-avatar')}
              icon={<Plus size={16} />}
            >
              Crear Primer Avatar
            </ObsidianButton>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreateAvatar = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setViewMode('gallery')}
          className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide">Crear Nuevo Avatar</h1>
          <p className="text-sm text-obsidian-text-muted">Crea tu clon digital en 3 simples pasos</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Method Selection */}
          {creationStep === 1 && (
            <ObsidianCard>
              <h3 className="text-lg font-normal text-[#F5F5F7] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-obsidian-accent text-white text-xs flex items-center justify-center">1</span>
                Selecciona el Método de Creación
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'photo', icon: <Image size={32} />, title: 'Desde Foto', desc: 'Rápido y simple', difficulty: 'Básico' },
                  { id: 'video', icon: <Video size={32} />, title: 'Desde Video', desc: 'Mayor realismo', difficulty: 'Intermedio' },
                  { id: 'scan', icon: <Camera size={32} />, title: 'Escaneo 3D', desc: 'Máxima calidad', difficulty: 'Avanzado' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setCreationMethod(method.id as AvatarCreationMethod);
                      setCreationStep(2);
                    }}
                    className="p-6 border border-white/[0.1] rounded-lg hover:bg-white/[0.02] hover:border-obsidian-accent/50 transition-all text-center"
                  >
                    <div className="mb-4 text-obsidian-accent">{method.icon}</div>
                    <h4 className="text-sm font-normal text-white mb-2">{method.title}</h4>
                    <p className="text-xs text-obsidian-text-muted mb-2">{method.desc}</p>
                    <span className="text-[10px] px-2 py-1 bg-white/[0.05] rounded text-obsidian-text-muted">
                      {method.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </ObsidianCard>
          )}

          {/* Step 2: Upload */}
          {creationStep === 2 && creationMethod && (
            <ObsidianCard>
              <h3 className="text-lg font-normal text-[#F5F5F7] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-obsidian-accent text-white text-xs flex items-center justify-center">2</span>
                Sube tu {creationMethod === 'photo' ? 'Foto' : creationMethod === 'video' ? 'Video' : 'Escaneo'}
              </h3>

              <div className="border-2 border-dashed border-white/[0.1] rounded-lg p-12 text-center hover:border-obsidian-accent/50 transition-all cursor-pointer">
                <Upload size={48} className="mx-auto mb-4 text-obsidian-text-muted" />
                <p className="text-sm text-white mb-2">
                  Arrastra tu archivo aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-obsidian-text-muted">
                  {creationMethod === 'photo' && 'Formatos: JPG, PNG (mín. 1024x1024px)'}
                  {creationMethod === 'video' && 'Formatos: MP4, MOV (mín. 5 segundos)'}
                  {creationMethod === 'scan' && 'Formatos: OBJ, FBX, GLB'}
                </p>
                <input type="file" className="hidden" />
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setCreationStep(1)}
                  className="px-4 py-2 border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.05] transition-all"
                >
                  Atrás
                </button>
                <ObsidianButton onClick={() => setCreationStep(3)}>
                  Continuar
                </ObsidianButton>
              </div>
            </ObsidianCard>
          )}

          {/* Step 3: Configuration */}
          {creationStep === 3 && (
            <ObsidianCard>
              <h3 className="text-lg font-normal text-[#F5F5F7] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-obsidian-accent text-white text-xs flex items-center justify-center">3</span>
                Configuración del Avatar
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                    Nombre del Avatar *
                  </label>
                  <input
                    type="text"
                    value={newAvatarForm.name}
                    onChange={(e) => setNewAvatarForm({ ...newAvatarForm, name: e.target.value })}
                    placeholder="Ej: Mi Avatar CEO"
                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-3">
                    Personalidad Base
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PERSONALITIES.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setNewAvatarForm({ ...newAvatarForm, personality: p.id })}
                        className={`
                          p-4 border rounded-lg text-left transition-all
                          ${newAvatarForm.personality === p.id
                            ? 'bg-white/[0.04] border-obsidian-accent/50'
                            : 'border-white/[0.1] hover:bg-white/[0.02]'}
                        `}
                      >
                        <h4 className="text-sm font-normal text-white mb-1">{p.name}</h4>
                        <p className="text-xs text-obsidian-text-muted">{p.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setCreationStep(2)}
                  className="px-4 py-2 border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.05] transition-all"
                >
                  Atrás
                </button>
                <ObsidianButton
                  onClick={handleCreateAvatar}
                  icon={<Check size={16} />}
                >
                  Crear Avatar
                </ObsidianButton>
              </div>
            </ObsidianCard>
          )}
        </div>
      </div>
    </div>
  );

  const renderVideoEditor = () => {
    const selectedAvatar = avatars.find(a => a.id === selectedAvatarId);
    const selectedVoice = voices.find(v => v.id === selectedVoiceId);
    const selectedScene = scenes.find(s => s.id === selectedSceneId);

    return (
      <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('gallery')}
              className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide">Editor de Video</h1>
              <p className="text-sm text-obsidian-text-muted">
                Avatar: {selectedAvatar?.name || 'No seleccionado'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left: Preview */}
          <div className="w-[50%] flex flex-col gap-4">
            <ObsidianCard className="flex-1 relative" noPadding>
              <div className="absolute top-4 left-4 z-10">
                <h3 className="text-sm font-normal text-white mb-1">Vista Previa</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#45FF9A] animate-pulse"></div>
                  <span className="text-xs text-obsidian-text-muted">Live Preview</span>
                </div>
              </div>
              <canvas ref={canvasRef} className="w-full h-full" />
            </ObsidianCard>

            <ObsidianCard>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] text-obsidian-text-muted uppercase mb-2">Avatar</div>
                  <div className="text-sm text-white">{selectedAvatar?.name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-obsidian-text-muted uppercase mb-2">Voz</div>
                  <div className="text-sm text-white">{selectedVoice?.name || 'Por defecto'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-obsidian-text-muted uppercase mb-2">Escena</div>
                  <div className="text-sm text-white">{selectedScene?.name || 'Ninguna'}</div>
                </div>
              </div>
            </ObsidianCard>
          </div>

          {/* Right: Configuration */}
          <div className="w-[50%] flex flex-col gap-4 overflow-y-auto">
            <ObsidianCard>
              <h3 className="text-sm font-normal text-white mb-4">Información del Video</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                    Nombre del Video
                  </label>
                  <input
                    type="text"
                    value={videoName}
                    onChange={(e) => setVideoName(e.target.value)}
                    placeholder="Ej: Video de Presentación Q4"
                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                    Guion del Video
                  </label>
                  <textarea
                    value={videoScript}
                    onChange={(e) => setVideoScript(e.target.value)}
                    placeholder="Escribe o pega el guion que el avatar recitará..."
                    rows={6}
                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors resize-none"
                  />
                  <div className="mt-1 flex justify-between text-xs text-obsidian-text-muted">
                    <span>{videoScript.length} caracteres</span>
                    <span>~{Math.ceil(videoScript.split(' ').length / 2)} segundos</span>
                  </div>
                </div>
              </div>
            </ObsidianCard>

            <ObsidianCard>
              <h3 className="text-sm font-normal text-white mb-4">Seleccionar Voz</h3>
              <div className="space-y-2">
                {voices.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoiceId(voice.id)}
                    className={`
                      w-full p-3 border rounded-lg text-left transition-all
                      ${selectedVoiceId === voice.id
                        ? 'bg-white/[0.04] border-obsidian-accent/50'
                        : 'border-white/[0.1] hover:bg-white/[0.02]'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white">{voice.name}</div>
                        <div className="text-xs text-obsidian-text-muted">{voice.language}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-obsidian-text-muted">{voice.quality}%</span>
                        {selectedVoiceId === voice.id && <CheckCircle size={16} className="text-obsidian-accent" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ObsidianCard>

            <ObsidianCard>
              <h3 className="text-sm font-normal text-white mb-4">Seleccionar Escena</h3>
              <div className="grid grid-cols-2 gap-3">
                {scenes.map(scene => (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedSceneId(scene.id)}
                    className={`
                      p-3 border rounded-lg text-left transition-all
                      ${selectedSceneId === scene.id
                        ? 'bg-white/[0.04] border-obsidian-accent/50'
                        : 'border-white/[0.1] hover:bg-white/[0.02]'}
                    `}
                  >
                    <div className="aspect-video bg-[#16161A] rounded mb-2 flex items-center justify-center">
                      <Box size={24} className="text-obsidian-text-muted opacity-30" />
                    </div>
                    <div className="text-xs text-white">{scene.name}</div>
                  </button>
                ))}
              </div>
            </ObsidianCard>

            <div className="sticky bottom-0 bg-[#0B0B0D] pt-4">
              <ObsidianButton
                onClick={handleRenderVideo}
                icon={<Play size={16} />}
                className="w-full"
              >
                Renderizar Video
              </ObsidianButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVoiceLibrary = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('gallery')}
            className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide">Librería de Voces</h1>
            <p className="text-sm text-obsidian-text-muted">Gestiona tus voces clonadas</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <ObsidianCard className="mb-6">
            <h3 className="text-sm font-normal text-white mb-4">Clonar Nueva Voz</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                  Nombre de la Voz
                </label>
                <input
                  type="text"
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  placeholder="Ej: Mi Voz Principal"
                  className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors"
                />
              </div>

              <div className="p-6 border border-dashed border-white/[0.1] rounded-lg text-center">
                {!isRecordingVoice ? (
                  <>
                    <Mic size={48} className="mx-auto mb-4 text-obsidian-text-muted" />
                    <p className="text-sm text-white mb-2">Lee las siguientes frases para clonar tu voz</p>
                    <p className="text-xs text-obsidian-text-muted mb-4">
                      Necesitamos ~1 minuto de audio para crear un clon de alta calidad
                    </p>
                    <ObsidianButton
                      onClick={handleRecordVoice}
                      icon={<Mic2 size={16} />}
                    >
                      Comenzar Grabación
                    </ObsidianButton>
                  </>
                ) : (
                  <div>
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 border-4 border-obsidian-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-white mb-2">Grabando...</p>
                    <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-obsidian-accent transition-all duration-300"
                        style={{ width: `${recordingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-obsidian-text-muted mt-2">{recordingProgress}%</p>
                  </div>
                )}
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard>
            <h3 className="text-sm font-normal text-white mb-4">Mis Voces</h3>
            <div className="space-y-3">
              {voices.map(voice => (
                <div key={voice.id} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-normal text-white mb-1">{voice.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-obsidian-text-muted">
                        <span>{voice.language}</span>
                        <span>•</span>
                        <span>Calidad: {voice.quality}%</span>
                        <span>•</span>
                        <span>{voice.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 border border-white/[0.1] rounded hover:bg-white/[0.05] transition-all">
                        <Volume2 size={14} className="text-white" />
                      </button>
                      <button className="p-2 border border-white/[0.1] rounded hover:bg-white/[0.05] transition-all">
                        <Edit2 size={14} className="text-white" />
                      </button>
                      <button className="p-2 border border-red-500/[0.3] rounded hover:bg-red-500/[0.1] transition-all">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>
      </div>
    </div>
  );

  const renderSceneLibrary = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('gallery')}
            className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide">Librería de Escenas 3D</h1>
            <p className="text-sm text-obsidian-text-muted">Gestiona tus entornos virtuales</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <ObsidianCard className="mb-6">
            <h3 className="text-sm font-normal text-white mb-4">Generar Nueva Escena</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                  Descripción de la Escena
                </label>
                <textarea
                  value={sceneDescription}
                  onChange={(e) => setSceneDescription(e.target.value)}
                  placeholder="Ej: Un escritorio minimalista moderno con ventana panorámica a la ciudad, iluminación natural..."
                  rows={3}
                  className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors resize-none"
                />
              </div>
              <ObsidianButton
                onClick={handleGenerateScene}
                icon={isGeneratingScene ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                disabled={isGeneratingScene}
              >
                {isGeneratingScene ? 'Generando...' : 'Generar Escena 3D'}
              </ObsidianButton>
            </div>
          </ObsidianCard>

          <ObsidianCard>
            <h3 className="text-sm font-normal text-white mb-4">Mis Escenas</h3>
            <div className="grid grid-cols-3 gap-4">
              {scenes.map(scene => (
                <div key={scene.id} className="group">
                  <div className="aspect-video bg-[#16161A] rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                    <Box size={32} className="text-obsidian-text-muted opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button className="p-1.5 bg-white/10 rounded text-white">
                        <Eye size={12} />
                      </button>
                      <button className="p-1.5 bg-white/10 rounded text-white">
                        <Edit2 size={12} />
                      </button>
                      <button className="p-1.5 bg-red-500/20 rounded text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-normal text-white mb-1">{scene.name}</h4>
                  <p className="text-xs text-obsidian-text-muted line-clamp-2">{scene.description}</p>
                  <span className="text-[10px] px-2 py-0.5 bg-white/[0.05] rounded text-obsidian-text-muted inline-block mt-1">
                    {scene.category}
                  </span>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>
      </div>
    </div>
  );

  const renderContentGallery = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setViewMode('gallery')}
          className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide">Galería de Contenido</h1>
          <p className="text-sm text-obsidian-text-muted">Todos tus videos generados</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {videoContents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-obsidian-text-muted">
            <FileVideo size={64} className="mb-4 opacity-20" />
            <p className="text-sm mb-4">No hay contenido generado</p>
            <ObsidianButton onClick={() => setViewMode('gallery')}>
              Ir a Crear Video
            </ObsidianButton>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {videoContents.map(video => (
              <ObsidianCard key={video.id} className="group">
                <div className="aspect-video bg-[#16161A] rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  {video.status === 'processing' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader size={32} className="text-obsidian-accent animate-spin mb-2" />
                      <div className="text-xs text-white">{video.progress}%</div>
                    </div>
                  ) : (
                    <>
                      <Film size={48} className="text-obsidian-text-muted opacity-30" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-obsidian-accent flex items-center justify-center">
                          <Play size={20} className="text-white" />
                        </div>
                      </button>
                    </>
                  )}
                </div>

                <h3 className="text-sm font-normal text-white mb-1">{video.name}</h3>
                <div className="flex items-center gap-2 text-xs text-obsidian-text-muted mb-3">
                  <span>{video.duration}s</span>
                  <span>•</span>
                  <span className={`
                    ${video.status === 'completed' ? 'text-green-400' : ''}
                    ${video.status === 'processing' ? 'text-yellow-400' : ''}
                    ${video.status === 'failed' ? 'text-red-400' : ''}
                  `}>
                    {video.status}
                  </span>
                </div>

                {video.status === 'completed' && (
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-obsidian-accent/10 border border-obsidian-accent/30 rounded text-obsidian-accent text-xs hover:bg-obsidian-accent/20 transition-all flex items-center justify-center gap-1">
                      <Download size={12} />
                      Descargar
                    </button>
                    <button className="flex-1 py-2 border border-white/[0.1] rounded text-white text-xs hover:bg-white/[0.05] transition-all flex items-center justify-center gap-1">
                      <Share2 size={12} />
                      Compartir
                    </button>
                  </div>
                )}

                {video.status === 'processing' && (
                  <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-obsidian-accent transition-all duration-300"
                      style={{ width: `${video.progress}%` }}
                    />
                  </div>
                )}
              </ObsidianCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // --- Main Render ---
  switch (viewMode) {
    case 'gallery':
      return renderGallery();
    case 'create-avatar':
      return renderCreateAvatar();
    case 'video-editor':
      return renderVideoEditor();
    case 'voice-library':
      return renderVoiceLibrary();
    case 'scene-library':
      return renderSceneLibrary();
    case 'content-gallery':
      return renderContentGallery();
    default:
      return renderGallery();
  }
};

export default AvatarStudio;
