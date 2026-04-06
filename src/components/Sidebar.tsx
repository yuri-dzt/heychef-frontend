import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ClipboardListIcon,
  MenuIcon,
  LayoutGridIcon,
  BellIcon,
  UsersIcon,
  BarChart3Icon,
  SettingsIcon,
  LogOutIcon,
  ChevronDownIcon,
  TagIcon,
  UtensilsIcon,
  BuildingIcon } from
'lucide-react';
import { useAuth } from '../contexts/AuthContext';
export function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(location.pathname.startsWith('/menu'));
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const navItems = [
  {
    to: '/orders',
    icon: <ClipboardListIcon className="w-5 h-5" />,
    label: 'Pedidos'
  },
  {
    to: '/tables',
    icon: <LayoutGridIcon className="w-5 h-5" />,
    label: 'Mesas'
  },
  {
    to: '/waiter-calls',
    icon: <BellIcon className="w-5 h-5" />,
    label: 'Chamados'
  }];

  const adminItems = [
  {
    to: '/users',
    icon: <UsersIcon className="w-5 h-5" />,
    label: 'Usuários'
  },
  {
    to: '/reports',
    icon: <BarChart3Icon className="w-5 h-5" />,
    label: 'Relatórios'
  },
  {
    to: '/settings',
    icon: <SettingsIcon className="w-5 h-5" />,
    label: 'Configurações'
  }];

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const NavItem = ({
    to,
    icon,
    label




  }: {to: string;icon: React.ReactNode;label: string;}) =>
  <NavLink
    to={to}
    className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
        ${isActive ? 'bg-primary text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
      `}>
    
      {icon}
      <span>{label}</span>
    </NavLink>;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar text-white h-screen sticky top-0 border-r border-gray-800">
        <div
          className="p-6 flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}>
          
          <img src="/logo.svg" alt="HeyChef" className="w-10 h-10" />
          <span className="text-xl font-bold tracking-tight">HeyChef</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavItem to="/orders" icon={<ClipboardListIcon className="w-5 h-5" />} label="Pedidos" />

          {/* Cardápio submenu */}
          <div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/menu') ? 'bg-primary/20 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MenuIcon className="w-5 h-5" />
                <span>Cardápio</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <NavLink
                  to="/menu/categories"
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${isActive ? 'bg-primary text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                  <TagIcon className="w-4 h-4" />
                  <span>Categorias</span>
                </NavLink>
                <NavLink
                  to="/menu/products"
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${isActive ? 'bg-primary text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                  <UtensilsIcon className="w-4 h-4" />
                  <span>Produtos</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavItem to="/tables" icon={<LayoutGridIcon className="w-5 h-5" />} label="Mesas" />
          <NavItem to="/waiter-calls" icon={<BellIcon className="w-5 h-5" />} label="Chamados" />

          {isAdmin &&
          <>
              <div className="pt-6 pb-2 px-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administração
                </p>
              </div>
              {adminItems.map((item) =>
            <NavItem key={item.to} {...item} />
            )}
            </>
          }

          {isSuperAdmin && (
            <>
              <div className="pt-6 pb-2 px-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Super Admin
                </p>
              </div>
              <NavItem to="/admin/organizations" icon={<BuildingIcon className="w-5 h-5" />} label="Estabelecimentos" />
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200">
            
            <LogOutIcon className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
                flex flex-col items-center p-2 rounded-lg min-w-[64px]
                ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'}
              `}>
            
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          )}
        </div>
      </nav>
    </>);

}