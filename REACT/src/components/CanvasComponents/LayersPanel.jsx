import styles from './LayersPanel.module.css';

const LayersPanel = ({ components, selectedComponent, onSelectComponent, onDeleteComponent }) => {
  const getComponentIcon = (type) => {
    switch (type) {
      case 'button':
        return '🔘';
      case 'input':
        return '📝';
      case 'text':
        return '📄';
      case 'image':
        return '🖼️';
      case 'container':
        return '📦';
      default:
        return '⚡';
    }
  };

  const getComponentLabel = (component) => {
    if (component.props?.text) {
      return `${component.type}: "${component.props.text.substring(0, 20)}${component.props.text.length > 20 ? '...' : ''}"`;
    }
    if (component.props?.placeholder) {
      return `${component.type}: "${component.props.placeholder.substring(0, 20)}${component.props.placeholder.length > 20 ? '...' : ''}"`;
    }
    return component.type;
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Layers</h3>
        <span className={styles.count}>{components.length}</span>
      </div>

      <div className={styles.content}>
        {components.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p>No components yet</p>
            <span className={styles.emptyHint}>Add components from the toolbar</span>
          </div>
        ) : (
          <div className={styles.layersList}>
            {components.map((component, index) => (
              <div
                key={component.id}
                className={`${styles.layerItem} ${
                  selectedComponent?.id === component.id ? styles.selected : ''
                }`}
                onClick={() => onSelectComponent(component)}
              >
                <div className={styles.layerIcon}>
                  {getComponentIcon(component.type)}
                </div>

                <div className={styles.layerInfo}>
                  <div className={styles.layerName}>
                    {getComponentLabel(component)}
                  </div>
                  <div className={styles.layerMeta}>
                    <span className={styles.layerId}>#{component.id.split('-')[1]}</span>
                    <span className={styles.layerPosition}>
                      ({Math.round(component.position?.x || 0)}, {Math.round(component.position?.y || 0)})
                    </span>
                  </div>
                </div>

                <div className={styles.layerActions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteComponent(component.id);
                    }}
                    title="Delete component"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {components.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.legendIcon}>🔘</span> Button
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendIcon}>📝</span> Input
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendIcon}>📄</span> Text
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendIcon}>🖼️</span> Image
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendIcon}>📦</span> Container
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayersPanel;
