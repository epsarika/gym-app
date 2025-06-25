import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: '/home.svg',
      activeIcon: '/home-filled.svg',
    },
    {
      label: 'Members',
      path: '/members',
      icon: '/members.svg',
      activeIcon: '/members-filled.svg',
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: '/settings.svg',
      activeIcon: '/settings-filled.svg',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-18 pb-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.path} className="flex flex-col items-center">
              <button onClick={() => navigate(item.path)} className="flex flex-col items-center">
                <img
                  src={isActive ? item.activeIcon : item.icon}
                  alt={item.label}
                  className="w-6 h-6"
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
