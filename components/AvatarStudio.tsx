import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider, ObsidianInput } from './ui/ObsidianElements';
import {
  Camera, Mic, Play, Box, Layers, User, Wand2, RefreshCw, PenTool,
  Plus, Video, Image, Film, Volume2, Download, Share2, Trash2,
  Edit2, Eye, ChevronRight, Upload, FileVideo, Sparkles, Check,
  X, Grid3x3, LayoutGrid, FolderOpen, Pause, StopCircle, Mic2,
  Settings, ArrowLeft, CheckCircle, AlertCircle, Loader, Move, ZoomIn, RotateCw, History
} from 'lucide-react';

// --- Types ---
type ViewMode = 'gallery' | 'studio' | 'create';
type RenderStatus = 'idle' | 'processing' | 'completed' | 'failed';
type AvatarCreationMethod = 'photo' | 'video' | 'scan' | null;

interface GeneratedAsset {
  id: string;
  type: 'video' | 'scene' | 'hologram';
  name: string;
  preview: string;
  status: RenderStatus;
  createdAt: Date;
  details?: string;
}

interface Avatar {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'rendering';
  lastActive: string;
  personality: string;
}

const PERSONALITIES = [
  { id: 'formal', name: 'Formal Executive', desc: 'Profesional, serio, directo' },
  { id: 'friendly', name: 'Friendly Advisor', desc: 'Cálido, empático, paciente' },
  { id: 'aggressive', name: 'Aggressive Sales', desc: 'Enérgico, persuasivo, rápido' }
];

const INITIAL_AVATARS: Avatar[] = [
  { id: '1', name: 'Mi Avatar Verano', status: 'online', lastActive: 'Ahora', personality: 'Formal Executive' },
  { id: '2', name: 'Sales Clone V1', status: 'offline', lastActive: 'Hace 2h', personality: 'Aggressive Sales' },
  { id: '3', name: 'Support Agent', status: 'rendering', lastActive: 'Procesando...', personality: 'Friendly Advisor' }
];

