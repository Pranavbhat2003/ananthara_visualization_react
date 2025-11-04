import { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import useWebSocket from './hooks/useWebSocket';
import Header from './components/layout/Header';
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import RequirementsView from './pages/RequirementsView';
import DomainDrivenDesign from './pages/DomainDrivenDesign';
import TechnicalArchitecture from './pages/TechnicalArchitecture';
import DesignCanvas from './pages/DesignCanvas';
import Toolbar from './components/Toolbar/Toolbar';
import './App.css';

const AppContent = () => {
  const { currentMode, setCurrentMode, loadProjectData, clearProjectData } = useApp();
  const { connectionStatus, projectData, lastMessage, sendMessage, reconnect } = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log('[App] Received message:', lastMessage.type);

      switch (lastMessage.type) {
        case 'project_initialized':
        case 'project_switched':
        case 'files_updated':
          loadProjectData(lastMessage.data);
          break;

        case 'canvas_mode_ready':
          loadProjectData(lastMessage.data);
          setCurrentMode('canvas');
          break;

        case 'project_deleted':
          clearProjectData();
          break;

        case 'page_added':
        case 'page_deleted':
        case 'page_renamed':
        case 'page_duplicated':
        case 'canvas_updated':
          // These are handled in the WebSocket hook
          break;

        default:
          break;
      }
    }
  }, [lastMessage, loadProjectData, clearProjectData, setCurrentMode]);

  // Update mode when connection is established
  useEffect(() => {
    if (connectionStatus === 'connected' && !projectData) {
      setCurrentMode('loading');
    }
  }, [connectionStatus, projectData, setCurrentMode]);

  // Handle refresh
  const handleRefresh = () => {
    sendMessage('request_files', {
      project_name: projectData?.project_name || ''
    });
  };

  // Handle request canvas mode
  const handleRequestCanvas = () => {
    sendMessage('request_canvas_mode', {
      project_name: projectData?.project_name || ''
    });
  };

  // Render based on current mode
  const renderContent = () => {
    if (connectionStatus === 'connecting' || currentMode === 'loading') {
      return <LoadingSpinner message="Connecting to server..." />;
    }

    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      return (
        <LoadingSpinner message="Connection lost. Please reconnect." />
      );
    }

    switch (currentMode) {
      case 'requirements':
        return <RequirementsView onRefresh={handleRefresh} />;

      case 'ddd':
        return <DomainDrivenDesign onRefresh={handleRefresh} />;

      case 'technical':
        return <TechnicalArchitecture onRefresh={handleRefresh} />;

      case 'canvas':
        return (
          <>
            <Toolbar />
            <DesignCanvas onRequestCanvas={handleRequestCanvas} />
          </>
        );

      default:
        return <LoadingSpinner message="Initializing..." />;
    }
  };

  return (
    <div className="app">
      <Header
        connectionStatus={connectionStatus}
        onReconnect={reconnect}
      />
      <MainLayout>
        {renderContent()}
      </MainLayout>
    </div>
  );
};

function App() {
  const { sendMessage } = useWebSocket();

  return (
    <AppProvider sendMessage={sendMessage}>
      <AppContent />
    </AppProvider>
  );
}

export default App;
