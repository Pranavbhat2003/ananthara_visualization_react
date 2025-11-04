import { useApp } from '../../contexts/AppContext';
import styles from './ComponentToolbar.module.css';

const ComponentToolbar = ({
  onAddComponent,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  showGrid,
  onToggleGrid,
  showPropertiesPanel,
  onTogglePropertiesPanel,
  showLayersPanel,
  onToggleLayersPanel,
  currentPageId,
  pages,
  onPageChange
}) => {
  const { saveStatus } = useApp();

  return (
    <div className={styles.toolbar}>
      {/* Page Selector Section */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Page</div>
        {pages.length > 0 && (
          <select
            className={styles.pageSelect}
            value={currentPageId || ''}
            onChange={(e) => onPageChange(e.target.value)}
          >
            {pages.map(page => (
              <option key={page.id} value={page.id}>
                {page.name} ({(page.components || []).length} components)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.divider} />

      {/* Zoom Controls Section */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Zoom</div>
        <div className={styles.zoomControls}>
          <button
            className={styles.controlBtn}
            onClick={onZoomOut}
            title="Zoom Out (Ctrl + -)"
            disabled={zoom <= 0.25}
          >
            <span className={styles.controlIcon}>🔍−</span>
          </button>
          <button
            className={styles.zoomDisplay}
            onClick={onZoomReset}
            title="Reset to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            className={styles.controlBtn}
            onClick={onZoomIn}
            title="Zoom In (Ctrl + +)"
            disabled={zoom >= 2}
          >
            <span className={styles.controlIcon}>🔍+</span>
          </button>
          <button
            className={styles.controlBtn}
            onClick={onZoomFit}
            title="Fit to Screen"
            style={{ width: 'auto', padding: '0 12px', fontSize: '11px', fontWeight: '700' }}
          >
            <span>FIT</span>
          </button>
        </div>
      </div>

      <div className={styles.divider} />

      {/* View Controls Section */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>View</div>
        <div className={styles.viewControls}>
          <button
            className={`${styles.toggleBtn} ${showGrid ? styles.active : ''}`}
            onClick={onToggleGrid}
            title="Toggle Grid (Ctrl + G)"
          >
            <span className={styles.toggleIcon}>⊞</span>
            <span className={styles.toggleLabel}>Grid</span>
          </button>
          <button
            className={`${styles.toggleBtn} ${showLayersPanel ? styles.active : ''}`}
            onClick={onToggleLayersPanel}
            title="Toggle Layers Panel (Ctrl + L)"
          >
            <span className={styles.toggleIcon}>📋</span>
            <span className={styles.toggleLabel}>Layers</span>
          </button>
          <button
            className={`${styles.toggleBtn} ${showPropertiesPanel ? styles.active : ''}`}
            onClick={onTogglePropertiesPanel}
            title="Toggle Properties Panel (Ctrl + P)"
          >
            <span className={styles.toggleIcon}>⚙️</span>
            <span className={styles.toggleLabel}>Properties</span>
          </button>
        </div>
      </div>

      <div className={styles.spacer} />

      {/* Save Status */}
      <div className={styles.section}>
        <div className={styles.saveStatus}>
          {saveStatus === 'saving' && (
            <div className={styles.statusIndicator}>
              <div className={styles.spinner} />
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className={`${styles.statusIndicator} ${styles.saved}`}>
              <span>✓</span>
              <span>Saved</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className={`${styles.statusIndicator} ${styles.error}`}>
              <span>⚠</span>
              <span>Error</span>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className={styles.section}>
        <button className={styles.helpBtn} title="Keyboard Shortcuts">
          <span>⌨️</span>
          <div className={styles.helpTooltip}>
            <div className={styles.helpTitle}>Keyboard Shortcuts</div>
            <div className={styles.helpItem}>
              <kbd>Delete</kbd> <span>Delete selected</span>
            </div>
            <div className={styles.helpItem}>
              <kbd>Esc</kbd> <span>Deselect</span>
            </div>
            <div className={styles.helpItem}>
              <kbd>Ctrl+Z</kbd> <span>Undo</span>
            </div>
            <div className={styles.helpItem}>
              <kbd>Ctrl+Y</kbd> <span>Redo</span>
            </div>
            <div className={styles.helpItem}>
              <kbd>Arrow Keys</kbd> <span>Move 10px</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ComponentToolbar;
