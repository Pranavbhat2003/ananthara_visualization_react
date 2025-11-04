import { useApp } from '../../contexts/AppContext';
import Button from '../common/Button';
import styles from './Header.module.css';

const Header = ({ connectionStatus, onReconnect }) => {
  const { projectName, currentMode, setCurrentMode } = useApp();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return styles.connected;
      case 'connecting':
        return styles.connecting;
      case 'disconnected':
      case 'error':
        return styles.error;
      default:
        return '';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <h1 className={styles.title}>Anantara Design System</h1>
          {projectName && (
            <span className={styles.projectName}>{projectName}</span>
          )}
        </div>
      </div>

      <div className={styles.center}>
        {projectName && (
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeButton} ${currentMode === 'requirements' ? styles.active : ''}`}
              onClick={() => setCurrentMode('requirements')}
            >
              Requirements
            </button>
            <button
              className={`${styles.modeButton} ${currentMode === 'ddd' ? styles.active : ''}`}
              onClick={() => setCurrentMode('ddd')}
            >
              DDD
            </button>
            <button
              className={`${styles.modeButton} ${currentMode === 'technical' ? styles.active : ''}`}
              onClick={() => setCurrentMode('technical')}
            >
              Architecture
            </button>
            <button
              className={`${styles.modeButton} ${currentMode === 'canvas' ? styles.active : ''}`}
              onClick={() => setCurrentMode('canvas')}
            >
              Canvas
            </button>
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={`${styles.statusIndicator} ${getStatusColor()}`}>
          <span className={styles.statusDot}></span>
          <span className={styles.statusText}>{getStatusText()}</span>
        </div>
        {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
          <Button
            size="small"
            variant="secondary"
            onClick={onReconnect}
          >
            Reconnect
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
