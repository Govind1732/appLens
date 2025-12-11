// Sidebar component for AppLens dashboard with Framer Motion animations
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useSidebar } from '../../context/SidebarContext';
import { navItems } from './navItems';
import icon from '../../assets/icon2.png';

// Animation variants for mobile sidebar
const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
};

const overlayVariants = {
  open: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  closed: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3
    }
  })
};

// Desktop sidebar width variants
const desktopSidebarVariants = {
  expanded: {
    width: 260,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  collapsed: {
    width: 72,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  hover: {
    width: 280,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 35
    }
  }
};

// Label fade animation
const labelVariants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  hidden: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.15,
      ease: 'easeIn'
    }
  }
};

function Sidebar() {
  const { isOpen, close, setDesktopExpanded, resetDesktopWidth } = useSidebar();
  const { user, logout } = useAuthStore();
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);

  const handleLogout = () => {
    logout();
    close();
  };

  const desktopState = isDesktopHovered ? 'expanded' : 'collapsed';
  const showLabels = isDesktopHovered;

  // Initialize desktop width on mount for large screens and handle resize
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');

    const syncWidth = () => {
      if (mq.matches) {
        setDesktopExpanded(false); // collapsed width (72px)
      } else {
        resetDesktopWidth(); // zero offset on mobile
      }
    };

    syncWidth();
    mq.addEventListener('change', syncWidth);
    return () => mq.removeEventListener('change', syncWidth);
  }, [resetDesktopWidth, setDesktopExpanded]);

  return (
    <>
      {/* Mobile overlay with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar with Framer Motion */}
      <motion.div
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className="fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 w-[280px] flex flex-col lg:hidden shadow-2xl shadow-black/50"
      >
        {/* Mobile Header with close button */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-lg flex items-center justify-center"
            >
              {/* <span className="text-white font-bold text-sm"></span> */}
              <img src={icon} alt="AppLens Logo" className="" />
            </motion.div>
            <div>
              <h1 className="text-slate-900 dark:text-white font-semibold text-lg">AppLens</h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Data Analytics</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={close}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <motion.div
              key={item.label}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <NavLink
                to={item.path}
                onClick={close}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Mobile User Profile & Logout */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-900 dark:text-white font-medium text-sm truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Desktop Sidebar - Always visible with collapse animation */}
      <motion.div 
        initial="collapsed"
        animate={desktopState}
        variants={desktopSidebarVariants}
        onHoverStart={() => {
          setIsDesktopHovered(true);
          setDesktopExpanded(true);
        }}
        onHoverEnd={() => {
          setIsDesktopHovered(false);
          setDesktopExpanded(false);
        }}
        className="hidden lg:flex fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col z-30 overflow-hidden"
      >
        {/* Desktop Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            >
              <img src={icon} alt="AppLens Logo" className="" />
            </motion.div>
            <AnimatePresence>
              {showLabels && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={labelVariants}
                  className="min-w-0"
                >
                  <h1 className="text-slate-900 dark:text-white font-semibold text-lg whitespace-nowrap">AppLens</h1>
                  <p className="text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">Data Analytics</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Collapse/Expand handled via hover; button removed */}
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              <AnimatePresence>
                {showLabels && (
                  <motion.span
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={labelVariants}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Desktop User Profile */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <AnimatePresence>
              {showLabels && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={labelVariants}
                  className="min-w-0 flex-1"
                >
                  <p className="text-slate-900 dark:text-white font-medium text-sm truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {showLabels && (
                <motion.span
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={labelVariants}
                  className="whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Spacer for desktop layout - dynamic width */}
      <motion.div 
        initial={{ width: 260 }}
        animate={{ width: isDesktopHovered ? 260 : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:block shrink-0" 
      />
    </>
  );
}

export default Sidebar;
