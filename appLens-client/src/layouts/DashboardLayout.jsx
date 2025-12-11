// DashboardLayout - Main layout wrapper for all dashboard pages
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

/**
 * DashboardLayout component wraps all authenticated dashboard pages
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title displayed in topbar
 * @param {string} props.subtitle - Optional subtitle
 */
function LayoutShell({ children, title, subtitle }) {
  const { desktopWidth } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div
        className="flex flex-col min-h-screen transition-[margin-left] duration-300 ease-out"
        style={{ marginLeft: desktopWidth }}
      >
        {/* Top Navigation Bar */}
        <Topbar title={title} subtitle={subtitle} />
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardLayout(props) {
  return (
    <SidebarProvider>
      <LayoutShell {...props} />
    </SidebarProvider>
  );
}

export default DashboardLayout;
