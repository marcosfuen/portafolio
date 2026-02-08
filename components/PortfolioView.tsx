
import React, { useState, useEffect } from 'react';
import { PortfolioData, Project, Skill, WorkExperience, Language } from '../types';
import { THEME_CONFIGS, UI_STRINGS } from '../constants';
import { Github, Linkedin, Mail, ArrowRight, ExternalLink, ChevronLeft, ChevronRight, X, Layers, Globe, MousePointer2, Award, Code as CodeIcon, FileText, ChevronUp, ChevronDown, MapPin, Calendar, Briefcase } from 'lucide-react';

interface Props {
  data: PortfolioData;
  onNavigate?: (hash: string) => void;
  lang: Language;
  onLangChange: (l: Language) => void;
}

const PortfolioView: React.FC<Props> = ({ data, onNavigate, lang, onLangChange }) => {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentSkillPageIndex, setCurrentSkillPageIndex] = useState(0);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scrolled, setScrolled] = useState(false);
  
  const theme = THEME_CONFIGS[data?.theme] || THEME_CONFIGS.MODERN;
  const t = UI_STRINGS[lang];

  const skillsPerPage = 4;
  const skillsCount = data?.skills?.length || 0;
  const totalSkillPages = Math.ceil(skillsCount / (skillsPerPage || 1)) || 1;

  const experiencesPerPage = 1;
  const experienceCount = data?.workExperience?.length || 0;
  const totalExpPages = Math.ceil(experienceCount / experiencesPerPage) || 1;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextProject = () => {
    if (data?.projects?.length) {
      setCurrentProjectIndex((prev) => (prev + 1) % data.projects.length);
    }
  };
  
  const prevProject = () => {
    if (data?.projects?.length) {
      setCurrentProjectIndex((prev) => (prev - 1 + data.projects.length) % data.projects.length);
    }
  };
  
  const nextSkillPage = () => setCurrentSkillPageIndex((prev) => (prev + 1) % totalSkillPages);
  const prevSkillPage = () => setCurrentSkillPageIndex((prev) => (prev - 1 + totalSkillPages) % totalSkillPages);

  const nextExp = () => setCurrentExperienceIndex((prev) => (prev + 1) % experienceCount);
  const prevExp = () => setCurrentExperienceIndex((prev) => (prev - 1 + experienceCount) % experienceCount);

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : 'auto';
  }, [selectedProject]);

  const userName = data?.name || 'Alex Dev';
  const initialLetter = (userName && typeof userName === 'string') ? userName.charAt(0) : 'A';
  const currentYear = new Date().getFullYear();

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${theme.font} transition-colors duration-700 overflow-x-hidden selection:bg-indigo-500 selection:text-white`}>
      
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-4 ${scrolled ? 'backdrop-blur-xl bg-opacity-70 border-b border-opacity-10 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={(e) => scrollTo(e, 'home')}>
            <div className={`w-10 h-10 ${theme.accent} rounded-xl flex items-center justify-center text-white font-black italic transform group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20`}>
              {initialLetter}
            </div>
            <h1 className="text-xl font-black tracking-tighter">{userName}</h1>
          </div>
          
          <div className="hidden md:flex gap-8 items-center">
            <a href="#projects" onClick={(e) => scrollTo(e, 'projects')} className="text-sm font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">{t.projects}</a>
            <a href="#experience" onClick={(e) => scrollTo(e, 'experience')} className="text-sm font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">{t.work_experience}</a>
            <a href="#skills" onClick={(e) => scrollTo(e, 'skills')} className="text-sm font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">{t.skills}</a>
            
            <div className="flex bg-current/5 p-1 rounded-xl border border-current/10 ml-2">
              <button onClick={() => onLangChange(Language.ES)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${lang === Language.ES ? theme.accent + ' text-white shadow-lg' : 'opacity-40 hover:opacity-70'}`}>ES</button>
              <button onClick={() => onLangChange(Language.EN)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${lang === Language.EN ? theme.accent + ' text-white shadow-lg' : 'opacity-40 hover:opacity-70'}`}>EN</button>
            </div>

            <button onClick={() => onNavigate && onNavigate('#admin')} className="ml-4 px-6 py-2.5 rounded-full border-2 border-current text-xs font-black uppercase tracking-widest hover:bg-current hover:text-white transition-all transform hover:-translate-y-1 active:scale-95">
              {t.admin}
            </button>
          </div>
          
          <button className="md:hidden p-2"><Layers size={24} /></button>
        </div>
      </nav>

      <header id="home" className="relative min-h-screen flex items-center pt-20 px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-16 z-10">
          <div className="space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-current/5 border border-current/10">
              <span className={`w-2 h-2 rounded-full ${theme.accent} animate-ping`}></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{t.available}</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
              {t.hero_impact.split(' ')[0]} <span className={theme.accentText}>{t.hero_impact.split(' ')[1] || ''}</span><br />
              {t.hero_build.split(' ')[0]} <span className="italic opacity-50">{t.hero_build.split(' ')[1] || ''}</span>.
            </h2>
            
            <p className="text-xl md:text-2xl opacity-70 max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
              {data?.bio?.[lang] || ''}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <a href="#projects" onClick={(e) => scrollTo(e, 'projects')} className={`flex items-center justify-center gap-3 px-10 py-5 rounded-2xl ${theme.accent} text-white font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1`}>
                {t.view_work} <ArrowRight size={20} />
              </a>
              
              {data?.cvUrl && (
                <a href={data.cvUrl} target="_blank" className={`flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-current/5 border border-current/10 font-bold text-lg hover:bg-current hover:text-white transition-all transform hover:-translate-y-1`}>
                   {t.download_cv} <FileText size={20} />
                </a>
              )}

              <div className="flex gap-3 justify-center">
                <a href={data?.github || '#'} target="_blank" className="p-5 rounded-2xl bg-current/5 border border-current/10 hover:bg-current hover:text-white transition-all transform hover:rotate-6"><Github size={24} /></a>
                <a href={data?.linkedin || '#'} target="_blank" className="p-5 rounded-2xl bg-current/5 border border-current/10 hover:bg-current hover:text-white transition-all transform hover:-rotate-6"><Linkedin size={24} /></a>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center animate-in fade-in zoom-in duration-1000 delay-300">
            <img src={data?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'} alt={userName} className="w-72 h-72 md:w-[450px] md:h-[450px] rounded-[3rem] object-cover shadow-2xl border-8 border-white/5 transform hover:scale-[1.02] transition-transform duration-700" />
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-current/5 animate-bounce delay-1000">
              <Award size={32} className={theme.accentText} />
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30"><MousePointer2 size={32} /></div>
      </header>

      <section id="projects" className="py-32 px-6 md:px-12 bg-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <h3 className="text-5xl md:text-6xl font-black tracking-tighter">{t.projects} <span className="opacity-30">Elite</span></h3>
              <div className={`w-32 h-2 ${theme.accent} rounded-full`}></div>
            </div>
            {data?.projects && data.projects.length > 0 && (
              <div className="flex gap-4">
                <button onClick={prevProject} className="p-5 rounded-full border-2 border-current/10 hover:bg-current hover:text-white transition-all"><ChevronLeft size={28} /></button>
                <button onClick={nextProject} className="p-5 rounded-full border-2 border-current/10 hover:bg-current hover:text-white transition-all"><ChevronRight size={28} /></button>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden">
            <div 
              className="flex transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]" 
              style={{ transform: `translateX(-${currentProjectIndex * 100}%)` }}
            >
              {data?.projects && data.projects.length > 0 ? (
                data.projects.map((project, idx) => (
                  <div key={project.id || idx} className="w-full flex-shrink-0 px-4">
                    <div className={`${theme.card} rounded-[3.5rem] overflow-hidden border ${theme.border} grid grid-cols-1 lg:grid-cols-2 shadow-2xl hover:shadow-indigo-500/10 transition-shadow cursor-pointer group`} onClick={() => setSelectedProject(project)}>
                      <div className="relative h-[400px] lg:h-auto overflow-hidden">
                        <img src={project.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1000'} alt={project.title?.[lang] || ''} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-10 left-10">
                          <span className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full font-bold text-sm border border-white/20">{t.case_study} 0{idx + 1}</span>
                        </div>
                      </div>
                      <div className="p-10 md:p-20 flex flex-col justify-center">
                        <div className="flex gap-2 mb-8 flex-wrap">
                          {project.tags?.map(tag => (
                            <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-current/5 border border-current/10">{tag}</span>
                          ))}
                        </div>
                        <h4 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">{project.title?.[lang] || 'Sin título'}</h4>
                        <p className="opacity-70 text-lg leading-relaxed mb-10 line-clamp-4">{project.description?.[lang] || ''}</p>
                        <button className={`w-fit flex items-center gap-3 text-lg font-black ${theme.accentText} group-hover:gap-5 transition-all`}>
                          {t.explore} <ArrowRight size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-20 opacity-40 font-bold uppercase tracking-widest">
                  No hay proyectos disponibles en la base de datos.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HISTORIAL LABORAL - VERTICAL CAROUSEL */}
      <section id="experience" className="py-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 space-y-4">
             <h3 className="text-5xl font-black tracking-tighter uppercase">{t.experience_title}</h3>
             <div className={`w-24 h-2 ${theme.accent} mx-auto rounded-full`}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
             <div className="md:col-span-10 relative h-[400px] overflow-hidden order-2 md:order-1">
                <div 
                  className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{ transform: `translateY(-${currentExperienceIndex * 400}px)` }}
                >
                  {data?.workExperience?.length ? data.workExperience.map((exp, idx) => (
                    <div key={exp.id} className="h-[400px] flex-shrink-0 flex items-center">
                       <div className={`${theme.card} w-full p-10 md:p-16 rounded-[3rem] border ${theme.border} shadow-2xl relative group`}>
                          <div className={`absolute top-10 right-10 text-7xl font-black opacity-5 italic`}>0{idx + 1}</div>
                          <div className="flex gap-3 items-center mb-6">
                             <div className={`w-12 h-12 rounded-xl ${theme.accent} flex items-center justify-center text-white`}><Briefcase size={24}/></div>
                             <h4 className="text-3xl font-black">{exp.role[lang]}</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 border-b border-current/5 pb-8">
                             <div className="flex items-center gap-3"><Globe className={theme.accentText} size={20}/> <span className="font-bold opacity-70">{exp.company}</span></div>
                             <div className="flex items-center gap-3"><MapPin className={theme.accentText} size={20}/> <span className="font-bold opacity-70">{exp.location}</span></div>
                             <div className="flex items-center gap-3"><Calendar className={theme.accentText} size={20}/> <span className="font-bold uppercase text-xs tracking-widest">{exp.dates}</span></div>
                          </div>
                          <p className="text-xl leading-relaxed opacity-60 font-medium italic">"{exp.description[lang]}"</p>
                       </div>
                    </div>
                  )) : (
                    <div className="h-[400px] flex items-center justify-center opacity-30 font-black uppercase tracking-widest">Experiencia no cargada.</div>
                  )}
                </div>
             </div>
             
             <div className="md:col-span-2 flex md:flex-col justify-center gap-4 order-1 md:order-2">
                <button onClick={prevExp} className="p-4 rounded-full border-2 border-current/10 hover:bg-current hover:text-white transition-all active:scale-95"><ChevronUp size={32} /></button>
                <button onClick={nextExp} className="p-4 rounded-full border-2 border-current/10 hover:bg-current hover:text-white transition-all active:scale-95"><ChevronDown size={32} /></button>
             </div>
          </div>
        </div>
      </section>

      <section id="skills" className="py-32 px-6 md:px-12 bg-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-5xl md:text-6xl font-black tracking-tighter">{t.expertise}</h3>
              <p className="text-xl opacity-60 font-medium max-w-lg">{t.expertise_desc}</p>
            </div>
            
            {totalSkillPages > 1 && (
              <div className="flex gap-4">
                 <button onClick={prevSkillPage} className="p-5 rounded-full border-2 border-current/10 hover:bg-current hover:text-white transition-all shadow-sm"><ChevronLeft size={24} /></button>
                 <button onClick={nextSkillPage} className="p-5 rounded-full border-2 border-current/10 hover:bg-current hover:text-white transition-all shadow-sm"><ChevronRight size={24} /></button>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden">
            <div 
              className="flex transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]" 
              style={{ transform: `translateX(-${currentSkillPageIndex * 100}%)` }}
            >
              {data?.skills && data.skills.length > 0 ? (
                Array.from({ length: totalSkillPages }).map((_, pageIdx) => (
                  <div key={pageIdx} className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {data.skills.slice(pageIdx * skillsPerPage, (pageIdx + 1) * skillsPerPage).map((skill) => (
                      <div key={skill.id} className={`${theme.card} p-10 rounded-[2.5rem] border ${theme.border} group hover:-translate-y-2 transition-all shadow-lg hover:shadow-2xl`}>
                        <div className="flex justify-between items-start mb-8">
                          <div className={`w-14 h-14 rounded-2xl ${theme.accent} flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:rotate-12 transition-transform`}>
                            <CodeIcon size={28} />
                          </div>
                          <span className="text-2xl font-black font-mono opacity-20">{skill.level}%</span>
                        </div>
                        <h5 className="text-2xl font-black mb-2">{skill.name}</h5>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-6">{skill.category}</p>
                        <div className="w-full h-1.5 bg-current/5 rounded-full overflow-hidden">
                          <div className={`h-full ${theme.accent} transition-all duration-1000`} style={{ width: `${skill.level}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-10 opacity-30">No hay habilidades listadas.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedProject(null)}></div>
          <div className={`${theme.card} relative w-full max-w-6xl max-h-[90vh] rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row border ${theme.border} animate-in zoom-in-95 duration-500`}>
            <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 z-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"><X size={32} /></button>
            <div className="w-full lg:w-3/5 bg-black"><img src={selectedProject.image} alt={selectedProject.title?.[lang] || ''} className="w-full h-full object-cover" /></div>
            <div className="w-full lg:w-2/5 p-10 md:p-16 overflow-y-auto">
              <span className="text-xs font-black uppercase tracking-[0.3em] opacity-30 mb-4 block">{t.case_study}</span>
              <h3 className="text-4xl font-black mb-8 tracking-tighter">{selectedProject.title?.[lang] || ''}</h3>
              <div className="space-y-12">
                <div className="space-y-4">
                   <h5 className="font-black text-xs uppercase tracking-widest opacity-40 flex items-center gap-2"><Layers size={16} /> Overview</h5>
                   <p className="text-xl font-medium leading-relaxed opacity-80">{selectedProject.description?.[lang] || ''}</p>
                </div>
                <div className="space-y-4">
                   <h5 className="font-black text-xs uppercase tracking-widest opacity-40 flex items-center gap-2"><Globe size={16} /> Deep Dive</h5>
                   <p className="opacity-70 leading-relaxed text-lg">{selectedProject.longDescription?.[lang] || ''}</p>
                </div>
              </div>
              <div className="mt-16">
                <a href={selectedProject.link} target="_blank" className={`w-full py-5 rounded-[2rem] ${theme.accent} text-white font-black text-center flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1`}>
                  {t.visit_live} <ExternalLink size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-20 border-t border-current/5 px-6 md:px-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-2xl font-black tracking-tighter">{userName}</h4>
            <p className="opacity-40 text-sm font-bold uppercase tracking-widest">{data?.role?.[lang] || ''}</p>
          </div>
          <div className="flex gap-10">
            <a href={data?.github || '#'} target="_blank" className="opacity-40 hover:opacity-100 transition-all"><Github size={32} /></a>
            <a href={data?.linkedin || '#'} target="_blank" className="opacity-40 hover:opacity-100 transition-all"><Linkedin size={32} /></a>
            <a href={`mailto:${data?.email || ''}`} className="opacity-40 hover:opacity-100 transition-all"><Mail size={32} /></a>
          </div>
          <p className="opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">© {currentYear} • {t.footer_built}</p>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioView;
