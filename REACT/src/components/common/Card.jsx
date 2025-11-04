import styles from './Card.module.css';

const Card = ({
  children,
  title = '',
  subtitle = '',
  padding = 'medium',
  shadow = true,
  hoverable = false,
  onClick,
  className = '',
  ...props
}) => {
  const cardClass = [
    styles.card,
    styles[`padding-${padding}`],
    shadow ? styles.shadow : '',
    hoverable ? styles.hoverable : '',
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} onClick={onClick} {...props}>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default Card;
