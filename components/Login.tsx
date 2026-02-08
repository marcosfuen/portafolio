
import React, { useState } from 'react';
import { Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { dataService } from '../services/dataService';
import { AuthState, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface Props {
  onLoginSuccess: (auth: AuthState) => void;
  lang: Language;
}

const Login: React.FC<Props> = ({ onLoginSuccess, lang }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = UI_STRINGS[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const auth = await dataService.login(username, password);
      onLoginSuccess(auth);
    } catch (err: any) {
      console.error("Login component error:", err.message);
      setError(err.message || 'Error inesperado al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-200 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 transform hover:rotate-6 transition-transform">
              <Lock size={36} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.login_title}</h1>
            <p className="text-slate-500 mt-2">{t.login_desc}</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[1.5rem] flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-red-500 text-white p-1.5 rounded-lg shrink-0 mt-0.5">
                <ShieldAlert size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">Error de Sistema</p>
                <p className="text-xs font-bold text-red-800 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">{t.username}</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-medium" 
                  placeholder="admin" 
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">{t.password}</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-medium" 
                  placeholder="••••••••" 
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>{t.login_btn} <ArrowRight size={20} /></>}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
               Persistence Layer: PostgreSQL 15 & MD5 Encryption
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
