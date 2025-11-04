import styles from './Input.module.css';

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  label = '',
  error = '',
  disabled = false,
  fullWidth = false,
  icon = null,
  className = '',
  ...props
}) => {
  const wrapperClass = [
    styles.inputWrapper,
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputContainer}>
        {icon && (
          <span className={styles.icon}>{icon}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.input} ${icon ? styles.withIcon : ''} ${error ? styles.error : ''}`}
          {...props}
        />
      </div>
      {error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  );
};

export default Input;
