// Topbar component for AppLens dashboard with mobile hamburger menu
import { motion } from 'motion/react';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import { useSidebar } from '../../context/SidebarContext';

// Helper to get initial theme from localStorage or system preference
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// External store for theme to avoid setState in useEffect
const themeStore = {
  theme: getInitialTheme(),
  listeners: new Set(),
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  getSnapshot() {
    return this.theme;
  },
  setTheme(newTheme) {
    this.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    this.listeners.forEach(listener => listener());
  }
};

function Topbar({ title, subtitle }) {
  const { toggle } = useSidebar();
  const theme = useSyncExternalStore(
    (listener) => themeStore.subscribe(listener),
    () => themeStore.getSnapshot()
  );

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('theme');
      if (currentTheme && currentTheme !== themeStore.theme) {
        themeStore.setTheme(currentTheme);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    themeStore.setTheme(newTheme);
    
    // Apply to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-20 lg:hidden ${isDark ? 'bg-slate-100 dark:bg-slate-900/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDark ? 'border-slate-300 dark:border-slate-700' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side - Mobile menu button & Title */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggle}
            className={`p-2 rounded-xl lg:hidden transition-colors cursor-pointer ${
              isDark 
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-900' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Page Title */}
          <div>
            {title && (
              <h1 className={`text-lg font-semibold ${isDark ? 'text-slate-900 dark:text-white' : 'text-slate-900'}`}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p className={`text-sm ${isDark ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2.5 rounded-xl transition-colors ${
              isDark 
                ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-slate-800' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </motion.button> */}

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              isDark 
                ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-slate-800' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="Toggle theme"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </motion.button>

          {/* Notifications */}
          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-2.5 rounded-xl transition-colors ${
              isDark 
                ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-slate-800' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button> */}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
