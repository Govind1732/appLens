// Sidebar context for sharing mobile toggle state
import { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopWidth, setDesktopWidth] = useState(0);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Desktop width setter (e.g., hover expand/collapse)
  const setDesktopExpanded = useCallback((expanded) => {
    setDesktopWidth(expanded ? 260 : 72);
  }, []);

  // Reset width for mobile layouts
  const resetDesktopWidth = useCallback(() => setDesktopWidth(0), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close, desktopWidth, setDesktopExpanded, resetDesktopWidth }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export default SidebarContext;
