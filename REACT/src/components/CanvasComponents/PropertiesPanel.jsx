import { useState, useEffect } from 'react';
import styles from './PropertiesPanel.module.css';

const PropertiesPanel = ({ selectedComponent, onUpdateComponent }) => {
  const [localProps, setLocalProps] = useState({});

  // Update local state when component selection changes
  useEffect(() => {
    if (selectedComponent) {
      setLocalProps({
        ...selectedComponent.props,
        x: selectedComponent.position?.x || 0,
        y: selectedComponent.position?.y || 0
      });
    }
  }, [selectedComponent]);

  if (!selectedComponent) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Properties</h3>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (property, value) => {
    const newProps = { ...localProps, [property]: value };
    setLocalProps(newProps);

    if (property === 'x' || property === 'y') {
      onUpdateComponent(selectedComponent.id, {
        position: {
          x: property === 'x' ? parseFloat(value) || 0 : selectedComponent.position?.x || 0,
          y: property === 'y' ? parseFloat(value) || 0 : selectedComponent.position?.y || 0
        }
      });
    } else {
      onUpdateComponent(selectedComponent.id, {
        props: {
          ...selectedComponent.props,
          [property]: value
        }
      });
    }
  };

  const handleStyleChange = (property, value) => {
    onUpdateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [property]: value
      }
    });
    setLocalProps({ ...localProps, [property]: value });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Properties</h3>
        <span className={styles.componentType}>{selectedComponent.type}</span>
      </div>

      <div className={styles.content}>
        {/* Position & Size */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Position & Size</h4>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>X</label>
              <input
                type="number"
                value={Math.round(localProps.x || 0)}
                onChange={(e) => handleChange('x', e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>Y</label>
              <input
                type="number"
                value={Math.round(localProps.y || 0)}
                onChange={(e) => handleChange('y', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Width</label>
              <input
                type="number"
                value={Math.round(localProps.width || 100)}
                onChange={(e) => handleStyleChange('width', parseFloat(e.target.value) || 100)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>Height</label>
              <input
                type="number"
                value={Math.round(localProps.height || 40)}
                onChange={(e) => handleStyleChange('height', parseFloat(e.target.value) || 40)}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {(selectedComponent.type === 'button' || selectedComponent.type === 'text') && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Content</h4>
            <div className={styles.field}>
              <label>Text</label>
              <input
                type="text"
                value={localProps.text || ''}
                onChange={(e) => handleStyleChange('text', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        )}

        {selectedComponent.type === 'input' && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Content</h4>
            <div className={styles.field}>
              <label>Placeholder</label>
              <input
                type="text"
                value={localProps.placeholder || ''}
                onChange={(e) => handleStyleChange('placeholder', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        )}

        {/* Appearance */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Appearance</h4>

          <div className={styles.field}>
            <label>Background Color</label>
            <div className={styles.colorField}>
              <input
                type="color"
                value={localProps.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className={styles.colorInput}
              />
              <input
                type="text"
                value={localProps.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className={styles.input}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Text Color</label>
            <div className={styles.colorField}>
              <input
                type="color"
                value={localProps.color || '#000000'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className={styles.colorInput}
              />
              <input
                type="text"
                value={localProps.color || '#000000'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className={styles.input}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Border</label>
            <input
              type="text"
              value={localProps.border || '1px solid #e2e8f0'}
              onChange={(e) => handleStyleChange('border', e.target.value)}
              className={styles.input}
              placeholder="1px solid #000"
            />
          </div>

          <div className={styles.field}>
            <label>Border Radius</label>
            <input
              type="text"
              value={localProps.borderRadius || '0px'}
              onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
              className={styles.input}
              placeholder="0px"
            />
          </div>
        </div>

        {/* Typography */}
        {(selectedComponent.type === 'button' || selectedComponent.type === 'text' || selectedComponent.type === 'input') && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Typography</h4>

            <div className={styles.field}>
              <label>Font Size</label>
              <input
                type="text"
                value={localProps.fontSize || '14px'}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                className={styles.input}
                placeholder="14px"
              />
            </div>

            <div className={styles.field}>
              <label>Font Weight</label>
              <select
                value={localProps.fontWeight || 'normal'}
                onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                className={styles.select}
              >
                <option value="300">Light (300)</option>
                <option value="normal">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi-Bold (600)</option>
                <option value="bold">Bold (700)</option>
                <option value="800">Extra-Bold (800)</option>
              </select>
            </div>

            {selectedComponent.type === 'text' && (
              <div className={styles.field}>
                <label>Text Align</label>
                <select
                  value={localProps.textAlign || 'center'}
                  onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                  className={styles.select}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Component Info */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Component Info</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>ID:</span>
              <span className={styles.infoValue}>{selectedComponent.id}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Type:</span>
              <span className={styles.infoValue}>{selectedComponent.type}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Quick Actions</h4>
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={() => {
                const newY = Math.max(0, (selectedComponent.position?.y || 0) - 10);
                onUpdateComponent(selectedComponent.id, {
                  position: { ...selectedComponent.position, y: newY }
                });
              }}
            >
              ↑ Move Up
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => {
                const newY = (selectedComponent.position?.y || 0) + 10;
                onUpdateComponent(selectedComponent.id, {
                  position: { ...selectedComponent.position, y: newY }
                });
              }}
            >
              ↓ Move Down
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => {
                const newX = Math.max(0, (selectedComponent.position?.x || 0) - 10);
                onUpdateComponent(selectedComponent.id, {
                  position: { ...selectedComponent.position, x: newX }
                });
              }}
            >
              ← Move Left
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => {
                const newX = (selectedComponent.position?.x || 0) + 10;
                onUpdateComponent(selectedComponent.id, {
                  position: { ...selectedComponent.position, x: newX }
                });
              }}
            >
              → Move Right
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
