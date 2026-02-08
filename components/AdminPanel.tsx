
import React, { useState, useEffect } from 'react';
import { PortfolioData, ThemeType, Project, Skill, WorkExperience, AuthState, UserRole, User, UserStatus, Language, SystemHealth } from '../types';
import { dataService } from '../services/dataService';
import { improveDescription } from '../services/geminiService';
import { THEME_CONFIGS, UI_STRINGS } from '../constants';
import { 
  LayoutGrid, Users as UsersIcon, Palette, LogOut, Plus, Trash2, Edit3, 
  Sparkles, Save, CheckCircle, X, ExternalLink, Shield, Loader2, Code, 
  Eye, UserPlus, Wifi, WifiOff, Mail, Github, Linkedin, Briefcase,
  Activity, Zap, Server, Brain, Database, Image as ImageIcon, Globe, Type, AlertTriangle, FileText, Calendar, MapPin, Sun, Moon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface Props {
  data: PortfolioData;
  auth: AuthState;
  onUpdate: (data: PortfolioData) => void;
  onLogout: () => void;
  lang: Language;
  onLangChange: (l: Language) => void;
}

const AdminPanel: React.FC<Props> = ({ data, auth, onUpdate, onLogout, lang, onLangChange }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'projects' | 'experience' | 'skills' | 'users' | 'themes'>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const [sysHealth, setSysHealth] = useState<SystemHealth>({ api: 'offline', database: 'offline', gemini: 'configured', latency: 0 });
  const [users, setUsers] = useState<User[]>([]);
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Partial<WorkExperience> | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const t = UI_STRINGS[lang];
  const isReadOnly = auth.role === UserRole.VIEWER;

  useEffect(() => {
    const init = async () => {
      checkHealth();
      if (auth.role === UserRole.ADMIN) loadUsers();
      const interval = setInterval(checkHealth, 30000);
      return () => clearInterval(interval);
    };
    init();
  }, [auth.role]);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/system/health');
      const health = await res.json();
      setSysHealth(health);
    } catch {
      setSysHealth(prev => ({ ...prev, api: 'offline', database: 'offline' }));
    }
  };

  const loadUsers = async () => {
    try { const u = await dataService.getUsers(); setUsers(u); } catch (e) { console.error(e); }
  };

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const refreshData = async () => {
    const fresh = await dataService.getData();
    onUpdate(fresh);
  };

  const handleMagicImprove = async (field: 'bio' | 'description' | 'longDescription', langKey: Language, target?: 'experience' | 'project') => {
    if (isReadOnly) return;
    setIsProcessing(true);
    try {
      let currentText = '';
      if (field === 'bio') currentText = data?.bio?.[langKey] || '';
      else if (target === 'project' && editingProject) currentText = (editingProject as any)[field]?.[langKey] || '';
      else if (target === 'experience' && editingExperience) currentText = (editingExperience as any)[field]?.[langKey] || '';

      const improved = await improveDescription(currentText);
      
      if (field === 'bio') {
        const newData: PortfolioData = { 
          ...data, 
          bio: { 
            en: langKey === Language.EN ? improved : (data.bio?.en || ''),
            es: langKey === Language.ES ? improved : (data.bio?.es || '')
          } 
        };
        await dataService.updateProfile(newData);
        onUpdate(newData);
      } else if (target === 'project' && editingProject) {
        setEditingProject({
          ...editingProject,
          [field]: { 
            ...((editingProject as any)[field] || { en: '', es: '' }), 
            [langKey]: improved 
          }
        });
      } else if (target === 'experience' && editingExperience) {
        setEditingExperience({
          ...editingExperience,
          [field]: { 
            ...((editingExperience as any)[field] || { en: '', es: '' }), 
            [langKey]: improved 
          }
        });
      }
      showToast('¡Texto mejorado con Gemini AI!');
    } catch (e) {
      showToast('Error al procesar con IA');
    } finally {
      setIsProcessing(false);
    }
  };

  const skillData = [
    { name: 'Frontend', value: data?.skills?.filter(s => s.category === 'Frontend').length || 0 },
    { name: 'Backend', value: data?.skills?.filter(s => s.category === 'Backend').length || 0 },
    { name: 'Design', value: data?.skills?.filter(s => s.category === 'Design').length || 0 },
    { name: 'Others', value: data?.skills?.filter(s => s.category === 'Others').length || 0 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 fixed h-full z-20">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl italic text-white shadow-lg">P</div>
          <span className="text-xl font-bold tracking-tight">Admin CMS</span>
        </div>
        <nav className="flex-1 space-y-1">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutGrid size={20}/>} label="Dashboard" />
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UsersIcon size={20}/>} label="Perfil" />
          <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<Briefcase size={20}/>} label="Proyectos" />
          <TabButton active={activeTab === 'experience'} onClick={() => setActiveTab('experience')} icon={<Calendar size={20}/>} label="Experiencia" />
          <TabButton active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} icon={<Code size={20}/>} label="Habilidades" />
          <TabButton active={activeTab === 'themes'} onClick={() => setActiveTab('themes')} icon={<Palette size={20}/>} label="Temas" />
          {auth.role === UserRole.ADMIN && <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Shield size={20}/>} label="Usuarios" />}
        </nav>
        <div className="mt-auto space-y-2 border-t border-white/10 pt-6">
          <button onClick={() => window.location.hash = ''} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"><Eye size={18}/> Ver Sitio</button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold uppercase tracking-widest"><LogOut size={18}/> Salir</button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-black capitalize tracking-tight">{activeTab}</h2>
              <p className="text-slate-400 font-medium">Control total de tu ecosistema profesional.</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border shadow-sm">
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Latencia: {sysHealth.latency}ms</span>
               </div>
               <div className={`flex items-center gap-3 px-6 py-2 rounded-full border-2 ${sysHealth.database === 'online' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                {sysHealth.database === 'online' ? <Wifi size={18}/> : <WifiOff size={18}/>}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{sysHealth.database === 'online' ? 'DB Sync' : 'DB Link Lost'}</span>
              </div>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="grid grid-cols-4 gap-6">
                <StatCard label="Proyectos" val={data?.projects?.length || 0} color="indigo" icon={<Briefcase size={20}/>} />
                <StatCard label="Experiencia" val={data?.workExperience?.length || 0} color="rose" icon={<Calendar size={20}/>} />
                <StatCard label="Habilidades" val={data?.skills?.length || 0} color="emerald" icon={<Code size={20}/>} />
                <StatCard label="Usuarios" val={users.length || 1} color="amber" icon={<UsersIcon size={20}/>} />
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Activity size={16}/> Estado del Sistema</h4>
                  <div className="space-y-4">
                    <ConnectionItem label="Core API" status={sysHealth.api === 'online'} icon={<Server size={18}/>} />
                    <ConnectionItem label="PostgreSQL 15" status={sysHealth.database === 'online'} icon={<Database size={18}/>} />
                    <ConnectionItem label="Gemini AI" status={sysHealth.gemini === 'configured'} icon={<Brain size={18}/>} />
                  </div>
                </div>
                <div className="col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Distribución de Expertise</h4>
                  <div className="flex-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, textTransform: 'uppercase'}} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {skillData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-500">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsProcessing(true);
                const fd = new FormData(e.currentTarget);
                const profileUpdate = {
                  name: fd.get('name') as string,
                  email: fd.get('email') as string,
                  avatar: fd.get('avatar') as string,
                  cvUrl: fd.get('cvUrl') as string,
                  github: fd.get('github') as string,
                  linkedin: fd.get('linkedin') as string,
                  role: { es: fd.get('role_es') as string, en: fd.get('role_en') as string },
                  bio: { es: fd.get('bio_es') as string, en: fd.get('bio_en') as string }
                };
                try {
                  await dataService.updateProfile(profileUpdate);
                  refreshData();
                  showToast('Perfil actualizado correctamente');
                } catch (err) {
                  showToast('Error al actualizar perfil');
                } finally {
                  setIsProcessing(false);
                }
              }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                    <div className="relative inline-block mb-6">
                      <img src={data?.avatar} className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-50 shadow-xl" alt="Avatar" />
                      <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform"><ImageIcon size={16}/></div>
                    </div>
                    <Input label="URL Avatar" name="avatar" val={data?.avatar || ''} />
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Recursos y Social</h4>
                    <Input label={t.cv_url} name="cvUrl" val={data?.cvUrl || ''} icon={<FileText size={16}/>} />
                    <Input label="Email" name="email" val={data?.email || ''} icon={<Mail size={16}/>} />
                    <Input label="GitHub" name="github" val={data?.github || ''} icon={<Github size={16}/>} />
                    <Input label="LinkedIn" name="linkedin" val={data?.linkedin || ''} icon={<Linkedin size={16}/>} />
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Información Profesional</h4>
                       {!isReadOnly && <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"><Save size={16}/> Guardar Cambios</button>}
                    </div>
                    <Input label="Nombre Completo" name="name" val={data?.name || ''} />
                    <div className="grid grid-cols-2 gap-4">
                       <Input label="Cargo (ES)" name="role_es" val={data?.role?.es || ''} />
                       <Input label="Cargo (EN)" name="role_en" val={data?.role?.en || ''} />
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black uppercase text-slate-400">Biografía (ES)</label>
                         {!isReadOnly && <button type="button" onClick={() => handleMagicImprove('bio', Language.ES)} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:underline"><Sparkles size={12}/> Mejorar con IA</button>}
                       </div>
                       <textarea name="bio_es" defaultValue={data?.bio?.es || ''} className="w-full h-32 p-5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 ring-indigo-500/5 font-medium resize-none" />
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black uppercase text-slate-400">Biografía (EN)</label>
                         {!isReadOnly && <button type="button" onClick={() => handleMagicImprove('bio', Language.EN)} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:underline"><Sparkles size={12}/> Improve with AI</button>}
                       </div>
                       <textarea name="bio_en" defaultValue={data?.bio?.en || ''} className="w-full h-32 p-5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 ring-indigo-500/5 font-medium resize-none" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Cronología Laboral</h4>
                  {!isReadOnly && <button onClick={() => { setEditingExperience(null); setShowExperienceModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"><Plus size={20}/> Añadir Experiencia</button>}
               </div>
               <div className="space-y-4">
                 {data?.workExperience?.length ? data.workExperience.map(exp => (
                   <div key={exp.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex justify-between items-center group hover:border-indigo-100 transition-all">
                      <div className="flex gap-6 items-center">
                         <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600"><Briefcase size={28}/></div>
                         <div>
                            <h5 className="font-black text-xl">{exp.role[lang]}</h5>
                            <div className="flex gap-4 mt-1">
                               <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Globe size={12}/> {exp.company}</span>
                               <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><MapPin size={12}/> {exp.location}</span>
                               <span className="text-xs font-bold text-indigo-500 flex items-center gap-1"><Calendar size={12}/> {exp.dates}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => { setEditingExperience(exp); setShowExperienceModal(true); }} className="p-4 bg-slate-100 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><Edit3 size={18}/></button>
                         {!isReadOnly && <button onClick={async () => { if(confirm('¿Eliminar experiencia?')) { await dataService.deleteExperience(exp.id); refreshData(); showToast('Experiencia eliminada'); } }} className="p-4 bg-slate-100 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>}
                      </div>
                   </div>
                 )) : (
                   <div className="p-12 text-center border-2 border-dashed rounded-[3rem] opacity-30 font-black uppercase tracking-widest">Sin registros de trabajo aún.</div>
                 )}
               </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Gestionar Trabajos</h4>
                  {!isReadOnly && <button onClick={() => { setEditingProject(null); setShowProjectModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"><Plus size={20}/> Añadir Proyecto</button>}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {data?.projects?.map(p => (
                   <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex gap-6 items-center group">
                     <img src={p.image} className="w-24 h-24 rounded-3xl object-cover shadow-lg" alt={p.title.es} />
                     <div className="flex-1">
                       <h5 className="font-black text-lg">{p.title[lang]}</h5>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{p.tags?.join(' • ')}</p>
                       <div className="flex gap-2 mt-4">
                          <button onClick={() => { setEditingProject(p); setShowProjectModal(true); }} className="p-3 bg-slate-100 rounded-xl hover:bg-indigo-100 hover:text-indigo-600 transition-all"><Edit3 size={16}/></button>
                          {!isReadOnly && <button onClick={async () => { if(confirm('¿Eliminar proyecto?')) { await dataService.deleteProject(p.id); refreshData(); showToast('Proyecto eliminado'); } }} className="p-3 bg-slate-100 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all"><Trash2 size={16}/></button>}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Expertise Técnico</h4>
                  {!isReadOnly && <button onClick={() => setShowSkillModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"><Plus size={20}/> Nueva Habilidad</button>}
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {data?.skills?.map(s => (
                   <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm group">
                     <div className="flex justify-between items-center mb-6">
                        <div className="p-4 bg-slate-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Code size={24}/></div>
                        {!isReadOnly && <button onClick={async () => { await dataService.deleteSkill(s.id); refreshData(); showToast('Habilidad eliminada'); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>}
                     </div>
                     <h5 className="font-black text-xl mb-1">{s.name}</h5>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">{s.category}</p>
                     <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black"><span>DOMINIO</span> <span>{s.level}%</span></div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 transition-all duration-1000" style={{width: `${s.level}%`}}></div>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="animate-in fade-in duration-500 space-y-12 pb-20">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Personalización Visual</h4>
               
               {/* Sección Light */}
               <section className="space-y-6">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <Sun size={20} />
                    <h5 className="text-sm font-black uppercase tracking-widest">Temas Claros (Light)</h5>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {Object.entries(THEME_CONFIGS).filter(([_, config]) => !config.isDark).map(([key, config]) => (
                      <ThemeCard key={key} themeKey={key} config={config} active={data?.theme === key} isReadOnly={isReadOnly} onSelect={async () => {
                        await dataService.updateTheme(key as ThemeType);
                        refreshData();
                        showToast(`Tema ${key} aplicado`);
                      }} />
                    ))}
                  </div>
               </section>

               {/* Sección Dark */}
               <section className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Moon size={20} />
                    <h5 className="text-sm font-black uppercase tracking-widest">Temas Oscuros (Dark)</h5>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {Object.entries(THEME_CONFIGS).filter(([_, config]) => config.isDark).map(([key, config]) => (
                      <ThemeCard key={key} themeKey={key} config={config} active={data?.theme === key} isReadOnly={isReadOnly} onSelect={async () => {
                        await dataService.updateTheme(key as ThemeType);
                        refreshData();
                        showToast(`Tema ${key} aplicado`);
                      }} />
                    ))}
                  </div>
               </section>
            </div>
          )}

          {activeTab === 'users' && auth.role === UserRole.ADMIN && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Gestión de Cuentas y Privilegios</h4>
                  <button onClick={() => { setEditingUser(null); setShowUserModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform"><UserPlus size={20}/> Crear Usuario</button>
               </div>
               <div className="bg-white rounded-[2.5rem] overflow-hidden border shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Usuario</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Rol</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{u.username}</span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${u.status === UserStatus.ACTIVE ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : u.status === UserStatus.INACTIVE ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${u.status === UserStatus.ACTIVE ? 'bg-emerald-500' : u.status === UserStatus.INACTIVE ? 'bg-slate-400' : 'bg-red-500'}`}></div>
                             <span className="text-[9px] font-black uppercase">{u.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit3 size={18}/></button>
                            {u.username !== auth.user && <button onClick={async () => { if(confirm('¿Eliminar usuario definitivamente?')) { await dataService.deleteUser(u.id); loadUsers(); showToast('Usuario eliminado'); } }} className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={18}/></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {showExperienceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">{editingExperience ? 'Editar Experiencia' : 'Nueva Experiencia'}</h3>
                <button onClick={() => setShowExperienceModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsProcessing(true);
                const fd = new FormData(e.currentTarget);
                const expObj = {
                  role: { es: fd.get('r_es') as string, en: fd.get('r_en') as string },
                  company: fd.get('company') as string,
                  location: fd.get('location') as string,
                  dates: fd.get('dates') as string,
                  description: { es: fd.get('d_es') as string, en: fd.get('d_en') as string }
                };
                try {
                  if (editingExperience) await dataService.updateExperience(editingExperience.id!, expObj);
                  else await dataService.addExperience(expObj as any);
                  refreshData();
                  setShowExperienceModal(false);
                  showToast(editingExperience ? 'Experiencia actualizada' : 'Experiencia registrada');
                } catch (err) {
                  showToast('Error al guardar experiencia');
                } finally {
                  setIsProcessing(false);
                }
              }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Cargo (ES)" name="r_es" val={editingExperience?.role?.es || ''} required />
                  <Input label="Cargo (EN)" name="r_en" val={editingExperience?.role?.en || ''} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Empresa" name="company" val={editingExperience?.company || ''} required />
                  <Input label="Ubicación" name="location" val={editingExperience?.location || ''} />
                  <Input label="Fechas" name="dates" val={editingExperience?.dates || ''} placeholder="2022 - Presente" />
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black uppercase text-slate-400">Responsabilidades (ES)</label>
                     <button type="button" onClick={() => handleMagicImprove('description', Language.ES, 'experience')} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1"><Sparkles size={12}/> Mejorar con IA</button>
                   </div>
                   <textarea name="d_es" defaultValue={editingExperience?.description?.es || ''} className="w-full h-24 p-5 bg-slate-50 border rounded-2xl outline-none" />
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black uppercase text-slate-400">Responsibilities (EN)</label>
                     <button type="button" onClick={() => handleMagicImprove('description', Language.EN, 'experience')} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1"><Sparkles size={12}/> Improve with AI</button>
                   </div>
                   <textarea name="d_en" defaultValue={editingExperience?.description?.en || ''} className="w-full h-24 p-5 bg-slate-50 border rounded-2xl outline-none" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black hover:bg-indigo-600 transition-all shadow-xl">
                  {editingExperience ? 'Actualizar Registro' : 'Añadir al Historial'}
                </button>
              </form>
           </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black">{editingUser ? 'Editar Perfil' : 'Nuevo Usuario'}</h3>
                  <p className="text-xs text-slate-400 font-medium">Configura los accesos y estado del usuario.</p>
                </div>
                <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsProcessing(true);
                const fd = new FormData(e.currentTarget);
                const userData = {
                  username: fd.get('username') as string,
                  email: fd.get('email') as string,
                  role: fd.get('role') as UserRole,
                  status: fd.get('status') as UserStatus,
                } as any;
                const pass = fd.get('password') as string;
                if (pass) userData.password = pass;

                try {
                  if (editingUser) await dataService.updateUser(editingUser.id!, userData);
                  else await dataService.addUser(userData);
                  await loadUsers();
                  setShowUserModal(false);
                  showToast(editingUser ? 'Usuario actualizado con éxito' : 'Usuario creado correctamente');
                } catch (err: any) {
                  alert(err.message);
                } finally {
                  setIsProcessing(false);
                }
              }} className="space-y-6">
                <Input label="Username" name="username" val={editingUser?.username || ''} required />
                <Input label="Email Institucional" name="email" val={editingUser?.email || ''} type="email" />
                <Input label={editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"} name="password" type="password" required={!editingUser} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Rol de Acceso</label>
                     <select name="role" defaultValue={editingUser?.role || UserRole.VIEWER} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-4 ring-indigo-500/5">
                       <option value={UserRole.VIEWER}>VIEWER</option>
                       <option value={UserRole.EDITOR}>EDITOR</option>
                       <option value={UserRole.ADMIN}>ADMIN</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Estado de Cuenta</label>
                     <select name="status" defaultValue={editingUser?.status || UserStatus.ACTIVE} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-4 ring-indigo-500/5">
                       <option value={UserStatus.ACTIVE}>ACTIVE</option>
                       <option value={UserStatus.INACTIVE}>INACTIVE</option>
                       <option value={UserStatus.SUSPENDED}>SUSPENDED</option>
                     </select>
                  </div>
                </div>

                {editingUser?.status !== UserStatus.ACTIVE && editingUser && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">Atención: Este usuario no podrá iniciar sesión mientras su estado no sea ACTIVE.</p>
                  </div>
                )}

                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black hover:bg-indigo-600 transition-all shadow-xl">
                  {editingUser ? 'Actualizar Información' : 'Registrar en Sistema'}
                </button>
              </form>
           </div>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
             <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-6 border-b flex justify-between items-center z-10">
               <h3 className="text-2xl font-black">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
               <button onClick={() => setShowProjectModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
             </div>
             <form onSubmit={async (e) => {
               e.preventDefault();
               setIsProcessing(true);
               const fd = new FormData(e.currentTarget);
               const projectObj = {
                 title: { es: fd.get('t_es') as string, en: fd.get('t_en') as string },
                 description: { es: fd.get('d_es') as string, en: fd.get('d_en') as string },
                 longDescription: { es: fd.get('ld_es') as string, en: fd.get('ld_en') as string },
                 image: fd.get('img') as string,
                 link: fd.get('link') as string,
                 tags: (fd.get('tags') as string).split(',').map(s => s.trim())
               };
               try {
                 if (editingProject) await dataService.updateProject(editingProject.id!, projectObj);
                 else await dataService.addProject(projectObj as any);
                 refreshData();
                 setShowProjectModal(false);
                 showToast(editingProject ? 'Proyecto actualizado' : 'Proyecto creado');
               } catch (err) {
                 showToast('Error al guardar proyecto');
               } finally {
                 setIsProcessing(false);
               }
             }} className="p-10 space-y-8">
               <div className="grid grid-cols-2 gap-6">
                 <Input label="Título (ES)" name="t_es" val={editingProject?.title?.es || ''} />
                 <Input label="Título (EN)" name="t_en" val={editingProject?.title?.en || ''} />
               </div>
               <div className="grid grid-cols-2 gap-6">
                 <Input label="Imagen URL" name="img" val={editingProject?.image || ''} icon={<ImageIcon size={16}/>} />
                 <Input label="Link Live" name="link" val={editingProject?.link || ''} icon={<ExternalLink size={16}/>} />
               </div>
               <Input label="Tags (separados por coma)" name="tags" val={editingProject?.tags?.join(', ') || ''} icon={<Code size={16}/>} />
               
               <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400">Descripción Corta (ES)</label>
                    <textarea name="d_es" defaultValue={editingProject?.description?.es || ''} className="w-full h-24 p-5 bg-slate-50 border rounded-2xl outline-none" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400">Descripción Corta (EN)</label>
                    <textarea name="d_en" defaultValue={editingProject?.description?.en || ''} className="w-full h-24 p-5 bg-slate-50 border rounded-2xl outline-none" />
                 </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400">Caso de Estudio Extendido (ES)</label>
                  </div>
                  <textarea name="ld_es" defaultValue={editingProject?.longDescription?.es || ''} className="w-full h-40 p-5 bg-slate-50 border rounded-2xl outline-none resize-none" />
               </div>

               {!isReadOnly && <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                 <Save size={20}/> {editingProject ? 'Guardar Cambios' : 'Crear Proyecto en DB'}
               </button>}
             </form>
          </div>
        </div>
      )}

      {showSkillModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Nueva Habilidad</h3>
                <button onClick={() => setShowSkillModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsProcessing(true);
                const fd = new FormData(e.currentTarget);
                try {
                  await dataService.addSkill({
                    name: fd.get('name') as string,
                    category: fd.get('category') as any,
                    level: parseInt(fd.get('level') as string)
                  });
                  refreshData();
                  setShowSkillModal(false);
                  showToast('Habilidad añadida');
                } catch (err) {
                  showToast('Error al añadir habilidad');
                } finally {
                  setIsProcessing(false);
                }
              }} className="space-y-6">
                <Input label="Nombre de Habilidad" name="name" val="" required />
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400">Categoría</label>
                   <select name="category" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold outline-none">
                     <option>Frontend</option>
                     <option>Backend</option>
                     <option>Design</option>
                     <option>Others</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400">Nivel de Dominio (0-100)</label>
                   <input type="range" name="level" min="0" max="100" defaultValue="80" className="w-full accent-indigo-600" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black hover:bg-indigo-600 transition-all">Crear Habilidad</button>
              </form>
           </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full z-[101]">
          <CheckCircle className="text-emerald-500" size={24}/>
          <span className="font-black text-xs uppercase tracking-widest">{toast.msg}</span>
        </div>
      )}
      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-white/40 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={48}/>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
    {icon} <span className="text-sm font-bold">{label}</span>
  </button>
);

