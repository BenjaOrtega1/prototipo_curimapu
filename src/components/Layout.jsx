import { useState } from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-shell__content">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
