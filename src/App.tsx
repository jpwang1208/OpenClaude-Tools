import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { MCPMgmtPage } from './pages/MCPMgmtPage';
import { SkillsMgmtPage } from './pages/SkillsMgmtPage';
import { ModelsMgmtPage } from './pages/ModelsMgmtPage';
import { BackupListPage } from './pages/BackupListPage';
import { useSettingsStore } from './stores/settingsStore';
import './i18n';

function App() {
  const [activePage, setActivePage] = useState('mcp');
  const [activeTab, setActiveTab] = useState<'opencode' | 'claude'>('opencode');
  const { initializeTheme, theme } = useSettingsStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  const renderPage = () => {
    switch (activePage) {
      case 'mcp':
        return <MCPMgmtPage source={activeTab} />;
      case 'backup':
        return <BackupListPage source={activeTab} />;
      case 'skills':
        return <SkillsMgmtPage />;
      case 'models':
        return <ModelsMgmtPage />;
      default:
        return <MCPMgmtPage source={activeTab} />;
    }
  };

  return (
    <div className={`h-screen flex ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main 
          className={`flex-1 overflow-y-auto ${
            theme === 'light' 
              ? 'bg-slate-50' 
              : 'bg-slate-900'
          }`}
          style={{ height: 'calc(100vh - 64px - 32px)' }}
        >
          {renderPage()}
        </main>
        <StatusBar />
      </div>
    </div>
  );
}

export default App;