const AvatarStudio: React.FC = () => {
  // --- State ---
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [avatars, setAvatars] = useState<Avatar[]>(INITIAL_AVATARS);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  // Creation State
  const [creationStep, setCreationStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState<AvatarCreationMethod>(null);
  const [newAvatarData, setNewAvatarData] = useState({ name: '', personality: 'formal' });

  // Avatar Core (Studio State)
  const [selectedPersonality, setSelectedPersonality] = useState('formal');
  const [voiceVolume, setVoiceVolume] = useState(50);
  const [skillInput, setSkillInput] = useState('');
  const [activeSkills, setActiveSkills] = useState(['Leyes Fiscales', 'Oratoria Avanzada']);
  
  // Viewport
  const [viewControl, setViewControl] = useState<'orbit' | 'zoom' | 'pan'>('orbit');
  
  // Asset Forge
  const [videoScript, setVideoScript] = useState('');
  const [scenePrompt, setScenePrompt] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [videoType, setVideoType] = useState<'demo' | 'pitch'>('demo');
  
  // Processing & History
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<GeneratedAsset[]>([
    { id: '1', type: 'video', name: 'Pitch Q4', preview: 'video', status: 'completed', createdAt: new Date(Date.now() - 10000000) },
    { id: '2', type: 'scene', name: 'Oficina Futura', preview: 'scene', status: 'completed', createdAt: new Date(Date.now() - 20000000) },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Canvas Animation (Volumetric View) ---
  useEffect(() => {
    if (viewMode !== 'studio') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * 2; // Retina support
      canvas.height = height * 2;
      ctx.scale(2, 2);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3D Point Cloud Generation
    const points: {x: number, y: number, z: number, originalY: number}[] = [];
    const layers = 25; // More density
    
    // Body shape approximation
    for (let i = 0; i < layers; i++) {
      const y = -1 + (i / (layers - 1)) * 2;
      // Simple shaping function for torso/head
      let radius = Math.cos(y * 1.5) * 0.5 + 0.3; 
      if (y > 0.6) radius = 0.25; // Head
      
      const segments = 20;
      for (let j = 0; j < segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        // Add some noise
        const noise = (Math.random() - 0.5) * 0.05;
        points.push({
          x: Math.cos(angle) * (radius + noise),
          y: y,
          z: Math.sin(angle) * (radius + noise),
          originalY: y
        });
      }
    }

    let time = 0;
    let animationId: number;

    const render = () => {
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      time += 0.015;

      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      const scaleBase = height * 0.35;

      // Rotation based on time or interaction could go here
      const rotY = time * 0.5;

      // Draw Floor
      ctx.strokeStyle = 'rgba(106, 79, 251, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=-6; i<=6; i++) {
        // Horizontal lines
        // A simple perspective grid hack
        // ... (simplified grid for visual clarity)
        ctx.moveTo(cx - 100, cy + 140 + i*5);
        ctx.lineTo(cx + 100, cy + 140 + i*5);
      }
      ctx.stroke();

      // Sort points by Z for depth
      const projectedPoints = points.map(p => {
        // Rotate around Y
        const rx = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
        const rz = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
        
        // Perspective projection
        const fov = 2;
        const scale = fov / (fov + rz);
        const x2d = rx * scale * scaleBase + cx;
        const y2d = p.y * scale * scaleBase + cy;
        
        return { x: x2d, y: y2d, z: rz, scale, originalY: p.y };
      }).sort((a, b) => b.z - a.z);

      // Draw Points
      projectedPoints.forEach(p => {
        const alpha = (p.z + 1.5) / 2.5; // Depth cue
        
        // "Holographic" color palette
        // Base blue/purple
        let r = 100, g = 80, b = 255;
        
        // Highlight logic (e.g. scanning effect)
        const scanHeight = Math.sin(time * 2) * 1.2; // Move up and down
        if (Math.abs(p.originalY - scanHeight) < 0.2) {
            r = 255; g = 255; b = 255; // White hot scan line
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0.1, alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationId);
    };
  }, [viewMode]);

  // --- Handlers ---
  const handleAddSkill = () => {
    if (skillInput) {
      setActiveSkills([...activeSkills, skillInput]);
      setSkillInput('');
    }
  };

  const handleGenerate = (type: 'video' | 'scene' | 'hologram') => {
    setIsProcessing(true);
    // Mock processing delay
    setTimeout(() => {
      const newAsset: GeneratedAsset = {
        id: Date.now().toString(),
        type,
        name: type === 'video' ? (videoScript.substring(0, 15) || 'Nuevo Video') 
              : type === 'scene' ? (scenePrompt.substring(0, 15) || 'Nueva Escena')
              : (ctaText.substring(0, 15) || 'Nuevo CTA'),
        preview: type,
        status: 'completed',
        createdAt: new Date()
      };
      setHistory([newAsset, ...history]);
      setIsProcessing(false);
      
      // Clear inputs
      if (type === 'video') setVideoScript('');
      if (type === 'scene') setScenePrompt('');
      if (type === 'hologram') setCtaText('');
    }, 2000);
  };

  const handleSelectAvatar = (avatar: Avatar) => {
      setSelectedAvatar(avatar);
      // Pre-select personality based on mock data for effect
      const pId = PERSONALITIES.find(p => p.name === avatar.personality)?.id || 'formal';
      setSelectedPersonality(pId);
      setViewMode('studio');
  };

  const handleCreateNew = () => {
      if (!newAvatarData.name) return;
      
      const newAvatar: Avatar = {
          id: Date.now().toString(),
          name: newAvatarData.name,
          status: 'rendering', // Initial status
          lastActive: 'Procesando...',
          personality: PERSONALITIES.find(p => p.id === newAvatarData.personality)?.name || 'Formal Executive'
      };
      
      setAvatars([...avatars, newAvatar]);
      
      // Reset & Redirect
      setCreationStep(1);
      setNewAvatarData({ name: '', personality: 'formal' });
      setCreationMethod(null);
      setViewMode('gallery');
  };

  // --- Render Functions ---

  const renderCreateAvatar = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary flex flex-col overflow-hidden">
      <div className="h-16 px-6 border-b border-white/[0.06] flex items-center justify-between bg-[#0B0B0D]">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setViewMode('gallery')}
                className="p-2 rounded hover:bg-white/10 text-obsidian-text-muted hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-light text-[#F5F5F7] tracking-wider">CREAR NUEVO AVATAR</h1>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto flex justify-center">
        <div className="max-w-4xl w-full">
            {/* Steps Indicator */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/[0.1] -z-10"></div>
                {[1, 2, 3].map(step => (
                    <div key={step} className={`flex items-center gap-2 bg-[#0B0B0D] px-4 ${creationStep >= step ? 'text-white' : 'text-obsidian-text-muted'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${creationStep >= step ? 'bg-obsidian-accent border-obsidian-accent' : 'border-white/[0.2] bg-[#0B0B0D]'}`}>
                            {step}
                        </div>
                        <span className="text-sm font-medium tracking-wide">
                            {step === 1 ? 'MÉTODO' : step === 2 ? 'ARCHIVO' : 'CONFIGURACIÓN'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step 1: Method */}
            {creationStep === 1 && (
                <ObsidianCard className="animate-[fadeIn_0.3s_ease-out]">
                    <h2 className="text-lg font-normal text-white mb-6 text-center">Selecciona el origen de tu clon</h2>
                    <div className="grid grid-cols-3 gap-6">
                         {[
                             { id: 'photo', icon: <Image size={32} />, title: 'Desde Foto', desc: 'Rápido. Requiere 1 foto frontal de alta calidad.', difficulty: 'Básico' },
                             { id: 'video', icon: <Video size={32} />, title: 'Desde Video', desc: 'Mayor realismo. Requiere video de 30s hablando.', difficulty: 'Intermedio' },
                             { id: 'scan', icon: <Camera size={32} />, title: 'Escaneo 3D', desc: 'Máxima fidelidad. Requiere archivo .obj o .fbx.', difficulty: 'Pro' }
                         ].map(m => (
                             <button 
                                key={m.id}
                                onClick={() => { setCreationMethod(m.id as any); setCreationStep(2); }}
                                className="flex flex-col items-center p-8 border border-white/[0.1] rounded-lg hover:bg-white/[0.03] hover:border-obsidian-accent/50 transition-all text-center group"
                             >
                                 <div className="text-obsidian-accent mb-4 group-hover:scale-110 transition-transform">{m.icon}</div>
                                 <h3 className="text-white font-medium mb-2">{m.title}</h3>
                                 <p className="text-xs text-obsidian-text-muted leading-relaxed mb-4">{m.desc}</p>
                                 <span className="text-[10px] bg-white/[0.05] px-2 py-1 rounded text-white/50">{m.difficulty}</span>
                             </button>
                         ))}
                    </div>
                </ObsidianCard>
            )}

            {/* Step 2: Upload */}
            {creationStep === 2 && (
                <ObsidianCard className="animate-[fadeIn_0.3s_ease-out]">
                    <h2 className="text-lg font-normal text-white mb-6 text-center">Sube tu archivo fuente</h2>
                    <div className="border-2 border-dashed border-white/[0.1] rounded-lg p-16 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.01] hover:border-obsidian-accent/30 transition-all">
                        <Upload size={48} className="text-obsidian-text-muted mb-4" />
                        <p className="text-white mb-2">Arrastra y suelta tu archivo aquí</p>
                        <p className="text-xs text-obsidian-text-muted mb-6">Soporta JPG, PNG, MP4, MOV, OBJ (Max 500MB)</p>
                        <ObsidianButton variant="secondary" className="w-auto px-6">Seleccionar Archivo</ObsidianButton>
                    </div>
                    <div className="flex justify-between mt-6">
                        <button onClick={() => setCreationStep(1)} className="text-sm text-obsidian-text-muted hover:text-white px-4 py-2">Atrás</button>
                        <ObsidianButton onClick={() => setCreationStep(3)} className="w-auto px-8">Continuar</ObsidianButton>
                    </div>
                </ObsidianCard>
            )}

            {/* Step 3: Config */}
            {creationStep === 3 && (
                <ObsidianCard className="animate-[fadeIn_0.3s_ease-out]">
                    <h2 className="text-lg font-normal text-white mb-6 text-center">Configuración Final</h2>
                    <div className="max-w-md mx-auto space-y-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium mb-2 block">Nombre del Avatar</label>
                            <input 
                                value={newAvatarData.name}
                                onChange={(e) => setNewAvatarData({...newAvatarData, name: e.target.value})}
                                className="w-full bg-[#0B0B0D] border border-white/[0.1] rounded p-3 text-white focus:border-obsidian-accent outline-none"
                                placeholder="Ej: Mi Clon Digital"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium mb-2 block">Personalidad Base</label>
                            <div className="grid grid-cols-3 gap-2">
                                {PERSONALITIES.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => setNewAvatarData({...newAvatarData, personality: p.id})}
                                        className={`p-2 border rounded text-xs transition-all ${newAvatarData.personality === p.id ? 'bg-obsidian-accent/20 border-obsidian-accent text-white' : 'border-white/[0.1] text-obsidian-text-muted hover:bg-white/[0.02]'}`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-8">
                        <button onClick={() => setCreationStep(2)} className="text-sm text-obsidian-text-muted hover:text-white px-4 py-2">Atrás</button>
                        <ObsidianButton onClick={handleCreateNew} className="w-auto px-8" icon={<Wand2 size={16} />}>Generar Avatar</ObsidianButton>
                    </div>
                </ObsidianCard>
            )}
        </div>
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-20 px-8 border-b border-white/[0.06] flex items-center justify-between bg-[#0B0B0D]">
            <div>
            <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wider flex items-center gap-3">
                <User className="text-obsidian-accent" size={28} />
                AVATAR STUDIO <span className="text-obsidian-text-muted text-lg font-normal">& MEDIA</span>
            </h1>
            <p className="text-sm text-obsidian-text-muted mt-1 ml-10">Gestiona tus clones digitales y genera contenido</p>
            </div>
            <ObsidianButton icon={<Plus size={16} />} onClick={() => { setCreationStep(1); setViewMode('create'); }}>
                NUEVO AVATAR
            </ObsidianButton>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-sm font-medium text-white tracking-widest mb-6 flex items-center gap-2">
                <LayoutGrid size={16} /> MIS AVATARES
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {avatars.map(avatar => (
                    <ObsidianCard key={avatar.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" noPadding>
                        <div onClick={() => handleSelectAvatar(avatar)}>
                            <div className="h-48 bg-[#16161A] relative flex items-center justify-center overflow-hidden">
                                {/* Mock Volumetric Preview Background */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-obsidian-accent/40 via-transparent to-transparent"></div>
                                <User size={64} className="text-white/20 relative z-10" />
                                
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <span className={`
                                        px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border
                                        ${avatar.status === 'online' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 
                                          avatar.status === 'rendering' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 
                                          'bg-white/5 text-obsidian-text-muted border-white/10'}
                                    `}>
                                        {avatar.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <h3 className="text-lg text-white font-medium mb-1 group-hover:text-obsidian-accent transition-colors">{avatar.name}</h3>
                                <p className="text-sm text-obsidian-text-muted mb-4">{avatar.personality}</p>
                                
                                <div className="flex justify-between items-center text-xs text-obsidian-text-muted/60 pt-4 border-t border-white/[0.06]">
                                    <span>Última actividad: {avatar.lastActive}</span>
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </ObsidianCard>
                ))}
                
                {/* Add New Placeholder Card */}
                <button 
                    onClick={() => { setCreationStep(1); setViewMode('create'); }}
                    className="border border-dashed border-white/[0.1] rounded-lg h-full min-h-[300px] flex flex-col items-center justify-center text-obsidian-text-muted hover:text-white hover:border-obsidian-accent/50 hover:bg-white/[0.02] transition-all group"
                >
                    <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4 group-hover:bg-obsidian-accent/20 transition-colors">
                        <Plus size={32} className="opacity-50 group-hover:opacity-100" />
                    </div>
                    <span className="text-sm font-medium tracking-wide">CREAR NUEVO CLON</span>
                </button>
            </div>
        </div>
    </div>
  );

  const renderStudio = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 px-6 border-b border-white/[0.06] flex items-center justify-between bg-[#0B0B0D]">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setViewMode('gallery')}
                className="p-2 rounded hover:bg-white/10 text-obsidian-text-muted hover:text-white transition-colors"
                title="Volver a la galería"
            >
                <ArrowLeft size={20} />
            </button>
            <div className="h-8 w-[1px] bg-white/[0.1] mx-2"></div>
            <div>
            <h1 className="text-xl font-light text-[#F5F5F7] tracking-wider flex items-center gap-2">
                <User className="text-obsidian-accent" size={20} />
                STUDIO <span className="text-obsidian-text-muted text-sm font-normal">EDITOR</span>
            </h1>
            </div>
        </div>
        <div className="flex gap-4">
           <ObsidianButton variant="outline" className="flex items-center gap-2">
             <BookOpen size={14} /> Tutorial
           </ObsidianButton>
        </div>
      </div>

      {/* Main Content Grid (3 Columns) */}
      <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* LEFT PANEL: AVATAR CORE */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          <ObsidianCard className="flex-1 flex flex-col gap-6">
            <h2 className="text-sm font-medium text-white tracking-widest border-b border-white/[0.06] pb-3 mb-1">
              AVATAR CORE
            </h2>

            {/* Avatar Selector */}
            <div className="space-y-3">
               <label className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium">
                  Avatar Activo
               </label>
               <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-lg border border-white/[0.06]">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-obsidian-accent to-purple-900 flex items-center justify-center">
                   <User size={20} className="text-white" />
                 </div>
                 <div className="flex-1">
                   <div className="text-sm text-white font-medium">{selectedAvatar?.name || 'Mi Avatar'}</div>
                   <div className="text-[10px] text-green-400 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                   </div>
                 </div>
               </div>
               <ObsidianButton variant="secondary" className="text-xs py-2 h-auto" icon={<Camera size={14} />}>
                 NUEVO ESCANEO
               </ObsidianButton>
            </div>

            {/* Personalities */}
            <div className="space-y-3">
               <label className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium">
                  Personalidades
               </label>
               <div className="space-y-2">
                 {PERSONALITIES.map(p => (
                   <div 
                     key={p.id}
                     onClick={() => setSelectedPersonality(p.id)}
                     className={`
                       p-3 rounded-md border cursor-pointer transition-all
                       ${selectedPersonality === p.id 
                         ? 'bg-obsidian-accent/10 border-obsidian-accent/50 shadow-[0_0_15px_rgba(106,79,251,0.1)]' 
                         : 'bg-transparent border-white/[0.06] hover:bg-white/[0.02]'}
                     `}
                   >
                     <div className="flex justify-between items-center mb-1">
                       <span className={`text-xs font-medium ${selectedPersonality === p.id ? 'text-white' : 'text-obsidian-text-muted'}`}>
                         {p.name}
                       </span>
                       {selectedPersonality === p.id && <CheckCircle size={12} className="text-obsidian-accent" />}
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Voice Model */}
            <div className="space-y-4">
              <ObsidianSlider 
                label="MODELO DE VOZ (Intensidad)" 
                value={voiceVolume} 
                onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
                min={0} max={100}
                valueDisplay={`${voiceVolume}%`}
              />
              <ObsidianButton variant="secondary" className="text-xs py-2 h-auto flex items-center gap-2">
                <Play size={12} /> Test de Voz (Audio)
              </ObsidianButton>
            </div>

            {/* Skill Injection */}
            <div className="space-y-3">
               <label className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium">
                  Skill Injection
               </label>
               <div className="flex gap-2">
                 <input 
                   className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded text-xs px-3 py-2 text-white focus:border-obsidian-accent outline-none"
                   placeholder="Ej: Leyes fiscales..."
                   value={skillInput}
                   onChange={(e) => setSkillInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                 />
                 <button 
                   onClick={handleAddSkill}
                   className="p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded border border-white/[0.06] text-white transition-colors"
                 >
                   <Plus size={14} />
                 </button>
               </div>
               <div className="flex flex-wrap gap-2 mt-2">
                 {activeSkills.map((skill, idx) => (
                   <span key={idx} className="text-[10px] px-2 py-1 bg-obsidian-accent/20 border border-obsidian-accent/30 rounded text-white flex items-center gap-1">
                     <Sparkles size={8} /> {skill}
                   </span>
                 ))}
               </div>
            </div>

          </ObsidianCard>
        </div>

        {/* CENTER PANEL: VIEWPORT */}
        <div className="col-span-5 flex flex-col gap-4">
          <ObsidianCard className="flex-1 relative overflow-hidden flex flex-col" noPadding active>
             {/* Header Overlay */}
             <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
               <div>
                 <h2 className="text-sm font-medium text-white tracking-widest">VIEWPORT VOLUMÉTRICO</h2>
                 <div className="flex items-center gap-2 mt-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#45FF9A] animate-pulse" />
                   <span className="text-[10px] text-[#45FF9A] uppercase tracking-wider">LIVE PREVIEW • {PERSONALITIES.find(p => p.id === selectedPersonality)?.name.toUpperCase()}</span>
                 </div>
               </div>
               <div className="flex gap-2 pointer-events-auto">
                 <button className="p-2 bg-black/40 backdrop-blur rounded border border-white/10 hover:bg-white/10 text-white"><Grid3x3 size={14} /></button>
                 <button className="p-2 bg-black/40 backdrop-blur rounded border border-white/10 hover:bg-white/10 text-white"><Settings size={14} /></button>
               </div>
             </div>

             {/* Canvas */}
             <div className="flex-1 bg-[#050505] relative">
               <canvas ref={canvasRef} className="w-full h-full" />
               
               {/* Center overlay info (optional) */}
               <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-50">
                  <div className="text-[10px] text-white/50 tracking-[0.5em] uppercase">Render Core v2.4</div>
               </div>
             </div>

             {/* Controls Overlay */}
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0F0F12]/80 backdrop-blur-md p-1.5 rounded-full border border-white/10 z-10">
               {[
                 { id: 'orbit', icon: <RotateCw size={16} />, label: 'Orbit' },
                 { id: 'zoom', icon: <ZoomIn size={16} />, label: 'Zoom' },
                 { id: 'pan', icon: <Move size={16} />, label: 'Pan' }
               ].map(ctrl => (
                 <button
                   key={ctrl.id}
                   onClick={() => setViewControl(ctrl.id as any)}
                   className={`
                     p-2.5 rounded-full transition-all flex items-center justify-center
                     ${viewControl === ctrl.id ? 'bg-obsidian-accent text-white shadow-lg' : 'text-obsidian-text-muted hover:text-white hover:bg-white/10'}
                   `}
                   title={ctrl.label}
                 >
                   {ctrl.icon}
                 </button>
               ))}
             </div>
          </ObsidianCard>
          
          {/* Recent Generations (History) - Moved here for better space utilization as "Console" */}
          <ObsidianCard className="h-48 flex flex-col">
            <h2 className="text-xs font-medium text-white tracking-widest border-b border-white/[0.06] pb-2 mb-2 flex items-center gap-2">
              <History size={12} /> HISTORIAL DE GENERACIÓN
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
               {history.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-obsidian-text-muted opacity-50">
                   <p className="text-xs">No hay generaciones recientes</p>
                 </div>
               ) : (
                 history.map(item => (
                   <div key={item.id} className="flex items-center gap-3 p-2 rounded bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group">
                     <div className="w-8 h-8 rounded bg-[#1A1A1E] flex items-center justify-center text-obsidian-accent">
                       {item.type === 'video' ? <Film size={14} /> : item.type === 'scene' ? <Box size={14} /> : <Sparkles size={14} />}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between">
                         <h4 className="text-xs text-white truncate">{item.name}</h4>
                         <span className="text-[10px] text-green-400">{item.status}</span>
                       </div>
                       <div className="text-[10px] text-obsidian-text-muted">{item.createdAt.toLocaleTimeString()}</div>
                     </div>
                     <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white text-obsidian-text-muted">
                       <Download size={14} />
                     </button>
                   </div>
                 ))
               )}
            </div>
          </ObsidianCard>
        </div>

        {/* RIGHT PANEL: ASSET FORGE */}
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pl-1">
          <ObsidianCard className="flex-1 flex flex-col gap-6">
            <h2 className="text-sm font-medium text-white tracking-widest border-b border-white/[0.06] pb-3 mb-1">
              ASSET FORGE
            </h2>

            {/* Video Volumetric */}
            <div className="space-y-3 pb-4 border-b border-white/[0.05]">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium flex items-center gap-2">
                  <Film size={12} /> Video Volumétrico
                </label>
                <div className="flex bg-white/[0.05] rounded p-0.5">
                   <button 
                     onClick={() => setVideoType('demo')}
                     className={`text-[10px] px-2 py-0.5 rounded transition-all ${videoType === 'demo' ? 'bg-white/10 text-white' : 'text-obsidian-text-muted'}`}
                   >Demo</button>
                   <button 
                     onClick={() => setVideoType('pitch')}
                     className={`text-[10px] px-2 py-0.5 rounded transition-all ${videoType === 'pitch' ? 'bg-white/10 text-white' : 'text-obsidian-text-muted'}`}
                   >Pitch</button>
                </div>
              </div>
              
              <div className="relative group">
                <textarea
                  value={videoScript}
                  onChange={(e) => setVideoScript(e.target.value)}
                  placeholder="Escribe el guion para el avatar (ej: 'Hola, soy tu asistente virtual...')"
                  rows={3}
                  className="w-full bg-[#050505] border border-white/[0.1] rounded-lg p-3 text-xs text-white focus:border-obsidian-accent outline-none resize-none transition-all"
                />
                <div className="absolute bottom-2 right-2 text-[10px] text-white/20">{videoScript.length} chars</div>
              </div>
              
              <ObsidianButton 
                onClick={() => handleGenerate('video')}
                isLoading={isProcessing}
                className="bg-obsidian-accent/10 text-obsidian-accent border-obsidian-accent/30 hover:bg-obsidian-accent/20"
              >
                RENDER VIDEO
              </ObsidianButton>
            </div>

            {/* 3D Scenes */}
            <div className="space-y-3 pb-4 border-b border-white/[0.05]">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium flex items-center gap-2">
                  <Box size={12} /> Escenas & 3D
                </label>
                <span className="text-[10px] text-white bg-white/10 px-1.5 py-0.5 rounded">27</span>
              </div>
              
              <input
                value={scenePrompt}
                onChange={(e) => setScenePrompt(e.target.value)}
                placeholder="Desc: escritorio minimalista..."
                className="w-full bg-[#050505] border border-white/[0.1] rounded-lg p-3 text-xs text-white focus:border-obsidian-accent outline-none"
              />
              
              <ObsidianButton 
                onClick={() => handleGenerate('scene')}
                isLoading={isProcessing}
                variant="outline"
              >
                GENERATE 3D SCENE
              </ObsidianButton>
            </div>

            {/* Holograph IA */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium flex items-center gap-2">
                  <Sparkles size={12} /> Holograph IA (AR)
                </label>
                <span className="text-[10px] text-white bg-white/10 px-1.5 py-0.5 rounded">26</span>
              </div>
              
              <input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Texto: Haz clic aquí..."
                className="w-full bg-[#050505] border border-white/[0.1] rounded-lg p-3 text-xs text-white focus:border-obsidian-accent outline-none"
              />
              
              <ObsidianButton 
                 onClick={() => handleGenerate('hologram')}
                 isLoading={isProcessing}
                 variant="outline"
              >
                GENERATE CTA
              </ObsidianButton>
            </div>

          </ObsidianCard>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'create') return renderCreateAvatar();
  return viewMode === 'gallery' ? renderGallery() : renderStudio();
};

// Helper Icon for "Tutorial" button
const BookOpen = ({ size }: { size: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

export default AvatarStudio;
