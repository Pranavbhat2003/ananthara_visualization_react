import { useApp } from '../../contexts/AppContext';
import Button from '../common/Button';
import styles from './Toolbar.module.css';

const Toolbar = () => {
  const { zoom, setZoom, showGrid, setShowGrid } = useApp();

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.section}>
        <span className={styles.label}>Zoom:</span>
        <Button size="small" variant="ghost" onClick={handleZoomOut}>
          -
        </Button>
        <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
        <Button size="small" variant="ghost" onClick={handleZoomIn}>
          +
        </Button>
        <Button size="small" variant="ghost" onClick={handleResetZoom}>
          Reset
        </Button>
      </div>

      <div className={styles.section}>
        <Button
          size="small"
          variant={showGrid ? 'primary' : 'ghost'}
          onClick={() => setShowGrid(!showGrid)}
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
