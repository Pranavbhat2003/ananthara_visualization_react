import { useApp } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from './DomainDrivenDesign.module.css';

const DomainDrivenDesign = ({ onRefresh }) => {
  const { ddd, projectName } = useApp();

  const {
    boundedContexts = [],
    domainEvents = [],
    ubiquitousLanguage = {}
  } = ddd || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Domain-Driven Design (DDD)</h2>
          {projectName && (
            <p className={styles.subtitle}>Architectural patterns and domain models for {projectName}</p>
          )}
        </div>
        <Button onClick={onRefresh} variant="secondary" size="small">
          Refresh
        </Button>
      </div>

      <div className={styles.content}>
        {/* Bounded Contexts */}
        {boundedContexts.length > 0 && (
          <Card title="Bounded Contexts" padding="large" shadow>
            <div className={styles.description}>
              <p>Bounded contexts define explicit boundaries within the domain where a particular model is defined and applicable.</p>
            </div>
            <div className={styles.grid}>
              {boundedContexts.map((context, index) => (
                <div key={index} className={styles.itemCard}>
                  <div className={styles.itemIcon}>🏛️</div>
                  <div className={styles.itemContent}>
                    <h4 className={styles.itemTitle}>{context.name}</h4>
                    {context.description && (
                      <p className={styles.itemDescription}>{context.description}</p>
                    )}
                    {context.aggregates && context.aggregates.length > 0 && (
                      <div className={styles.aggregates}>
                        <strong>Aggregates:</strong>
                        {context.aggregates.map((agg, idx) => (
                          <div key={idx} className={styles.aggregate}>
                            <div><strong>{agg.name}:</strong> {agg.description}</div>
                            {agg.entities && agg.entities.length > 0 && (
                              <div className={styles.entities}>
                                <em>Entities:</em> {agg.entities.join(', ')}
                              </div>
                            )}
                            {agg.valueObjects && agg.valueObjects.length > 0 && (
                              <div className={styles.valueObjects}>
                                <em>Value Objects:</em> {agg.valueObjects.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Domain Events */}
        {domainEvents.length > 0 && (
          <Card title="Domain Events" padding="large" shadow>
            <div className={styles.description}>
              <p>Events that domain experts care about and represent something that happened in the domain.</p>
            </div>
            <div className={styles.grid}>
              {domainEvents.map((event, index) => (
                <div key={index} className={styles.itemCard}>
                  <div className={styles.itemIcon}>📢</div>
                  <div className={styles.itemContent}>
                    <h4 className={styles.itemTitle}>{event.name}</h4>
                    {event.context && (
                      <p className={styles.context}><strong>Context:</strong> {event.context}</p>
                    )}
                    {event.data && (
                      <div className={styles.eventData}>
                        <strong>Data:</strong>
                        <pre className={styles.dataPreview}>{JSON.stringify(event.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Ubiquitous Language */}
        {Object.keys(ubiquitousLanguage).length > 0 && (
          <Card title="Ubiquitous Language" padding="large" shadow>
            <div className={styles.description}>
              <p>Common language used by domain experts and developers to ensure clarity and consistency.</p>
            </div>
            <div className={styles.languageGrid}>
              {Object.entries(ubiquitousLanguage).map(([term, definition], index) => (
                <div key={index} className={styles.languageItem}>
                  <h4 className={styles.term}>{term}</h4>
                  <p className={styles.definition}>{definition}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {boundedContexts.length === 0 && domainEvents.length === 0 && Object.keys(ubiquitousLanguage).length === 0 && (
          <Card padding="large" shadow>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏗️</div>
              <h3>No DDD Data Available</h3>
              <p>Domain-Driven Design architecture will appear here once the project is defined.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DomainDrivenDesign;