const ThemeCard = ({ themeKey, config, active, isReadOnly, onSelect }: any) => (
  <button 
    onClick={onSelect}
    disabled={isReadOnly}
    className={`relative p-4 rounded-[2rem] border-2 transition-all hover:scale-105 ${active ? 'border-indigo-600 bg-white shadow-xl ring-4 ring-indigo-500/5' : 'border-slate-100 bg-white'}`}
  >
    <div className={`w-full h-20 rounded-xl ${config.bg} mb-3 flex items-center justify-center border ${config.border} overflow-hidden`}>
       <span className={`${config.accentText} font-black text-lg italic tracking-tighter`}>Aa</span>
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 truncate">{themeKey.replace(/_/g, ' ')}</p>
    {active && <div className="absolute top-2 right-2 text-indigo-600 bg-white rounded-full shadow-md"><CheckCircle size={14}/></div>}
  </button>
);

const StatCard = ({ label, val, color, isText, icon }: any) => {
  const colorMap: any = {
    indigo: 'text-indigo-600 bg-indigo-50',
    rose: 'text-rose-600 bg-rose-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    slate: 'text-slate-600 bg-slate-50'
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${colorMap[color].split(' ')[1]}`}></div>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>{icon}</div>
      </div>
      <div className={`font-black leading-none ${isText ? 'text-xl' : 'text-5xl'} text-slate-900`}>{val}</div>
    </div>
  );
};

const ConnectionItem = ({ label, status, icon }: {label: string, status: boolean, icon: any}) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${status ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-tight text-slate-600">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${status ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
      <span className={`text-[9px] font-black uppercase ${status ? 'text-emerald-600' : 'text-red-600'}`}>
        {status ? 'Online' : 'Failed'}
      </span>
    </div>
  </div>
);

const Input = ({ label, name, val, type = "text", icon, required = false, placeholder = "" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <div className="relative group">
       {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">{icon}</div>}
       <input name={name} type={type} defaultValue={val} required={required} placeholder={placeholder} className={`w-full ${icon ? 'pl-12' : 'px-5'} py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium`} />
    </div>
  </div>
);

export default AdminPanel;
