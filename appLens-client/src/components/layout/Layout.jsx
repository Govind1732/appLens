// Main layout component for AppLens dashboard
import { SidebarProvider } from '../../context/SidebarContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children, title, subtitle }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        
        {/* Main content */}
        <div className="lg:ml-[260px] flex flex-col min-h-screen">
          {/* Topbar with hamburger menu */}
          <Topbar title={title} subtitle={subtitle} />
          
          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
