import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import ComponentToolbar from '../components/CanvasComponents/ComponentToolbar';
import PropertiesPanel from '../components/CanvasComponents/PropertiesPanel';
import LayersPanel from '../components/CanvasComponents/LayersPanel';
import styles from './DesignCanvas.module.css';

const DesignCanvas = () => {
  const {
    pages,
    currentPageId,
    setCurrentPageId,
    getCurrentPage,
    selectedComponent,
    setSelectedComponent,
    updateComponent,
    deleteComponent,
    addComponent,
    zoom,
    setZoom,
    showGrid,
    setShowGrid
  } = useApp();

  const currentPage = getCurrentPage();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [showLayersPanel, setShowLayersPanel] = useState(true);

  // Auto-fit canvas to viewport on page change
  useEffect(() => {
    if (currentPage && containerRef.current && canvasRef.current) {
      const container = containerRef.current;
      const canvasWidth = currentPage.canvas?.width || 1400;
      const canvasHeight = currentPage.canvas?.height || 900;

      // Get container dimensions (accounting for padding)
      const containerWidth = container.clientWidth - 80; // 40px padding on each side
      const containerHeight = container.clientHeight - 80;

      // Calculate zoom to fit
      const zoomX = containerWidth / canvasWidth;
      const zoomY = containerHeight / canvasHeight;
      const fitZoom = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 100%

      // Set zoom to fit (with a small margin)
      const finalZoom = fitZoom * 0.95;
      setZoom(Math.max(0.25, Math.min(1, finalZoom))); // Clamp between 25% and 100%
    }
  }, [currentPageId, currentPage, setZoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected component
      if (e.key === 'Delete' && selectedComponent) {
        deleteComponent(selectedComponent.id);
      }
      // Deselect with Escape
      if (e.key === 'Escape') {
        setSelectedComponent(null);
      }
      // Undo with Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && historyIndex > 0) {
        e.preventDefault();
        setHistoryIndex(historyIndex - 1);
      }
      // Redo with Ctrl+Y
      if (e.ctrlKey && e.key === 'y' && historyIndex < history.length - 1) {
        e.preventDefault();
        setHistoryIndex(historyIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, deleteComponent, setSelectedComponent, historyIndex, history]);

  // Handle component selection
  const handleComponentClick = useCallback((e, component) => {
    e.stopPropagation();
    setSelectedComponent(component);
  }, [setSelectedComponent]);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setSelectedComponent(null);
    }
  }, [setSelectedComponent]);

  // Handle drag start
  const handleMouseDown = useCallback((e, component) => {
    if (e.button !== 0) return; // Only left mouse button
    e.stopPropagation();

    setSelectedComponent(component);
    setIsDragging(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom;

    setDragStart({
      x: (e.clientX - rect.left) / scale - (component.position?.x || 0),
      y: (e.clientY - rect.top) / scale - (component.position?.y || 0)
    });
  }, [setSelectedComponent, zoom]);

  // Handle resize start
  const handleResizeStart = useCallback((e, component, handle) => {
    e.stopPropagation();
    setSelectedComponent(component);
    setIsResizing(true);
    setResizeHandle(handle);

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom;

    setDragStart({
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
      startWidth: component.props?.width || 100,
      startHeight: component.props?.height || 40,
      startX: component.position?.x || 0,
      startY: component.position?.y || 0
    });
  }, [setSelectedComponent, zoom]);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!canvasRef.current || !selectedComponent) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoom;
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      if (isDragging) {
        const newX = Math.max(0, mouseX - dragStart.x);
        const newY = Math.max(0, mouseY - dragStart.y);

        // Snap to grid if enabled
        const snapSize = showGrid ? 20 : 1;
        const snappedX = Math.round(newX / snapSize) * snapSize;
        const snappedY = Math.round(newY / snapSize) * snapSize;

        updateComponent(selectedComponent.id, {
          position: { x: snappedX, y: snappedY }
        });
      } else if (isResizing && resizeHandle) {
        const deltaX = mouseX - dragStart.x;
        const deltaY = mouseY - dragStart.y;

        let newWidth = dragStart.startWidth;
        let newHeight = dragStart.startHeight;
        let newX = dragStart.startX;
        let newY = dragStart.startY;

        switch (resizeHandle) {
          case 'se': // Bottom-right
            newWidth = Math.max(50, dragStart.startWidth + deltaX);
            newHeight = Math.max(30, dragStart.startHeight + deltaY);
            break;
          case 'sw': // Bottom-left
            newWidth = Math.max(50, dragStart.startWidth - deltaX);
            newHeight = Math.max(30, dragStart.startHeight + deltaY);
            newX = dragStart.startX + (dragStart.startWidth - newWidth);
            break;
          case 'ne': // Top-right
            newWidth = Math.max(50, dragStart.startWidth + deltaX);
            newHeight = Math.max(30, dragStart.startHeight - deltaY);
            newY = dragStart.startY + (dragStart.startHeight - newHeight);
            break;
          case 'nw': // Top-left
            newWidth = Math.max(50, dragStart.startWidth - deltaX);
            newHeight = Math.max(30, dragStart.startHeight - deltaY);
            newX = dragStart.startX + (dragStart.startWidth - newWidth);
            newY = dragStart.startY + (dragStart.startHeight - newHeight);
            break;
        }

        updateComponent(selectedComponent.id, {
          position: { x: newX, y: newY },
          props: {
            ...selectedComponent.props,
            width: newWidth,
            height: newHeight
          }
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, selectedComponent, dragStart, updateComponent, zoom, showGrid, resizeHandle]);

  // Add new component
  const handleAddComponent = useCallback((type) => {
    const newComponent = {
      id: `comp-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      props: {
        width: type === 'button' ? 120 : type === 'input' ? 200 : 150,
        height: type === 'container' ? 200 : type === 'input' ? 40 : 50,
        text: type === 'button' ? 'Button' : type === 'text' ? 'Text Label' : '',
        placeholder: type === 'input' ? 'Enter text...' : '',
        backgroundColor: type === 'button' ? '#667eea' : type === 'container' ? '#f7fafc' : '#ffffff',
        color: type === 'button' ? '#ffffff' : '#2d3748',
        fontSize: '14px',
        fontWeight: type === 'button' ? '600' : 'normal',
        borderRadius: type === 'button' ? '6px' : type === 'input' ? '4px' : '0px',
        border: type === 'container' ? '2px dashed #cbd5e0' : '1px solid #e2e8f0'
      }
    };

    addComponent(newComponent);
    setSelectedComponent(newComponent);
  }, [addComponent, setSelectedComponent]);

  // Zoom controls
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.25));
  const handleZoomReset = () => setZoom(1);

  const handleZoomFit = useCallback(() => {
    if (currentPage && containerRef.current && canvasRef.current) {
      const container = containerRef.current;
      const canvasWidth = currentPage.canvas?.width || 1400;
      const canvasHeight = currentPage.canvas?.height || 900;

      // Get container dimensions (accounting for padding)
      const containerWidth = container.clientWidth - 80;
      const containerHeight = container.clientHeight - 80;

      // Calculate zoom to fit
      const zoomX = containerWidth / canvasWidth;
      const zoomY = containerHeight / canvasHeight;
      const fitZoom = Math.min(zoomX, zoomY, 1);

      // Set zoom to fit (with a small margin)
      const finalZoom = fitZoom * 0.95;
      setZoom(Math.max(0.25, Math.min(1, finalZoom)));
    }
  }, [currentPage, setZoom]);

  return (
    <div className={styles.container}>
      {/* Component Toolbar */}
      <ComponentToolbar
        onAddComponent={handleAddComponent}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onZoomFit={handleZoomFit}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showPropertiesPanel={showPropertiesPanel}
        onTogglePropertiesPanel={() => setShowPropertiesPanel(!showPropertiesPanel)}
        showLayersPanel={showLayersPanel}
        onToggleLayersPanel={() => setShowLayersPanel(!showLayersPanel)}
        currentPageId={currentPageId}
        pages={pages}
        onPageChange={setCurrentPageId}
      />

      {/* Main Canvas Area */}
      <div className={styles.mainArea}>
        {/* Layers Panel */}
        {showLayersPanel && (
          <LayersPanel
            components={currentPage?.components || []}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onDeleteComponent={deleteComponent}
          />
        )}

        {/* Canvas */}
        <div className={styles.canvasWrapper}>
          <div ref={containerRef} className={styles.canvasContainer}>
            <div
              ref={canvasRef}
              className={`${styles.canvas} ${showGrid ? styles.grid : ''}`}
              style={{
                transform: `scale(${zoom})`,
                width: currentPage?.canvas?.width || 1400,
                height: currentPage?.canvas?.height || 900,
                backgroundColor: currentPage?.canvas?.backgroundColor || '#ffffff'
              }}
              onClick={handleCanvasClick}
            >
              {currentPage?.components?.map((component, index) => (
                <div
                  key={component.id}
                  className={`${styles.component} ${
                    selectedComponent?.id === component.id ? styles.selected : ''
                  }`}
                  style={{
                    position: 'absolute',
                    left: component.position?.x || 0,
                    top: component.position?.y || 0,
                    width: component.props?.width || 100,
                    height: component.props?.height || 40,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    zIndex: selectedComponent?.id === component.id ? 100 : index + 1
                  }}
                  onClick={(e) => handleComponentClick(e, component)}
                  onMouseDown={(e) => handleMouseDown(e, component)}
                >
                  {/* Component Label */}
                  <div style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '0',
                    backgroundColor: '#667eea',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '4px 4px 0 0',
                    fontSize: '11px',
                    fontWeight: '600',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  className={styles.componentLabel}
                  >
                    {component.type}
                  </div>

                  {renderComponent(component)}

                  {/* Resize Handles */}
                  {selectedComponent?.id === component.id && (
                    <>
                      <div
                        className={`${styles.resizeHandle} ${styles.nw}`}
                        onMouseDown={(e) => handleResizeStart(e, component, 'nw')}
                      />
                      <div
                        className={`${styles.resizeHandle} ${styles.ne}`}
                        onMouseDown={(e) => handleResizeStart(e, component, 'ne')}
                      />
                      <div
                        className={`${styles.resizeHandle} ${styles.sw}`}
                        onMouseDown={(e) => handleResizeStart(e, component, 'sw')}
                      />
                      <div
                        className={`${styles.resizeHandle} ${styles.se}`}
                        onMouseDown={(e) => handleResizeStart(e, component, 'se')}
                      />
                    </>
                  )}
                </div>
              ))}

              {!currentPage && (
                <div className={styles.emptyCanvas}>
                  <div className={styles.emptyIcon}>🎨</div>
                  <h3>No Page Selected</h3>
                  <p>Select a page from the dropdown above or create a new one to start designing</p>
                </div>
              )}

              {currentPage && (!currentPage.components || currentPage.components.length === 0) && (
                <div className={styles.emptyCanvas}>
                  <div className={styles.emptyIcon}>✨</div>
                  <h3>Canvas is Empty</h3>
                  <p>Click on the toolbar above to add components to your design</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {showPropertiesPanel && (
          <PropertiesPanel
            selectedComponent={selectedComponent}
            onUpdateComponent={updateComponent}
          />
        )}
      </div>
    </div>
  );
};

// Helper function to render components
const renderComponent = (component) => {
  const baseStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: component.props?.backgroundColor || '#ffffff',
    color: component.props?.color || '#2d3748',
    fontSize: component.props?.fontSize || '14px',
    fontWeight: component.props?.fontWeight || 'normal',
    borderRadius: component.props?.borderRadius || '4px',
    border: component.props?.border || '1px solid #e2e8f0',
    padding: '8px',
    boxSizing: 'border-box',
    pointerEvents: 'none',
    userSelect: 'none',
    overflow: 'hidden'
  };

  switch (component.type) {
    case 'Header':
      return (
        <div style={{
          ...baseStyle,
          justifyContent: 'space-between',
          padding: '0 40px',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>🛍️</div>
            <span style={{ fontWeight: 'bold', fontSize: '20px' }}>Vijay Store</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            {component.props?.navigation?.map((item, i) => (
              <span key={i} style={{ opacity: 0.9 }}>{item}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <span style={{ fontSize: '20px' }}>👤</span>
          </div>
        </div>
      );

    case 'HeroSection':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '24px',
          border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
          }} />
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: 0, zIndex: 1, textAlign: 'center' }}>
            {component.props?.title}
          </h1>
          <p style={{ fontSize: '20px', margin: 0, zIndex: 1, opacity: 0.95, textAlign: 'center' }}>
            {component.props?.subtitle}
          </p>
          <button style={{
            padding: '16px 48px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#ffffff',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 1,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            {component.props?.ctaButton || 'Get Started'}
          </button>
        </div>
      );

    case 'FeaturedProducts':
      const cols = component.props?.columns || 4;
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '24px',
          padding: '40px',
          alignItems: 'stretch'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#2d3748' }}>
            {component.props?.title || 'Featured Products'}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '20px',
            flex: 1
          }}>
            {Array.from({ length: component.props?.limit || 8 }).map((_, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  width: '100%',
                  height: '140px',
                  backgroundColor: '#edf2f7',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px'
                }}>📦</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>Product {i + 1}</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#667eea' }}>$99.99</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'NewsletterSection':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '20px',
          border: 'none'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
            {component.props?.title}
          </h2>
          <p style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>
            {component.props?.subtitle}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <div style={{
              flex: 1,
              maxWidth: '400px',
              height: '48px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <span style={{ opacity: 0.7 }}>Enter your email...</span>
            </div>
            <button style={{
              padding: '0 32px',
              height: '48px',
              backgroundColor: '#ffffff',
              color: '#4c51bf',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Subscribe
            </button>
          </div>
        </div>
      );

    case 'Footer':
      return (
        <div style={{
          ...baseStyle,
          justifyContent: 'space-between',
          padding: '40px',
          border: 'none',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>🛍️</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>© 2024 Vijay Store</div>
          </div>
          <div style={{ display: 'flex', gap: '60px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Company</div>
              {component.props?.links?.map((link, i) => (
                <div key={i} style={{ fontSize: '14px', opacity: 0.7 }}>{link}</div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Follow Us</div>
              {component.props?.socialMedia?.map((social, i) => (
                <div key={i} style={{ fontSize: '14px', opacity: 0.7 }}>{social}</div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'Breadcrumb':
      return (
        <div style={{
          ...baseStyle,
          justifyContent: 'flex-start',
          padding: '0 40px',
          gap: '8px'
        }}>
          {component.props?.items?.map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              {i > 0 && <span style={{ opacity: 0.5 }}>/</span>}
              <span style={{ opacity: i === component.props.items.length - 1 ? 1 : 0.6 }}>{item}</span>
            </span>
          ))}
        </div>
      );

    case 'FilterSidebar':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '24px',
          padding: '24px',
          alignItems: 'stretch',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Filters</h3>
          {component.props?.filters?.map((filter, i) => (
            <div key={i} style={{
              padding: '12px',
              backgroundColor: '#f7fafc',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {filter}
            </div>
          ))}
        </div>
      );

    case 'ProductGrid':
      const gridCols = component.props?.columns || 4;
      const productCount = component.props?.productsCount || 12;
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '20px',
          padding: '20px',
          alignItems: 'stretch'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 4px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{productCount} Products</span>
            <select style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              backgroundColor: '#ffffff'
            }}>
              <option>Sort by</option>
            </select>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: '16px',
            flex: 1
          }}>
            {Array.from({ length: productCount }).map((_, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  width: '100%',
                  height: '120px',
                  backgroundColor: '#f7fafc',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px'
                }}>📦</div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>Product Name</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#667eea' }}>$49.99</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'Pagination':
      const totalPages = component.props?.totalPages || 8;
      const currentPage = component.props?.currentPage || 1;
      return (
        <div style={{
          ...baseStyle,
          gap: '8px'
        }}>
          <button style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            fontSize: '14px'
          }}>Previous</button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
            <button key={i} style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: i + 1 === currentPage ? '#667eea' : '#ffffff',
              color: i + 1 === currentPage ? '#ffffff' : '#2d3748',
              fontSize: '14px',
              minWidth: '36px'
            }}>{i + 1}</button>
          ))}
          <button style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            fontSize: '14px'
          }}>Next</button>
        </div>
      );

    case 'ProductImage':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <div style={{
            flex: 1,
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '80px'
          }}>📷</div>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#edf2f7',
                borderRadius: '6px',
                border: i === 0 ? '2px solid #667eea' : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>📷</div>
            ))}
          </div>
        </div>
      );

    case 'ProductInfo':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '20px',
          padding: '20px',
          alignItems: 'flex-start',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Premium Product Name</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>$129.99</span>
            <span style={{ fontSize: '18px', textDecoration: 'line-through', opacity: 0.5 }}>$159.99</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f6ad55' }}>⭐⭐⭐⭐⭐</span>
            <span style={{ fontSize: '14px', opacity: 0.7 }}>(128 reviews)</span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.8, margin: 0 }}>
            This is a high-quality product with amazing features. Perfect for your needs with premium materials and excellent craftsmanship.
          </p>
          <div style={{
            padding: '12px',
            backgroundColor: '#f0fff4',
            border: '1px solid #9ae6b4',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#22543d',
            width: '100%'
          }}>✓ In Stock - Ships within 24 hours</div>
          <button style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#667eea',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>Add to Cart</button>
        </div>
      );

    case 'ProductTabs':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          padding: '24px',
          alignItems: 'stretch',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', gap: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
            {component.props?.tabs?.map((tab, i) => (
              <div key={i} style={{
                fontSize: '16px',
                fontWeight: i === 0 ? 'bold' : 'normal',
                color: i === 0 ? '#667eea' : '#718096',
                paddingBottom: '12px',
                borderBottom: i === 0 ? '2px solid #667eea' : 'none',
                marginBottom: '-14px'
              }}>{tab}</div>
            ))}
          </div>
          <div style={{ padding: '24px 0', fontSize: '14px', lineHeight: '1.8', opacity: 0.8 }}>
            Detailed information about the product would appear here. This includes specifications, features, and other relevant details.
          </div>
        </div>
      );

    case 'ProductReviews':
      const reviewCount = component.props?.reviewCount || 5;
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '20px',
          padding: '24px',
          alignItems: 'stretch',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Customer Reviews</h3>
          {Array.from({ length: reviewCount }).map((_, i) => (
            <div key={i} style={{
              padding: '16px',
              backgroundColor: '#f7fafc',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Customer {i + 1}</span>
                <span style={{ color: '#f6ad55', fontSize: '14px' }}>⭐⭐⭐⭐⭐</span>
              </div>
              <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>
                Great product! Highly recommended. Very satisfied with the quality.
              </p>
            </div>
          ))}
        </div>
      );

    case 'RelatedProducts':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '20px',
          padding: '24px',
          alignItems: 'stretch'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            {component.props?.title || 'Related Products'}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${component.props?.limit || 4}, 1fr)`,
            gap: '16px'
          }}>
            {Array.from({ length: component.props?.limit || 4 }).map((_, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  width: '100%',
                  height: '140px',
                  backgroundColor: '#f7fafc',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px'
                }}>📦</div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>Related Product</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#667eea' }}>$79.99</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'PageTitle':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '4px',
          padding: '0 40px',
          alignItems: 'flex-start',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            {component.props?.title}
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
            {component.props?.subtitle}
          </p>
        </div>
      );

    case 'CartItems':
      const itemsCount = component.props?.itemsCount || 3;
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          alignItems: 'stretch',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          {Array.from({ length: itemsCount }).map((_, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#f7fafc',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#edf2f7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                flexShrink: 0
              }}>📦</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Product Name {i + 1}</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Size: M | Color: Blue</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#667eea' }}>$99.99</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', justifyContent: 'center' }}>
                <select style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px'
                }}>
                  <option>Qty: 1</option>
                </select>
                <span style={{ fontSize: '18px', cursor: 'pointer' }}>🗑️</span>
              </div>
            </div>
          ))}
        </div>
      );

    case 'CartSummary':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          alignItems: 'stretch',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            Order Summary
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span>Subtotal</span>
            <span>$299.97</span>
          </div>
          {component.props?.showShipping && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Shipping</span>
              <span>$9.99</span>
            </div>
          )}
          {component.props?.showTax && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Tax</span>
              <span>$24.00</span>
            </div>
          )}
          {component.props?.couponCode && (
            <div style={{
              padding: '12px',
              backgroundColor: '#f7fafc',
              borderRadius: '6px',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                style={{
                  flex: 1,
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontSize: '13px'
                }}
                placeholder="Coupon code"
              />
              <button style={{
                padding: '6px 16px',
                backgroundColor: '#667eea',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600'
              }}>Apply</button>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: 'bold',
            paddingTop: '16px',
            borderTop: '2px solid #e2e8f0',
            marginTop: '8px'
          }}>
            <span>Total</span>
            <span style={{ color: '#667eea' }}>$333.96</span>
          </div>
          <button style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#667eea',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '8px'
          }}>Proceed to Checkout</button>
        </div>
      );

    case 'ProfileSidebar':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '8px',
          padding: '20px',
          alignItems: 'stretch',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          {component.props?.sections?.map((section, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              backgroundColor: section === component.props?.activeSection ? '#667eea' : '#f7fafc',
              color: section === component.props?.activeSection ? '#ffffff' : '#2d3748',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: section === component.props?.activeSection ? '600' : 'normal'
            }}>
              {section}
            </div>
          ))}
        </div>
      );

    case 'ProfileContent':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'column',
          gap: '24px',
          padding: '32px',
          alignItems: 'stretch',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Personal Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {['First Name', 'Last Name', 'Email', 'Phone'].map((field, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{field}</label>
                <input style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: component.props?.editable ? '#ffffff' : '#f7fafc'
                }} />
              </div>
            ))}
          </div>
          <button style={{
            alignSelf: 'flex-start',
            padding: '12px 32px',
            backgroundColor: '#667eea',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            marginTop: '8px'
          }}>Save Changes</button>
        </div>
      );

    case 'button':
      return (
        <button style={baseStyle}>
          {component.props?.text || 'Button'}
        </button>
      );

    case 'input':
      return (
        <input
          type="text"
          placeholder={component.props?.placeholder || 'Input'}
          style={baseStyle}
          readOnly
        />
      );

    case 'text':
      return (
        <div style={{...baseStyle, textAlign: component.props?.textAlign || 'center'}}>
          {component.props?.text || 'Text Label'}
        </div>
      );

    case 'image':
      return (
        <div style={{
          ...baseStyle,
          backgroundColor: '#edf2f7',
          border: '2px solid #e2e8f0',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '32px' }}>🖼️</span>
          <span style={{ fontSize: '12px', color: '#718096' }}>Image Placeholder</span>
        </div>
      );

    case 'container':
      return (
        <div style={{
          ...baseStyle,
          border: '2px dashed #cbd5e0',
          backgroundColor: component.props?.backgroundColor || '#f7fafc',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: '16px'
        }}>
          <span style={{ fontSize: '12px', color: '#a0aec0' }}>Container</span>
        </div>
      );

    default:
      return (
        <div style={{
          ...baseStyle,
          border: '2px dashed #e2e8f0',
          opacity: 0.6
        }}>
          <span style={{ fontSize: '12px' }}>{component.type}</span>
        </div>
      );
  }
};

export default DesignCanvas;
