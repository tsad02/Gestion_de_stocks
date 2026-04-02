import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

/**
 * Composant pour un élément de navigation dans la barre latérale.
 */
const NavItem = ({ to, icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 mb-1.5 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none translate-x-1'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
      }`
    }
  >
    <span className="mr-3 text-lg group-hover:scale-110 transition-transform">{icon}</span>
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </NavLink>
);

/**
 * Mise en page (Layout) globale de l'application.
 * Gère la barre latérale, l'en-tête, le thème sombre et l'affichage du contenu.
 */
const Layout = ({ children, onLogout, user }) => {
  const isAdmin = user?.role === 'RESPONSABLE';
  const navigate = useNavigate();
  
  // -- Gestion du Thème (Dark Mode) --
  // Initialisation à partir du localStorage ou des préférences système
  const [isDark, setIsDark] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  const handleLogout = () => {
    onLogout && onLogout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#fdfdfd] dark:bg-[#0f172a] font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-200">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white dark:bg-[#1e293b] border-r border-gray-100 dark:border-gray-800 flex flex-col hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 transition-colors duration-200">
        {/* LOGO SECTION */}
        <div className="p-8 pb-10">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-white dark:bg-gray-800 flex items-center justify-center rounded-2xl shadow-xl shadow-gray-200 dark:shadow-none group-hover:rotate-6 transition-transform overflow-hidden">
              <img src="/logo.png" alt="TTDJAPP Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter block leading-none dark:text-white">TTDJAPP</span>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 block">Gestion Stocks</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-6 overflow-y-auto space-y-8">
          <div>
            <p className="px-4 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Menu Principal</p>
            <NavItem to="/" icon="📊" label="Dashboard" end={true} />
            <NavItem to="/inventory" icon="📦" label="Inventaire" />
            <NavItem to="/movements" icon="🔄" label="Mouvements" />
            <NavItem to="/purchase-orders" icon="📋" label="Commandes" />
            {/* Nouveaux menus pour le module restaurant */}
            <NavItem to="/reports" icon="📈" label="Rapports" />
            <NavItem to="/suggestions" icon="💡" label="Suggestions" />
          </div>

          {isAdmin && (
            <div>
              <p className="px-4 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Administration</p>
              <NavItem to="/locations" icon="🏢" label="Localisations" />
              <NavItem to="/users" icon="👥" label="Utilisateurs" />
              <NavItem to="/audit" icon="🛡️" label="Traçabilité" />
            </div>
          )}

          <div>
            <p className="px-4 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Paramètres</p>
            <NavItem to="/config" icon="⚙️" label="Configuration" />
          </div>
        </nav>

        {/* USER PROFILE CARD */}
        <div className="p-6">
          <div 
            onClick={() => navigate('/profile')}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-105 transition-transform">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate dark:text-white">{user?.full_name || 'Utilisateur'}</p>
              <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* TOPBAR */}
        <header className="h-20 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-10 z-10 sticky top-0 transition-colors duration-200">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-900 dark:text-white" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all relative"
              title="Thème (Clair/Sombre)"
            >
              <span className="text-xl">{isDark ? '🌙' : '☀️'}</span>
            </button>
            <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-800" />
            <button 
              onClick={handleLogout}
              className="px-5 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all uppercase tracking-widest border border-rose-100 dark:border-rose-500/20"
            >
              Déconnexion
            </button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-[#fbfbfc] dark:bg-[#0f172a] transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
