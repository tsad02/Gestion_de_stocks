import React from 'react';

const SidebarItem = ({ icon, label, active }) => (
  <div className={`flex items-center px-4 py-3 mb-2 rounded-xl cursor-pointer transition-colors ${active ? 'bg-gray-100 text-black font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
    <span className="mr-3 text-lg">{icon}</span>
    <span className="text-sm">{label}</span>
  </div>
);

const Layout = ({ children, onLogout, user }) => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b border-gray-50">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg font-bold text-xl mr-3">
            T
          </div>
          <span className="text-xl font-bold text-gray-900">Tim Hortons</span>
        </div>

        {/* Navigation */}
        <div className="flexflex-1 overflow-y-auto px-4 py-6">
          <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu Principal
          </div>
          <SidebarItem icon="📊" label="Dashboard" active={true} />
          <SidebarItem icon="📦" label="Inventaire" />
          <SidebarItem icon="🛒" label="Commandes" />
          <SidebarItem icon="📈" label="Rapports" />
          
          <div className="mt-8 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Paramètres
          </div>
          <SidebarItem icon="⚙️" label="Configuration" />
          <SidebarItem icon="👥" label="Utilisateurs" />
        </div>

        {/* User Profile */}
        <div className="mt-auto px-6 py-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.username || 'Utilisateur'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa]">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 w-96">
            <span className="text-gray-400 mr-2">🔍</span>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
            />
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-gray-600 relative">
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={onLogout}
              className="bg-black text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
