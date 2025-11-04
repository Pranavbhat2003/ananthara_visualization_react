import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children, sendMessage }) => {
  // View modes
  const [currentMode, setCurrentMode] = useState('loading'); // 'loading' | 'requirements' | 'canvas'

  // Project data
  const [projectName, setProjectName] = useState('');
  const [requirements, setRequirements] = useState({});
  const [ddd, setDdd] = useState({});
  const [frontendData, setFrontendData] = useState({});
  const [technicalArchitecture, setTechnicalArchitecture] = useState({});
  const [summary, setSummary] = useState('');

  // Canvas/Design state
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'

  // Interaction state
  const [interactions, setInteractions] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Load project data from WebSocket
  const loadProjectData = useCallback((data) => {
    if (data.project_name) setProjectName(data.project_name);
    if (data.requirements) setRequirements(data.requirements);
    if (data.ddd) setDdd(data.ddd);
    if (data.frontend_data) setFrontendData(data.frontend_data);
    if (data.technical_architecture) setTechnicalArchitecture(data.technical_architecture);
    if (data.summary) setSummary(data.summary);

    // Load pages and interactions
    if (data.frontend_data?.pages) {
      setPages(data.frontend_data.pages);
    }
    if (data.frontend_data?.interactions) {
      setInteractions(data.frontend_data.interactions);
    }
    if (data.currentPageId) {
      setCurrentPageId(data.currentPageId);
    }

    // If project is loaded, switch to requirements mode
    if (data.project_name) {
      setCurrentMode('requirements');
    }
  }, []);

  // Clear project data
  const clearProjectData = useCallback(() => {
    setProjectName('');
    setRequirements({});
    setDdd({});
    setFrontendData({});
    setTechnicalArchitecture({});
    setSummary('');
    setPages([]);
    setCurrentPageId(null);
    setSelectedComponent(null);
    setInteractions([]);
    setCurrentMode('loading');
  }, []);

  // Get current page
  const getCurrentPage = useCallback(() => {
    return pages.find(page => page.id === currentPageId);
  }, [pages, currentPageId]);

  // Add component to current page
  const addComponent = useCallback((component) => {
    if (!currentPageId) return;

    // Update local state immediately for responsive UI
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === currentPageId
          ? {
              ...page,
              components: [...(page.components || []), component]
            }
          : page
      )
    );

    // Send update to backend using canvas_edit format
    if (sendMessage) {
      setSaveStatus('saving');
      sendMessage('canvas_edit', {
        project_name: projectName,
        pageId: currentPageId,
        action: 'add_component',
        component: component
      });
      setTimeout(() => setSaveStatus('saved'), 500);
    }
  }, [currentPageId, sendMessage, projectName]);

  // Update component
  const updateComponent = useCallback((componentId, updates) => {
    if (!currentPageId) return;

    // Update local state immediately for responsive UI
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === currentPageId
          ? {
              ...page,
              components: (page.components || []).map(comp =>
                comp.id === componentId ? { ...comp, ...updates } : comp
              )
            }
          : page
      )
    );

    // Send update to backend using canvas_edit format
    if (sendMessage) {
      setSaveStatus('saving');
      sendMessage('canvas_edit', {
        project_name: projectName,
        pageId: currentPageId,
        action: 'update_component',
        component_id: componentId,
        updates: updates
      });
      setTimeout(() => setSaveStatus('saved'), 500);
    }
  }, [currentPageId, sendMessage, projectName]);

  // Delete component
  const deleteComponent = useCallback((componentId) => {
    if (!currentPageId) return;

    // Update local state immediately for responsive UI
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === currentPageId
          ? {
              ...page,
              components: (page.components || []).filter(comp => comp.id !== componentId)
            }
          : page
      )
    );

    // Send update to backend using canvas_edit format
    if (sendMessage) {
      setSaveStatus('saving');
      sendMessage('canvas_edit', {
        project_name: projectName,
        pageId: currentPageId,
        action: 'delete_component',
        component_id: componentId
      });
      setTimeout(() => setSaveStatus('saved'), 500);
    }

    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  }, [currentPageId, selectedComponent, sendMessage, projectName]);

  const value = {
    // Mode
    currentMode,
    setCurrentMode,

    // Project data
    projectName,
    requirements,
    ddd,
    frontendData,
    technicalArchitecture,
    summary,
    loadProjectData,
    clearProjectData,

    // Canvas/Design state
    pages,
    setPages,
    currentPageId,
    setCurrentPageId,
    selectedComponent,
    setSelectedComponent,
    zoom,
    setZoom,
    showGrid,
    setShowGrid,
    saveStatus,
    setSaveStatus,

    // Interaction state
    interactions,
    setInteractions,
    isPreviewMode,
    setIsPreviewMode,

    // Helpers
    getCurrentPage,
    addComponent,
    updateComponent,
    deleteComponent
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
