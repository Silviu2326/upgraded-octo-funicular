import React, { useState } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianInput, ObsidianSwitch } from './ui/ObsidianElements';
import {
  MessageSquareText, Hash, Send, Calendar as CalendarIcon, Image as ImageIcon,
  TrendingUp, RefreshCw, Sparkles, Globe, BarChart3,
  Twitter, Linkedin, Instagram, Facebook, Zap, CheckCircle2,
  Clock, AlertCircle, MoreHorizontal, Plus, ArrowLeft, ChevronLeft, ChevronRight, GripVertical, List, Layout, Edit, Trash, Inbox, MessageCircle, User, Reply, Check
} from 'lucide-react';

// --- Types ---
type Platform = 'twitter' | 'linkedin' | 'instagram';
type PostStatus = 'draft' | 'scheduled' | 'published';
type ViewMode = 'studio' | 'calendar' | 'list' | 'inbox';

interface SocialPost {
  id: string;
  content: string;
  platform: Platform;
  status: PostStatus;
  scheduledFor?: Date;
  predictedEngagement?: number; // 0-100
  image?: string;
}

interface Trend {
  id: string;
  tag: string;
  volume: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
}

interface InboxMessage {
  id: string;
  author: string;
  handle: string;
  platform: Platform;
  content: string;
  time: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'unread' | 'read' | 'replied';
  replyDraft?: string;
}

// --- Mock Data ---
const TRENDS: Trend[] = [
  { id: '1', tag: '#AIRevolution', volume: '2.4M', sentiment: 'positive', category: 'Tech' },
  { id: '2', tag: '#SustainableFuture', volume: '890K', sentiment: 'positive', category: 'Environment' },
  { id: '3', tag: '#CryptoRegulation', volume: '450K', sentiment: 'neutral', category: 'Finance' },
  { id: '4', tag: '#RemoteWork', volume: '1.2M', sentiment: 'neutral', category: 'Business' },
];

const NEWS_ALERTS = [
  { id: '1', headline: "OpenAI lanza GPT-5 con razonamiento autónomo", source: "TechCrunch", velocity: 'Very High', relevance: 98, time: '2m ago' },
  { id: '2', headline: "La UE aprueba nueva ley de IA: Impacto en SaaS", source: "Reuters", velocity: 'High', relevance: 92, time: '15m ago' },
  { id: '3', headline: "Google integra Gemini en todos los Android", source: "The Verge", velocity: 'Medium', relevance: 85, time: '1h ago' },
];

const INITIAL_POSTS: SocialPost[] = [
  { id: '1', content: "El futuro de la IA no es reemplazar, es potenciar. 🚀 #AI #Tech", platform: 'twitter', status: 'scheduled', scheduledFor: new Date(Date.now() + 3600000), predictedEngagement: 85 },
  { id: '2', content: "Lanzamos nuestra nueva iniciativa de sostenibilidad...", platform: 'linkedin', status: 'draft', predictedEngagement: 60 },
  { id: '3', content: "Behind the scenes at our new office! 📸", platform: 'instagram', status: 'scheduled', scheduledFor: new Date(Date.now() + 86400000 * 2), predictedEngagement: 78 },
];

const INBOX_MESSAGES: InboxMessage[] = [
  { id: '1', author: 'Sarah Connor', handle: '@sarah_connor', platform: 'twitter', content: '¿Esta nueva funcionalidad de IA incluye soporte para multi-idioma? Sería genial para nuestro equipo global.', time: '10m', sentiment: 'positive', status: 'unread' },
  { id: '2', author: 'Tech Daily', handle: '@techdaily', platform: 'linkedin', content: 'Impresionante avance. Nos gustaría cubrir esto en nuestro próximo artículo sobre tendencias SaaS.', time: '2h', sentiment: 'positive', status: 'unread' },
  { id: '3', author: 'John Doe', handle: '@johndoe', platform: 'instagram', content: 'El enlace de la bio no funciona 😢', time: '5h', sentiment: 'negative', status: 'read' },
  { id: '4', author: 'Alice Smith', handle: '@alice_s', platform: 'twitter', content: 'No estoy segura de entender la diferencia con la versión anterior.', time: '1d', sentiment: 'neutral', status: 'replied', replyDraft: 'Hola Alice, la principal diferencia radica en el motor de inferencia...' },
];

