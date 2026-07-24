import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizationsApi } from '../api/organizations';
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
  PlusCircleIcon,
  BuildingIcon,
  CrownIcon,
  HomeIcon,
  FileTextIcon,
  MonitorSmartphoneIcon,
  MoreHorizontalIcon,
  XIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmDialog } from './ConfirmDialog';

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-primary text-white font-medium'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(location.pathname.startsWith('/menu'));

  const { data: myOrg } = useQuery({
    queryKey: ['my-organization'],
    queryFn: () => organizationsApi.getMyOrg(),
    enabled: !!(user?.type === 'user'),
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate('/login');
  };

  const isAdmin = user?.type === 'admin' || (!!user && !user.organizationId);
  const isOrgAdmin = !isAdmin && user?.role === 'ADMIN';
  const permissions = user?.permissions || {};

  // Check if user has READ access to a page
  const canAccess = (page: string) => {
    if (isAdmin || isOrgAdmin) return true;
    return permissions[page]?.includes('READ');
  };

  const [moreOpen, setMoreOpen] = useState(false);

  // Close the mobile "Mais" drawer on Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  type MobileItem = { to: string; icon: React.ReactNode; label: string };

  // Full role-aware mobile destination list (drives the bottom bar + "Mais" drawer).
  const allMobileItems: MobileItem[] = (
    isAdmin
      ? [
          { to: '/', icon: <HomeIcon className="w-5 h-5" />, label: 'Início' },
          { to: '/admin/organizations', icon: <BuildingIcon className="w-5 h-5" />, label: 'Estabelecimentos' },
          { to: '/admin/plans', icon: <CrownIcon className="w-5 h-5" />, label: 'Planos' },
          { to: '/settings', icon: <SettingsIcon className="w-5 h-5" />, label: 'Configurações' },
          { to: '/sessions', icon: <MonitorSmartphoneIcon className="w-5 h-5" />, label: 'Dispositivos' },
        ]
      : ([
          { to: '/', icon: <HomeIcon className="w-5 h-5" />, label: 'Início' },
          canAccess('orders') && { to: '/orders', icon: <ClipboardListIcon className="w-5 h-5" />, label: 'Pedidos' },
          canAccess('menu') && { to: '/menu/categories', icon: <MenuIcon className="w-5 h-5" />, label: 'Cardápio' },
          canAccess('tables') && { to: '/tables', icon: <LayoutGridIcon className="w-5 h-5" />, label: 'Mesas' },
          canAccess('orders') && { to: '/waiter-calls', icon: <BellIcon className="w-5 h-5" />, label: 'Chamados' },
          (isOrgAdmin || canAccess('users')) && { to: '/users', icon: <UsersIcon className="w-5 h-5" />, label: 'Usuários' },
          (isOrgAdmin || canAccess('reports')) && { to: '/reports', icon: <BarChart3Icon className="w-5 h-5" />, label: 'Relatórios' },
          isOrgAdmin && { to: '/audit', icon: <FileTextIcon className="w-5 h-5" />, label: 'Atividades' },
          { to: '/settings', icon: <SettingsIcon className="w-5 h-5" />, label: 'Configurações' },
          { to: '/sessions', icon: <MonitorSmartphoneIcon className="w-5 h-5" />, label: 'Dispositivos' },
        ].filter(Boolean) as MobileItem[])
  );

  // Up to 4 primary destinations in the bottom bar; the rest live in the "Mais" drawer.
  const primaryMobileItems = allMobileItems.slice(0, 4);
  const hasMore = allMobileItems.length > 4;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar text-white h-screen sticky top-0 border-r border-gray-800">
        <button
          type="button"
          className="p-6 flex items-center gap-3 text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          onClick={() => navigate('/')}
          aria-label="Ir para o início"
        >
          <img src="/logo.svg" alt="" className="w-10 h-10" />
          <div>
            <span className="text-xl font-bold tracking-tight">
              {myOrg?.name || 'HeyChef'}
            </span>
            {myOrg && (
              <p className="text-xs text-gray-400 truncate">{(myOrg as any).planName || 'Sem plano'}</p>
            )}
          </div>
        </button>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Plan expired banner — only for restaurant users */}
          {!isAdmin && myOrg?.planExpiresAt && myOrg.planExpiresAt < Date.now() && (
            <div className="mx-3 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs font-semibold text-red-400 mb-1">Plano expirado</p>
              <p className="text-xs text-gray-400">Você só pode visualizar dados. Renove seu plano para continuar operando.</p>
            </div>
          )}

          {/* Admin view — platform management only */}
          {isAdmin && (
            <>
              <NavItem to="/" icon={<HomeIcon className="w-5 h-5" />} label="Dashboard" />
              <NavItem to="/admin/organizations" icon={<BuildingIcon className="w-5 h-5" />} label="Estabelecimentos" />
              <NavItem to="/admin/plans" icon={<CrownIcon className="w-5 h-5" />} label="Planos" />
              <NavItem to="/settings" icon={<SettingsIcon className="w-5 h-5" />} label="Configurações" />
              <NavItem to="/sessions" icon={<MonitorSmartphoneIcon className="w-5 h-5" />} label="Dispositivos" />
            </>
          )}

          {/* Organization ADMIN view */}
          {isOrgAdmin && (
            <>
              <NavItem to="/" icon={<HomeIcon className="w-5 h-5" />} label="Dashboard" />
              <NavItem to="/orders" icon={<ClipboardListIcon className="w-5 h-5" />} label="Pedidos" />
              <CardapioSubmenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} location={location} />
              <NavItem to="/tables" icon={<LayoutGridIcon className="w-5 h-5" />} label="Mesas" />
              <NavItem to="/waiter-calls" icon={<BellIcon className="w-5 h-5" />} label="Chamados" />

              <div className="pt-6 pb-2 px-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administração
                </p>
              </div>
              <NavItem to="/users" icon={<UsersIcon className="w-5 h-5" />} label="Usuários" />
              <NavItem to="/reports" icon={<BarChart3Icon className="w-5 h-5" />} label="Relatórios" />
              <NavItem to="/audit" icon={<FileTextIcon className="w-5 h-5" />} label="Atividades" />
              <NavItem to="/settings" icon={<SettingsIcon className="w-5 h-5" />} label="Configurações" />
              <NavItem to="/sessions" icon={<MonitorSmartphoneIcon className="w-5 h-5" />} label="Dispositivos" />
            </>
          )}

          {/* USER / SUPPORT view — only pages they have permission to */}
          {!isAdmin && !isOrgAdmin && (
            <>
              {canAccess('orders') && (
                <NavItem to="/orders" icon={<ClipboardListIcon className="w-5 h-5" />} label="Pedidos" />
              )}
              {canAccess('menu') && (
                <CardapioSubmenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} location={location} />
              )}
              {canAccess('tables') && (
                <NavItem to="/tables" icon={<LayoutGridIcon className="w-5 h-5" />} label="Mesas" />
              )}
              {canAccess('orders') && (
                <NavItem to="/waiter-calls" icon={<BellIcon className="w-5 h-5" />} label="Chamados" />
              )}
              {canAccess('users') && (
                <NavItem to="/users" icon={<UsersIcon className="w-5 h-5" />} label="Usuários" />
              )}
              {canAccess('reports') && (
                <NavItem to="/reports" icon={<BarChart3Icon className="w-5 h-5" />} label="Relatórios" />
              )}
              <NavItem to="/sessions" icon={<MonitorSmartphoneIcon className="w-5 h-5" />} label="Dispositivos" />
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
          >
            <LogOutIcon className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sair da conta"
        message="Tem certeza que deseja sair? Você precisará fazer login novamente."
        confirmText="Sair"
        isDanger
      />

      {/* Mobile Bottom Nav */}
      <nav aria-label="Navegação principal" className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around p-2">
          {primaryMobileItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[48px] px-2 py-1 rounded-lg min-w-[60px] ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          ))}
          {hasMore && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="Mais opções"
              aria-haspopup="dialog"
              className="flex flex-col items-center justify-center min-h-[48px] px-2 py-1 rounded-lg min-w-[60px] text-text-muted hover:text-text-primary"
            >
              <MoreHorizontalIcon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Mais</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile "Mais" drawer — full navigation for the current role */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-4 pb-safe max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-text-primary">Menu</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Fechar menu"
                className="p-2 -m-2 text-text-muted hover:text-text-primary rounded-full"
              >
                <XIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allMobileItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 min-h-[52px] px-4 rounded-xl border transition-colors ${
                      isActive
                        ? 'border-primary bg-primary-light text-primary-strong font-medium'
                        : 'border-border text-text-primary hover:bg-gray-50'
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="flex items-center gap-3 w-full min-h-[52px] px-4 mt-3 rounded-xl border border-border text-danger hover:bg-red-50 transition-colors"
            >
              <LogOutIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function CardapioSubmenu({
  menuOpen,
  setMenuOpen,
  location,
}: {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  location: { pathname: string };
}) {
  return (
    <div>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
          location.pathname.startsWith('/menu')
            ? 'bg-gray-800 text-white font-medium'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive ? 'bg-primary text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <TagIcon className="w-4 h-4" />
            <span>Categorias</span>
          </NavLink>
          <NavLink
            to="/menu/products"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive ? 'bg-primary text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <UtensilsIcon className="w-4 h-4" />
            <span>Produtos</span>
          </NavLink>
          <NavLink
            to="/menu/addons"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                isActive ? 'bg-primary text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span>Adicionais</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}
