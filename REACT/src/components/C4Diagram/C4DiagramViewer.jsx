import { useState } from 'react';
import C4DiagramRenderer from './C4DiagramRenderer';
import styles from './C4DiagramViewer.module.css';

const C4DiagramViewer = ({ c4Data }) => {
  const [selectedViewType, setSelectedViewType] = useState('landscape');
  const [selectedView, setSelectedView] = useState(null);

  // Filter states for different element types
  const [filters, setFilters] = useState({
    person: true,
    softwareSystem: true,
    container: true,
    component: true,
    database: true,
    external: true,
    synchronous: true,
    asynchronous: true
  });

  const toggleFilter = (filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  if (!c4Data || !c4Data.views) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📊</div>
        <h3>No C4 Diagrams Available</h3>
        <p>Architecture diagrams will appear here once the technical architecture is defined.</p>
      </div>
    );
  }

  const views = c4Data.views;

  // Get available views
  const viewTypes = [
    { key: 'landscape', label: 'System Landscape', views: views.systemLandscapeViews || [] },
    { key: 'context', label: 'System Context', views: views.systemContextViews || [] },
    { key: 'container', label: 'Container View', views: views.containerViews || [] },
    { key: 'component', label: 'Component View', views: views.componentViews || [] },
    { key: 'deployment', label: 'Deployment View', views: views.deploymentViews || [] },
    { key: 'dynamic', label: 'Dynamic View', views: views.dynamicViews || [] }
  ].filter(vt => vt.views.length > 0);

  const currentViewType = viewTypes.find(vt => vt.key === selectedViewType) || viewTypes[0];
  const currentViews = currentViewType?.views || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h2>C4 Architecture Diagrams</h2>
          <p className={styles.subtitle}>{c4Data.name || 'System Architecture'}</p>
        </div>
      </div>

      <div className={styles.content}>
        {/* View Type Selector */}
        <div className={styles.viewTypeSelector}>
          {viewTypes.map(vt => (
            <button
              key={vt.key}
              className={`${styles.viewTypeBtn} ${selectedViewType === vt.key ? styles.active : ''}`}
              onClick={() => {
                setSelectedViewType(vt.key);
                setSelectedView(null);
              }}
            >
              {vt.label}
              <span className={styles.count}>{vt.views.length}</span>
            </button>
          ))}
        </div>

        {/* Specific View Selector (if multiple views of same type) */}
        {currentViews.length > 1 && (
          <div className={styles.specificViewSelector}>
            <label>Select View:</label>
            <select
              value={selectedView || ''}
              onChange={(e) => setSelectedView(e.target.value || null)}
              className={styles.viewSelect}
            >
              <option value="">Default View</option>
              {currentViews.map(view => (
                <option key={view.key} value={view.key}>
                  {view.description || view.key}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* View Description */}
        {currentViews.length > 0 && (
          <div className={styles.viewDescription}>
            <strong>
              {currentViews.find(v => v.key === selectedView)?.description ||
                currentViews[0]?.description ||
                currentViewType.label}
            </strong>
          </div>
        )}

        {/* Diagram Renderer */}
        <div className={styles.diagramWrapper}>
          <C4DiagramRenderer
            c4Data={c4Data}
            viewType={selectedViewType}
            selectedView={selectedView}
            filters={filters}
          />
        </div>

        {/* Legend with Filters */}
        <div className={styles.legend}>
          <h4>Legend & Filters</h4>
          <p className={styles.legendSubtitle}>Click to show/hide elements in the diagram</p>
          <div className={styles.legendItems}>
            <label className={`${styles.legendItem} ${styles.clickable} ${!filters.person ? styles.disabled : ''}`}>
              <input
                type="checkbox"
                checked={filters.person}
                onChange={() => toggleFilter('person')}
                className={styles.checkbox}
              />
              <div className={styles.legendBox} style={{ background: '#08427b' }}></div>
              <span>Person</span>
            </label>

            <label className={`${styles.legendItem} ${styles.clickable} ${!filters.softwareSystem ? styles.disabled : ''}`}>
              <input
                type="checkbox"
                checked={filters.softwareSystem}
                onChange={() => toggleFilter('softwareSystem')}
                className={styles.checkbox}
              />
              <div className={styles.legendBox} style={{ background: '#1168bd' }}></div>
              <span>Software System</span>
            </label>

            <label className={`${styles.legendItem} ${styles.clickable} ${!filters.container ? styles.disabled : ''}`}>
              <input
                type="checkbox"
                checked={filters.container}
                onChange={() => toggleFilter('container')}
                className={styles.checkbox}
              />
              <div className={styles.legendBox} style={{ background: '#438dd5' }}></div>
              <span>Container</span>
            </label>

            <label className={`${styles.legendItem} ${styles.clickable} ${!filters.component ? styles.disabled : ''}`}>
              <input
                type="checkbox"
                checked={filters.component}
                onChange={() => toggleFilter('component')}
                className={styles.checkbox}
              />
              <div className={styles.legendBox} style={{ background: '#85bbf0' }}></div>
              <span>Component</span>
            </label>

            <label className={`${styles.legendItem} ${styles.clickable} ${!filters.database ? styles.disabled : ''}`}>
              <input
                type="checkbox"
                checked={filters.database}
                onChange={() => toggleFilter('database')}
                className={styles.checkbox}
              />
              <div className={styles.legendBox} style={{ background: '#438dd5', borderRadius: '50%' }}></div>
              <span>Database</span>
            </label>

            <label className={`${styles.legendItem} ${styles.clickable} ${!filters.external ? styles.disabled : ''}`}>
              <input
                type="checkbox"
                checked={filters.external}
                onChange={() => toggleFilter('external')}
                className={styles.checkbox}
              />
              <div className={styles.legendBox} style={{ background: '#999999' }}></div>
              <span>External System</span>
            </label>

            <label className={`${styles.legendItem} ${styles.clickable} ${!filters.synchronous ? styles.disabled : ''}`}>
              <input
                type="checkbox"
                checked={filters.synchronous}
                onChange={() => toggleFilter('synchronous')}
                className={styles.checkbox}
              />
              <div className={styles.legendLine} style={{ borderTop: '2px solid #707070' }}></div>
              <span>Synchronous</span>
            </label>

            <label className={`${styles.legendItem} ${styles.clickable} ${!filters.asynchronous ? styles.disabled : ''}`}>
              <input
                type="checkbox"
                checked={filters.asynchronous}
                onChange={() => toggleFilter('asynchronous')}
                className={styles.checkbox}
              />
              <div className={styles.legendLine} style={{ borderTop: '2px dashed #707070' }}></div>
              <span>Asynchronous</span>
            </label>
          </div>
        </div>

        {/* Documentation */}
        {c4Data.documentation?.sections?.[0] && (
          <div className={styles.documentation}>
            <h4>Documentation</h4>
            <div className={styles.docContent}>
              {c4Data.documentation.sections[0].content}
            </div>
          </div>
        )}

        {/* Architecture Decisions */}
        {c4Data.documentation?.decisions?.length > 0 && (
          <div className={styles.decisions}>
            <h4>Architecture Decision Records (ADRs)</h4>
            {c4Data.documentation.decisions.map(decision => (
              <div key={decision.id} className={styles.decision}>
                <div className={styles.decisionHeader}>
                  <span className={styles.decisionId}>{decision.id}</span>
                  <span className={`${styles.decisionStatus} ${styles[decision.status.toLowerCase()]}`}>
                    {decision.status}
                  </span>
                  <span className={styles.decisionDate}>{decision.date}</span>
                </div>
                <h5>{decision.title}</h5>
                <p>{decision.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default C4DiagramViewer;
