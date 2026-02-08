
import React, { useState, useEffect, useCallback } from 'react';
import { PortfolioData, AuthState, UserRole, Language } from './types';
import { dataService } from './services/dataService';
import PortfolioView from './components/PortfolioView';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { Loader2, AlertCircle, Database } from 'lucide-react';

const AUTH_STORAGE_KEY = 'portfolio_admin_session';
const LANG_STORAGE_KEY = 'portfolio_language';

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (saved as Language) || Language.ES;
  });

  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { isAuthenticated: false, user: null, role: null };
  });

  const [view, setView] = useState<'public' | 'admin'>('public');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorInfo(null);
      try {
        const portfolioData = await dataService.getData();
        setData(portfolioData);
        if ((portfolioData as any).isOffline) {
          setIsOffline(true);
        }
      } catch (err: any) {
        console.error("Critical Load Error:", err);
        setErrorInfo(err.message || "Error al conectar con la base de datos.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const handleHash = useCallback(() => {
    const hash = window.location.hash;
    setView(hash === '#admin' ? 'admin' : 'public');
  }, []);

  useEffect(() => {
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [handleHash]);

  const handleLoginSuccess = (authState: AuthState) => {
    setAuth(authState);
    setView('admin');
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null, role: null });
    window.location.hash = '';
    setView('public');
  };

  const updateData = (newData: PortfolioData) => {
    setData(newData);
  };

  const navigateTo = (newHash: string) => {
    window.location.hash = newHash;
    setView(newHash === '#admin' ? 'admin' : 'public');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-bold animate-pulse text-xs uppercase tracking-widest">
          {lang === Language.ES ? 'Cargando datos desde PostgreSQL...' : 'Loading data from PostgreSQL...'}
        </p>
      </div>
    );
  }

  if (errorInfo && !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200 max-w-lg w-full">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-slate-900 mb-4">Error de Conexión</h1>
          <p className="text-slate-500 mb-8">{errorInfo}</p>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all">
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 w-full bg-amber-500 text-white text-[10px] font-black uppercase py-1.5 text-center z-[9999] tracking-widest flex items-center justify-center gap-2">
          <Database size={12} /> Persistence Offline: Mostrando datos de respaldo (Local)
        </div>
      )}
      {view === 'admin' ? (
        !auth.isAuthenticated ? (
          <Login onLoginSuccess={handleLoginSuccess} lang={lang} />
        ) : (
          <AdminPanel data={data!} auth={auth} onUpdate={updateData} onLogout={handleLogout} lang={lang} onLangChange={setLang} />
        )
      ) : (
        <PortfolioView data={data!} onNavigate={navigateTo} lang={lang} onLangChange={setLang} />
      )}
    </>
  );
};

export default App;