const ContentSocialStudio: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('studio');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('twitter');
  const [postContent, setPostContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viralScore, setViralScore] = useState(0);
  
  // Data State
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(INBOX_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(INBOX_MESSAGES[0].id);
  const [replyText, setReplyText] = useState('');

  // Smart Remix State
  const [remixMode, setRemixMode] = useState(false);
  const [variations, setVariations] = useState<Record<Platform, string>>({
    twitter: '',
    linkedin: '',
    instagram: ''
  });

  // Image Generator State
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Newsjacking State
  const [newsjackingMode, setNewsjackingMode] = useState(false);

  // Auto-Responder State
  const [autoResponderEnabled, setAutoResponderEnabled] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<'support' | 'friend' | 'witty'>('support');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Drag & Drop State
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null); // Format: "DayIndex-Hour"

  // --- Helper Functions ---
  const getPlatformIcon = (p: Platform, size = 16) => {
    switch(p) {
      case 'twitter': return <Twitter size={size} />;
      case 'linkedin': return <Linkedin size={size} />;
      case 'instagram': return <Instagram size={size} />;
    }
  };

  const getPlatformColor = (p: Platform) => {
    switch(p) {
      case 'twitter': return 'text-sky-400 border-sky-400/30 bg-sky-400/10';
      case 'linkedin': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'instagram': return 'text-pink-500 border-pink-500/30 bg-pink-500/10';
    }
  };

  // --- Handlers ---
  const handleGenerateAI = () => {
    setIsGenerating(true);
    // Simulate AI Generation
    setTimeout(() => {
      setPostContent("Descubre cómo la computación cuántica cambiará las reglas del juego en 2026. La velocidad de procesamiento ya no será un límite. 🌌\n\n¿Estás preparado para el salto cuántico?\n\n#Quantum #Innovation #FutureTech");
      setViralScore(92);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSmartRemix = () => {
    if (!postContent) return;
    setIsGenerating(true);
    setRemixMode(true);

    setTimeout(() => {
      setVariations({
        twitter: `🧵 1/5 La computación cuántica cambiará las reglas del juego en 2026.\n\nLa velocidad de procesamiento ya no será un límite. 🌌\n\n👇 ¿Estás preparado? #Quantum #Tech`,
        linkedin: `🚀 El salto cuántico está más cerca de lo que pensamos.\n\nPara 2026, la computación cuántica redefinirá los límites del procesamiento de datos. Esto no es solo una mejora incremental, es un cambio de paradigma para industrias como:\n\n✅ Farmacéutica\n✅ Ciberseguridad\n✅ Finanzas\n\n¿Tu empresa está lista para esta transición?\n\n#Innovation #FutureTech #QuantumComputing #DigitalTransformation`,
        instagram: `El futuro es cuántico 🌌\n.\n.\nEn 2026, las reglas del juego cambiarán para siempre. La velocidad de procesamiento romperá todas las barreras conocidas.\n.\n¿Estás listo para el salto? Comenta "QUANTUM" y te enviamos nuestro whitepaper exclusivo.\n.\n#Quantum #TechTrends #Innovation #Future`
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenerateImage = () => {
    if (!imagePrompt) return;
    setIsGeneratingImage(true);
    
    // Simulate Image Generation delay
    setTimeout(() => {
      // Random tech/abstract image from Unsplash
      const topics = ['technology', 'abstract', 'quantum', 'cyberpunk', 'ai'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      setGeneratedImage(`https://source.unsplash.com/random/800x600/?${randomTopic}&sig=${Math.random()}`);
      setIsGeneratingImage(false);
    }, 2000);
  };

  const handleHijackTrend = (headline: string) => {
    setViewMode('studio');
    setPostContent(`🚨 BREAKING: ${headline}\n\nEsto cambia todo para nuestro sector. Aquí mi análisis rápido de por qué deberías importarte: 👇\n\n[Espacio para tu opinión experta]\n\n#News #Tech #Analysis`);
    setSelectedPlatform('twitter'); // Twitter is best for newsjacking
    setViralScore(85); // High potential
  };

  const handleMessageSelect = (msgId: string) => {
    setSelectedMessageId(msgId);
    setReplyText('');
    
    // Auto-Responder Logic
    if (autoResponderEnabled) {
      const msg = inboxMessages.find(m => m.id === msgId);
      if (msg && msg.status !== 'replied') {
        setTimeout(() => {
          let response = "";
          switch(selectedPersona) {
            case 'support':
              response = `Hola ${msg.author}, gracias por contactarnos. Hemos recibido tu mensaje y nuestro equipo técnico lo está revisando. Te daremos una solución en breve. 🛠️`;
              break;
            case 'friend':
              response = `¡Hey ${msg.author.split(' ')[0]}! 👋 Gracias por escribirnos. Nos encanta escucharte. ¿En qué más podemos ayudarte hoy?`;
              break;
            case 'witty':
              response = `Vaya, ${msg.author}, eso es interesante 🤔. Déjame consultar con mi bola de cristal digital... ¡Listo! Aquí estamos para lo que necesites. 😉`;
              break;
          }
          setReplyText(response);
        }, 800);
      }
    }
  };

  const handleReply = (messageId: string) => {
    setInboxMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'replied', replyDraft: replyText } : msg
    ));
    setReplyText('');
  };

  const handleAIResponse = (type: 'support' | 'thanks' | 'casual') => {
    // Simulating AI generation
    let text = "";
    switch(type) {
      case 'support': text = "Hola, gracias por contactarnos. Nuestro equipo de soporte revisará tu caso y te responderemos en breve. ¿Tienes algún número de ticket?"; break;
      case 'thanks': text = "¡Muchas gracias por tus palabras! Nos alegra mucho saber que te gusta. 🚀"; break;
      case 'casual': text = "¡Totalmente! 😎 Es justo lo que estábamos pensando. ¡Gracias por compartir!"; break;
    }
    setReplyText(text);
  };

  // --- Calendar Logic ---
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const navigateDate = (amount: number, type: 'week' | 'month') => {
    const newDate = new Date(currentDate);
    if (type === 'week') {
      newDate.setDate(newDate.getDate() + (amount * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + amount);
    }
    setCurrentDate(newDate);
  };

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, postId: string) => {
    setDraggedPostId(postId);
    e.dataTransfer.setData('text/plain', postId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverSlot(slotId);
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, hour: number, weekStart: Date) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/plain');
    setDragOverSlot(null);
    setDraggedPostId(null);

    // Calculate new date
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + dayIndex);
    newDate.setHours(hour, 0, 0, 0);

    // Update post
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          status: 'scheduled',
          scheduledFor: newDate
        };
      }
      return p;
    }));
  };

  // --- Render Functions ---

  const renderInboxView = () => {
    const selectedMessage = inboxMessages.find(m => m.id === selectedMessageId);

    return (
      <div className="flex-1 flex gap-6 overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        
        {/* --- LEFT: MESSAGE LIST --- */}
        <div className="w-[30%] flex flex-col gap-4">
           <ObsidianCard className="flex-1 flex flex-col" noPadding>
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0B0B0D]/50">
                  <span className="text-[10px] tracking-[0.2em] font-bold text-obsidian-text-muted uppercase flex items-center gap-2">
                    <Inbox size={12}/> Inbox Unificado
                  </span>
                  <div className="flex gap-2 text-[9px]">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white cursor-pointer hover:bg-white/20">Todos</span>
                    <span className="px-2 py-0.5 rounded text-obsidian-text-muted cursor-pointer hover:bg-white/10">No leídos</span>
                  </div>
              </div>
              <div className="overflow-y-auto flex-1">
                  {inboxMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      onClick={() => handleMessageSelect(msg.id)}
                      className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/[0.02] ${selectedMessageId === msg.id ? 'bg-white/[0.04] border-l-2 border-l-obsidian-accent' : 'border-l-2 border-l-transparent'}`}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                             <span className={`p-1 rounded-full ${getPlatformColor(msg.platform)}`}>
                               {getPlatformIcon(msg.platform, 10)}
                             </span>
                             <span className={`text-xs font-medium ${msg.status === 'unread' ? 'text-white' : 'text-obsidian-text-muted'}`}>{msg.author}</span>
                          </div>
                          <span className="text-[9px] text-obsidian-text-muted">{msg.time}</span>
                       </div>
                       <p className={`text-[11px] line-clamp-2 mb-2 ${msg.status === 'unread' ? 'text-gray-200' : 'text-obsidian-text-secondary'}`}>{msg.content}</p>
                       <div className="flex gap-2">
                          {msg.status === 'unread' && <span className="w-2 h-2 rounded-full bg-obsidian-accent"></span>}
                          {msg.sentiment === 'negative' && <span className="text-[9px] text-red-400 bg-red-400/10 px-1.5 rounded">Prioridad</span>}
                       </div>
                    </div>
                  ))}
              </div>
           </ObsidianCard>
        </div>

        {/* --- RIGHT: CONVERSATION DETAIL --- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ObsidianCard className="flex-1 flex flex-col relative" noPadding>
             {/* Auto-Pilot Header Config */} 
             <div className="px-6 py-2 bg-obsidian-accent/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Zap size={12} className={autoResponderEnabled ? "text-obsidian-accent" : "text-obsidian-text-muted"} />
                   <span className="text-[10px] uppercase tracking-wider font-bold text-obsidian-text-muted">Auto-Pilot</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] text-obsidian-text-muted">Personalidad:</span>
                      <select 
                        value={selectedPersona}
                        onChange={(e) => setSelectedPersona(e.target.value as any)}
                        className="bg-[#0B0B0D] border border-white/10 rounded text-[9px] text-white px-2 py-0.5 outline-none focus:border-obsidian-accent"
                      >
                        <option value="support">Soporte Técnico</option>
                        <option value="friend">Amigo Casual</option>
                        <option value="witty">Ingenioso</option>
                      </select>
                   </div>
                   <ObsidianSwitch 
                      label="" 
                      checked={autoResponderEnabled} 
                      onChange={setAutoResponderEnabled} 
                   />
                </div>
             </div>

             {selectedMessage ? (
               <>
                 {/* Message Header */} 
                 <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[#0B0B0D]/30">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <User size={20} className="text-white/50" />
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <h3 className="text-sm font-medium text-white">{selectedMessage.author}</h3>
                             <span className="text-xs text-obsidian-text-muted">{selectedMessage.handle}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                             <span className={`p-0.5 rounded ${getPlatformColor(selectedMessage.platform)}`}>
                               {getPlatformIcon(selectedMessage.platform, 10)}
                             </span>
                             <span className="text-[10px] text-obsidian-text-muted capitalize">{selectedMessage.platform} • {selectedMessage.time} ago</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 hover:bg-white/10 rounded text-obsidian-text-muted hover:text-white" title="Marcar como leído"><Check size={16}/></button>
                       <button className="p-2 hover:bg-white/10 rounded text-obsidian-text-muted hover:text-white" title="Archivar"><Inbox size={16}/></button>
                    </div>
                 </div>

                 {/* Message Content */} 
                 <div className="flex-1 p-6 overflow-y-auto">
                    <div className="bg-white/[0.03] rounded-lg p-4 mb-4 border border-white/5">
                       <p className="text-sm text-white leading-relaxed">{selectedMessage.content}</p>
                    </div>
                    
                    {selectedMessage.status === 'replied' && (
                       <div className="flex justify-end mb-4">
                          <div className="bg-obsidian-accent/10 border border-obsidian-accent/20 rounded-lg p-4 max-w-[80%]">
                             <p className="text-sm text-white leading-relaxed">{selectedMessage.replyDraft}</p>
                             <div className="text-[9px] text-obsidian-text-muted mt-2 text-right">Enviado hace un momento</div>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Reply Area */} 
                 {selectedMessage.status !== 'replied' && (
                   <div className={`p-4 border-t border-white/10 bg-[#0B0B0D]/50 transition-colors ${autoResponderEnabled ? 'border-t-obsidian-accent/30' : ''}`}> 
                      {!autoResponderEnabled && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                           <span className="text-[10px] text-obsidian-text-muted uppercase tracking-wider py-1.5">IA Suggestions:</span>
                           <button onClick={() => handleAIResponse('support')} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white hover:bg-white/10 whitespace-nowrap transition-colors flex items-center gap-1"><Sparkles size={10}/> Soporte Técnico</button>
                           <button onClick={() => handleAIResponse('thanks')} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white hover:bg-white/10 whitespace-nowrap transition-colors flex items-center gap-1"><Sparkles size={10}/> Agradecimiento</button>
                           <button onClick={() => handleAIResponse('casual')} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white hover:bg-white/10 whitespace-nowrap transition-colors flex items-center gap-1"><Sparkles size={10}/> Casual & Friendly</button>
                        </div>
                      )}
                      
                      <div className="relative">
                         <textarea 
                            className="w-full bg-[#16161A] border border-white/10 rounded-lg p-3 pr-12 text-sm text-white focus:border-obsidian-accent outline-none resize-none transition-colors h-24"
                            placeholder={autoResponderEnabled ? `Generando respuesta automática modo ${selectedPersona}...` : "Escribe tu respuesta..."}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                         />
                         <button 
                            onClick={() => handleReply(selectedMessage.id)}
                            disabled={!replyText}
                            className="absolute bottom-3 right-3 p-2 bg-obsidian-accent text-white rounded hover:bg-obsidian-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                         >
                            <Send size={16} />
                         </button>
                         {autoResponderEnabled && !replyText && (
                            <div className="absolute top-3 left-3 text-obsidian-accent text-xs flex items-center gap-2">
                               <Sparkles size={12} className="animate-spin" /> Auto-Pilot Escribiendo...
                            </div>
                         )}
                      </div>
                   </div>
                 )}
               </>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-obsidian-text-muted">
                  <MessageCircle size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">Selecciona una conversación para ver los detalles</p>
               </div>
             )}
          </ObsidianCard>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="flex-1 overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <ObsidianCard className="h-full flex flex-col" noPadding>
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0B0B0D]/50">
             <div className="flex items-center gap-4">
                <h3 className="text-sm font-medium text-white uppercase tracking-wider">Gestión de Contenido</h3>
                <div className="flex gap-2">
                   <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-obsidian-text-muted">{posts.length} Posts</span>
                   <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded">{posts.filter(p => p.status === 'scheduled').length} Programados</span>
                </div>
             </div>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-[#16161A] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:border-obsidian-accent outline-none w-48"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#16161A] sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-obsidian-text-muted font-medium border-b border-white/10">Estado</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-obsidian-text-muted font-medium border-b border-white/10">Plataforma</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-obsidian-text-muted font-medium border-b border-white/10 w-1/3">Contenido</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-obsidian-text-muted font-medium border-b border-white/10">Fecha</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-obsidian-text-muted font-medium border-b border-white/10">Impacto</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-obsidian-text-muted font-medium border-b border-white/10 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-white/[0.02] group transition-colors">
                    <td className="p-4">
                      <span className={`text-[9px] px-2 py-1 rounded uppercase font-bold border ${ 
                        post.status === 'published' ? 'text-green-400 border-green-400/20 bg-green-400/10' : 
                        post.status === 'scheduled' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' : 
                        'text-gray-400 border-gray-400/20 bg-gray-400/10'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded ${getPlatformColor(post.platform)} bg-opacity-20`}>
                          {getPlatformIcon(post.platform, 14)}
                        </span>
                        <span className="text-xs text-white capitalize">{post.platform}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-obsidian-text-secondary line-clamp-2">{post.content}</p>
                    </td>
                    <td className="p-4 text-xs text-obsidian-text-muted font-mono">
                      {post.scheduledFor ? post.scheduledFor.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : '-'}
                    </td>
                    <td className="p-4">
                      {post.predictedEngagement ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${post.predictedEngagement > 80 ? 'bg-green-400' : post.predictedEngagement > 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{width: `${post.predictedEngagement}%`}}
                            />
                          </div>
                          <span className="text-xs text-white font-mono">{post.predictedEngagement}%</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-obsidian-text-muted">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-white/10 rounded text-obsidian-text-muted hover:text-white transition-colors" title="Editar">
                          <Edit size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-red-500/10 rounded text-obsidian-text-muted hover:text-red-400 transition-colors" title="Eliminar">
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ObsidianCard>
      </div>
    );
  };

  const renderCalendar = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM

    // Filter drafts for the sidebar
    const drafts = posts.filter(p => p.status === 'draft');

    return (
      <div className="flex-1 flex gap-6 overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        
        {/* --- LEFT: DRAFTS SIDEBAR --- */}
        <div className="w-[25%] flex flex-col gap-4">
           <ObsidianCard className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <span className="text-[10px] tracking-[0.2em] font-bold text-obsidian-text-muted uppercase flex items-center gap-2">
                    <Clock size={12}/> Borradores
                  </span>
                  <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white">{drafts.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {drafts.length === 0 ? (
                    <div className="text-center text-obsidian-text-muted text-[10px] mt-10 opacity-50">
                      No hay borradores pendientes.
                    </div>
                  ) : (
                    drafts.map(post => (
                      <div 
                        key={post.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, post.id)}
                        className={`
                          p-3 rounded border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all cursor-grab active:cursor-grabbing group
                          ${draggedPostId === post.id ? 'opacity-50 border-dashed border-obsidian-accent' : ''}
                        `}
                      >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`p-1 rounded-full ${getPlatformColor(post.platform)}`}>
                              {getPlatformIcon(post.platform, 12)}
                            </span>
                            <GripVertical size={12} className="text-obsidian-text-muted opacity-0 group-hover:opacity-100" />
                        </div>
                        <p className="text-[10px] text-obsidian-text-secondary line-clamp-3 mb-2">{post.content}</p>
                        <div className="flex justify-between items-center text-[9px] text-obsidian-text-muted">
                           <span className="italic">Arrastra al calendario</span>
                        </div>
                      </div>
                    ))
                  )}
              </div>
           </ObsidianCard>
        </div>

        {/* --- RIGHT: CALENDAR GRID --- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ObsidianCard className="flex-1 flex flex-col" noPadding>
            
            {/* Calendar Navigation Toolbar */} 
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0B0B0D]/50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigateDate(-1, 'month')}
                  className="p-1.5 rounded hover:bg-white/10 text-obsidian-text-muted hover:text-white transition-colors"
                  title="Mes Anterior"
                >
                  <ChevronLeft size={14} className="opacity-50" />
                </button>
                <button 
                  onClick={() => navigateDate(-1, 'week')}
                  className="p-1.5 rounded hover:bg-white/10 text-obsidian-text-muted hover:text-white transition-colors"
                  title="Semana Anterior"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>

              <div className="text-center">
                <span className="text-sm font-medium text-white tracking-widest uppercase">
                  {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
                <div className="text-[10px] text-obsidian-text-muted">
                  Semana {Math.ceil(currentDate.getDate() / 7)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigateDate(1, 'week')}
                  className="p-1.5 rounded hover:bg-white/10 text-obsidian-text-muted hover:text-white transition-colors"
                  title="Siguiente Semana"
                >
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => navigateDate(1, 'month')}
                  className="p-1.5 rounded hover:bg-white/10 text-obsidian-text-muted hover:text-white transition-colors"
                  title="Siguiente Mes"
                >
                  <ChevronRight size={14} className="opacity-50" />
                </button>
              </div>
            </div>

            {/* Calendar Header Days */} 
            <div className="flex border-b border-white/10">
              <div className="w-16 border-r border-white/10 p-4 bg-[#0B0B0D]/50"></div>
              {weekDays.map(date => {
                const isToday = new Date().toDateString() === date.toDateString();
                return (
                  <div key={date.toISOString()} className={`flex-1 p-3 text-center border-r border-white/10 last:border-r-0 bg-[#0B0B0D]/50 ${isToday ? 'bg-obsidian-accent/5' : ''}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-obsidian-accent' : 'text-obsidian-text-muted'}`}>
                      {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                    <div className={`text-sm ${isToday ? 'text-white font-bold' : 'text-white/80'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calendar Grid */} 
            <div className="flex-1 overflow-y-auto relative">
              {hours.map(hour => (
                <div key={hour} className="flex h-24 border-b border-white/5">
                  {/* Time Column */} 
                  <div className="w-16 border-r border-white/10 p-2 text-right bg-[#0B0B0D]/30 select-none">
                    <span className="text-[10px] text-obsidian-text-muted font-mono">{hour}:00</span>
                  </div>
                  
                  {/* Days Columns */} 
                  {weekDays.map((date, dayIndex) => {
                    const isToday = new Date().toDateString() === date.toDateString();
                    const slotId = `${dayIndex}-${hour}`;
                    const isHovered = dragOverSlot === slotId;
                    
                    return (
                      <div 
                        key={slotId} 
                        className={`
                          flex-1 border-r border-white/5 last:border-r-0 p-1 relative transition-colors 
                          ${isToday ? 'bg-obsidian-accent/[0.02]' : ''}
                          ${isHovered ? 'bg-obsidian-accent/10 border border-obsidian-accent/30' : 'hover:bg-white/[0.01]'}
                        `}
                        onDragOver={(e) => handleDragOver(e, slotId)}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => handleDrop(e, dayIndex, hour, startOfWeek)}
                      >
                        
                        {/* Check for posts in this slot */} 
                        {posts.map((post) => {
                          if (post.status !== 'scheduled' || !post.scheduledFor) return null;
                          
                          const postDate = new Date(post.scheduledFor);
                          const isSameDay = postDate.toDateString() === date.toDateString();
                          const isSameHour = postDate.getHours() === hour;

                          if (isSameDay && isSameHour) {
                            return (
                              <div 
                                key={post.id} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, post.id)}
                                className={`
                                  p-2 rounded border text-[9px] mb-1 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform 
                                  ${getPlatformColor(post.platform)}
                                  ${draggedPostId === post.id ? 'opacity-50' : 'opacity-100'}
                                `}
                              >
                                <div className="flex items-center justify-between mb-1 font-bold">
                                  <div className="flex items-center gap-1">
                                    {getPlatformIcon(post.platform, 10)}
                                    {post.platform}
                                  </div>
                                  <GripVertical size={8} className="opacity-50" />
                                </div>
                                <div className="line-clamp-2 opacity-80 leading-tight">{post.content}</div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>
      </div>
    );
  };

  const renderStudio = () => (
    <div className="flex-1 flex gap-6 overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      {/* --- LEFT: TRENDS & QUEUE --- */}
      <div className="w-[25%] flex flex-col gap-4">
        {/* Trends / News Radar */} 
        <ObsidianCard className="flex-[0.4] flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
             <div className="flex gap-2">
               <button 
                 onClick={() => setNewsjackingMode(false)}
                 className={`text-[10px] tracking-[0.2em] font-bold uppercase flex items-center gap-2 transition-colors ${!newsjackingMode ? 'text-green-400' : 'text-obsidian-text-muted hover:text-white'}`}
               >
                 <TrendingUp size={12}/> Tendencias
               </button>
               <span className="text-white/20">|</span>
               <button 
                 onClick={() => setNewsjackingMode(true)}
                 className={`text-[10px] tracking-[0.2em] font-bold uppercase flex items-center gap-2 transition-colors ${newsjackingMode ? 'text-red-500 animate-pulse' : 'text-obsidian-text-muted hover:text-white'}`}
               >
                 <AlertCircle size={12}/> Radar
               </button>
             </div>
             <RefreshCw size={10} className="text-obsidian-text-muted cursor-pointer hover:text-white"/>
          </div>
          
          <div className="space-y-3 overflow-y-auto pr-1">
             {!newsjackingMode ? (
               // Standard Trends
               TRENDS.map(trend => (
                 <div key={trend.id} className="flex justify-between items-center p-2 rounded bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer group transition-colors">
                    <div>
                       <div className="text-xs text-white font-medium group-hover:text-obsidian-accent">{trend.tag}</div>
                       <div className="text-[9px] text-obsidian-text-muted">{trend.category}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-white font-mono">{trend.volume}</div>
                       <div className={`text-[8px] ${trend.sentiment === 'positive' ? 'text-green-400' : 'text-yellow-400'}`}>{trend.sentiment}</div>
                    </div>
                 </div>
               ))
             ) : (
               // Newsjacking Radar
               NEWS_ALERTS.map(news => (
                 <div key={news.id} className="p-3 rounded bg-red-500/[0.05] border border-red-500/20 hover:border-red-500/40 transition-all group">
                    <div className="flex justify-between items-start mb-1">
                       <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                         <Zap size={8} className="fill-current"/> {news.velocity} Velocity
                       </span>
                       <span className="text-[9px] text-obsidian-text-muted">{news.time}</span>
                    </div>
                    <h4 className="text-xs text-white font-medium mb-2 leading-tight">{news.headline}</h4>
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] text-obsidian-text-muted">{news.source} • {news.relevance}% Relevancia</span>
                       <button 
                         onClick={() => handleHijackTrend(news.headline)}
                         className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white text-[9px] px-2 py-1 rounded uppercase font-bold tracking-wider hover:bg-red-600"
                       >
                         Hijack
                       </button>
                    </div>
                 </div>
               ))
             )}
          </div>
        </ObsidianCard>

        {/* Queue - DRAGGABLE SOURCE */} 
        <ObsidianCard className="flex-[0.6] flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <span className="text-[10px] tracking-[0.2em] font-bold text-obsidian-text-muted uppercase flex items-center gap-2">
                <Clock size={12}/> Cola de Publicación
              </span>
          </div>
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, post.id)}
                  className={`
                    p-3 rounded border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all cursor-grab active:cursor-grabbing
                    ${draggedPostId === post.id ? 'opacity-50 border-dashed border-obsidian-accent' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                      <span className={`p-1 rounded-full ${getPlatformColor(post.platform)}`}>
                        {getPlatformIcon(post.platform, 12)}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase border ${post.status === 'scheduled' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' : 'text-gray-400 border-gray-400/20'}`}>
                        {post.status}
                      </span>
                  </div>
                  <p className="text-[10px] text-obsidian-text-secondary line-clamp-2 mb-2">{post.content}</p>
                  <div className="flex justify-between items-center text-[9px] text-obsidian-text-muted">
                      <span>{post.scheduledFor ? post.scheduledFor.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sin fecha'}</span>
                      {post.predictedEngagement && (
                        <span className="flex items-center gap-1 text-obsidian-accent">
                          <Zap size={8} /> {post.predictedEngagement}% Viral
                        </span>
                      )}
                  </div>
                </div>
              ))}
          </div>
        </ObsidianCard>
      </div>

      {/* --- CENTER: CONTENT EDITOR (THE FORGE) --- */}
      <div className="w-[50%] flex flex-col">
          <ObsidianCard className="h-full flex flex-col relative" noPadding>
            
            {/* Header / Tabs */} 
            <div className="flex border-b border-white/10 justify-between items-center pr-4">
                <div className="flex">
                  {(['twitter', 'linkedin', 'instagram'] as Platform[]).map(p => (
                    <button
                      key={p}
                      onClick={() => { setSelectedPlatform(p); setRemixMode(false); setShowImageGenerator(false); }}
                      className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all ${selectedPlatform === p && !remixMode && !showImageGenerator ? 'bg-white/[0.03] text-white border-b-2 border-obsidian-accent' : 'text-obsidian-text-muted hover:text-white'}`}
                    >
                        {getPlatformIcon(p)}
                        {p}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setRemixMode(!remixMode); setShowImageGenerator(false); }}
                    className={`text-[10px] uppercase tracking-wider flex items-center gap-2 px-3 py-1 rounded transition-all ${remixMode ? 'bg-obsidian-accent/20 text-obsidian-accent border border-obsidian-accent/50' : 'text-obsidian-text-muted hover:text-white border border-transparent'}`}
                  >
                    <RefreshCw size={12} className={remixMode ? "animate-spin-slow" : ""} />
                    Remix
                  </button>
                </div>
            </div>

            {/* Editor Area */} 
            <div className="flex-1 p-0 relative overflow-hidden">
                {/* Image Generator Overlay */} 
                {showImageGenerator && (
                  <div className="absolute inset-0 bg-[#0B0B0D] z-20 p-6 flex flex-col animate-[fadeIn_0.2s_ease-out]">
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <ImageIcon size={16} className="text-obsidian-accent" /> Generador de Assets Visuales
                    </h3>
                    
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Describe la imagen que quieres generar (ej. 'Ciudad futurista cyberpunk con neones azules')..."
                        className="flex-1 bg-[#16161A] border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:border-obsidian-accent outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
                      />
                      <ObsidianButton 
                        size="sm" 
                        onClick={handleGenerateImage} 
                        disabled={!imagePrompt || isGeneratingImage}
                        isLoading={isGeneratingImage}
                      >
                        Generar
                      </ObsidianButton>
                    </div>

                    <div className="flex-1 bg-[#16161A] rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden group">
                      {generatedImage ? (
                        <>
                          <img src={generatedImage} alt="Generated" className="max-h-full max-w-full object-contain shadow-2xl" />
                          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => setGeneratedImage(null)} className="px-3 py-1.5 bg-black/50 backdrop-blur rounded text-xs text-white hover:bg-black/70">Descartar</button>
                             <ObsidianButton size="sm" onClick={() => setShowImageGenerator(false)}>Adjuntar al Post</ObsidianButton>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-obsidian-text-muted">
                          {isGeneratingImage ? (
                            <div className="flex flex-col items-center">
                              <Sparkles className="animate-spin mb-2 text-obsidian-accent" />
                              <span className="text-xs">Creando arte...</span>
                            </div>
                          ) : (
                            <>
                              <ImageIcon size={32} className="mx-auto mb-2 opacity-20" />
                              <span className="text-xs">La imagen aparecerá aquí</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Main Content Area (conditionally rendered or hidden behind overlays) */} 
                {remixMode ? (
                  <div className="h-full overflow-y-auto p-6 grid gap-6">
                     <div className="col-span-1">
                        <div className="text-[10px] text-obsidian-text-muted mb-4 uppercase tracking-widest">Variaciones Generadas por IA</div>
                        
                        {(['twitter', 'linkedin', 'instagram'] as Platform[]).map(p => (
                          <div key={p} className="mb-6 group">
                             <div className="flex items-center gap-2 mb-2">
                                <span className={`p-1 rounded ${getPlatformColor(p)}`}>{getPlatformIcon(p, 12)}</span>
                                <span className="text-xs font-medium text-white capitalize">{p} Remix</span>
                             </div>
                             <div className="relative">
                                <textarea 
                                  className="w-full bg-[#0B0B0D]/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-obsidian-accent outline-none resize-none transition-colors h-32"
                                  value={variations[p]}
                                  onChange={(e) => setVariations({...variations, [p]: e.target.value})}
                                  placeholder="Generando..."
                                />
                                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => { setPostContent(variations[p]); setSelectedPlatform(p); setRemixMode(false); }}
                                     className="p-1.5 bg-obsidian-accent text-white rounded hover:bg-obsidian-accent/80 text-[10px]"
                                     title="Usar esta versión"
                                   >
                                     Usar
                                   </button>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <div className="h-full p-6 flex flex-col">
                    <textarea 
                      className="flex-1 w-full bg-transparent text-white text-sm resize-none focus:outline-none placeholder-white/20 font-light leading-relaxed mb-4"
                      placeholder={`¿Qué quieres comunicar hoy en ${selectedPlatform}? Escribe o usa la IA...`}
                      value={postContent}
                      onChange={(e) => {
                          setPostContent(e.target.value);
                          setViralScore(Math.min(100, Math.floor(e.target.value.length / 2))); // Mock score logic
                      }}
                    />
                    
                    {/* Attached Media Preview */} 
                    {generatedImage && !showImageGenerator && (
                      <div className="relative w-full h-48 bg-[#16161A] rounded-lg overflow-hidden group">
                        <img src={generatedImage} alt="Post attachment" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={() => setShowImageGenerator(true)} className="px-3 py-1.5 bg-white/10 rounded hover:bg-white/20 text-xs text-white backdrop-blur border border-white/10">Editar / Cambiar</button>
                           <button onClick={() => setGeneratedImage(null)} className="ml-2 p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 border border-red-500/30"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* AI Overlay when generating Text */} 
                {isGenerating && (
                  <div className="absolute inset-0 bg-[#0F0F12]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <Sparkles className="text-obsidian-accent animate-spin mb-4" size={32} />
                      <span className="text-xs text-white tracking-widest animate-pulse">
                        {remixMode ? 'REMIXING PARA TODAS LAS PLATAFORMAS...' : 'GENERANDO COPY OPTIMIZADO...'}
                      </span>
                  </div>
                )}
            </div>

            {/* Action Bar */} 
            <div className="p-4 border-t border-white/10 bg-[#0B0B0D]/50 flex justify-between items-center">
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setShowImageGenerator(!showImageGenerator); setRemixMode(false); }}
                    className={`p-2 rounded transition-colors ${showImageGenerator || generatedImage ? 'text-obsidian-accent bg-obsidian-accent/10' : 'text-obsidian-text-muted hover:text-white hover:bg-white/10'}`}
                    title="Generar Imagen con IA"
                  >
                    <ImageIcon size={16}/>
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded text-obsidian-text-muted hover:text-white transition-colors"><Hash size={16}/></button>
                  <button className="p-2 hover:bg-white/10 rounded text-obsidian-text-muted hover:text-white transition-colors"><Globe size={16}/></button>
                </div>
                
                <div className="flex gap-3">
                  <ObsidianButton 
                      variant="secondary" 
                      className="text-xs border-obsidian-accent/30 text-obsidian-accent hover:bg-obsidian-accent/10"
                      onClick={remixMode ? handleSmartRemix : handleGenerateAI}
                      disabled={isGenerating}
                  >
                      {remixMode ? <RefreshCw size={14} className="mr-2"/> : <Sparkles size={14} className="mr-2"/>}
                      {remixMode ? 'Regenerar Remix' : 'IA Magic'}
                  </ObsidianButton>
                  
                  {!remixMode && !showImageGenerator && (
                    <ObsidianButton 
                      variant="secondary"
                      className="text-xs border-white/10 text-white hover:bg-white/5"
                      onClick={handleSmartRemix}
                      disabled={!postContent}
                    >
                      <RefreshCw size={14} className="mr-2"/> Smart Remix
                    </ObsidianButton>
                  )}

                  <ObsidianButton className="text-xs px-6">
                      <Send size={14} className="mr-2"/> {remixMode ? 'Publicar Todo' : 'Publicar'}
                  </ObsidianButton>
                </div>
            </div>
          </ObsidianCard>
      </div>

      {/* --- RIGHT: PREDICTOR & ANALYTICS --- */}
      <div className="w-[25%] flex flex-col gap-4">
          
          {/* Viral Predictor */} 
          <ObsidianCard className="flex flex-col items-center justify-center py-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30"></div>
            <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-4">PREDICCIÓN DE IMPACTO</span>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#1A1A1D" strokeWidth="8" fill="none" />
                  <circle 
                      cx="64" cy="64" r="56" 
                      stroke={viralScore > 80 ? '#45FF9A' : viralScore > 50 ? '#FACC15' : '#FF6B6B'} 
                      strokeWidth="8" fill="none" 
                      strokeDasharray={351} 
                      strokeDashoffset={351 - (351 * viralScore) / 100}
                      className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-thin text-white">{viralScore}</span>
                  <span className="text-[9px] text-obsidian-text-muted">SCORE</span>
                </div>
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-xs text-white">
                  {viralScore > 80 ? 'Potencial Viral Alto 🔥' : viralScore > 50 ? 'Rendimiento Promedio 👍' : 'Requiere Mejoras ⚠️'}
                </p>
            </div>
          </ObsidianCard>

          {/* Quick Stats */} 
          <ObsidianCard className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                <BarChart3 size={14} className="text-obsidian-text-muted"/>
                <span className="text-[10px] tracking-widest font-bold text-obsidian-text-muted uppercase">RENDIMIENTO SEMANAL</span>
            </div>
            
            <div className="space-y-4">
                {[ 
                  { label: 'Impresiones', val: '1.2M', change: '+12%', up: true },
                  { label: 'Engagement', val: '4.8%', change: '+0.5%', up: true },
                  { label: 'Clicks', val: '8.5K', change: '-2%', up: false },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center">
                      <span className="text-xs text-obsidian-text-muted">{stat.label}</span>
                      <div className="text-right">
                        <div className="text-sm text-white font-mono">{stat.val}</div>
                        <div className={`text-[9px] flex items-center justify-end ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                            {stat.up ? <TrendingUp size={8} className="mr-1"/> : <TrendingUp size={8} className="mr-1 transform rotate-180"/>}
                            {stat.change}
                        </div>
                      </div>
                  </div>
                ))}
            </div>

            <div className="mt-auto pt-4">
                <div className="p-3 rounded bg-obsidian-accent/5 border border-obsidian-accent/20">
                  <div className="flex items-start gap-2">
                      <Sparkles size={12} className="text-obsidian-accent mt-0.5" />
                      <div>
                        <p className="text-[10px] text-white font-medium mb-1">Insight de IA</p>
                        <p className="text-[9px] text-obsidian-text-secondary leading-relaxed">
                            Tus publicaciones sobre #Tech tienen un 40% más de engagement los martes a las 10:00 AM.
                        </p>
                      </div>
                  </div>
                </div>
            </div>
          </ObsidianCard>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col gap-6 overflow-y-auto">
      
      {/* Header */} 
      <div className="flex justify-between items-center h-16 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          {(viewMode === 'calendar' || viewMode === 'list' || viewMode === 'inbox') && (
            <button 
              onClick={() => setViewMode('studio')}
              className="p-2 rounded hover:bg-white/10 text-obsidian-text-muted hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-light text-white tracking-widest flex items-center gap-2">
              <MessageSquareText className="text-obsidian-accent" size={20} />
              SOCIAL STUDIO <span className="text-obsidian-text-muted text-sm font-normal">CONTENT ENGINE</span>
            </h1>
            <p className="text-xs text-obsidian-text-muted mt-1">Gestión de contenido multicanal impulsada por IA</p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-[#16161A] border border-white/10 rounded p-1 mr-2">
              <button 
                onClick={() => setViewMode('studio')}
                className={`p-1.5 rounded transition-all ${viewMode === 'studio' ? 'bg-white/10 text-white shadow-sm' : 'text-obsidian-text-muted hover:text-white'}`}
                title="Vista Estudio"
              >
                <Layout size={14} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded transition-all ${viewMode === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-obsidian-text-muted hover:text-white'}`}
                title="Vista Calendario"
              >
                <CalendarIcon size={14} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-obsidian-text-muted hover:text-white'}`}
                title="Vista Lista"
              >
                <List size={14} />
              </button>
              <button 
                onClick={() => setViewMode('inbox')}
                className={`p-1.5 rounded transition-all ${viewMode === 'inbox' ? 'bg-white/10 text-white shadow-sm' : 'text-obsidian-text-muted hover:text-white'}`}
                title="Inbox Unificado"
              >
                <Inbox size={14} />
              </button>
           </div>
           
           <ObsidianButton variant="primary" className="text-xs px-6">
             <Plus size={14} className="mr-2"/> NUEVA CAMPAÑA
           </ObsidianButton>
        </div>
      </div>

      {viewMode === 'calendar' ? renderCalendar() : viewMode === 'list' ? renderListView() : viewMode === 'inbox' ? renderInboxView() : renderStudio()}
    </div>
  );
};
