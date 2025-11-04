import styles from './Button.module.css';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon = null,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    disabled ? styles.disabled : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
