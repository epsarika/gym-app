import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/',
      icon: '/home.svg',
      activeIcon: '/home-filled.svg',
    },
    {
      path: '/members',
      icon: '/members.svg',
      activeIcon: '/members-filled.svg',
    },
    {
      path: '/settings',
      icon: '/settings.svg',
      activeIcon: '/settings-filled.svg',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-[84px] pb-7">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-3 px-4 cursor-pointer w-full transition 
                hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 
                ${isActive ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}
              `}
            >
              <img
                src={isActive ? item.activeIcon : item.icon}
                className="w-6 h-6 mb-1 dark:invert"
              />
              <span className="text-xs">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
