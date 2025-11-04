import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Connecting to server...', size = 'large' }) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
