import { useApp } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from './RequirementsView.module.css';

const RequirementsView = ({ onRefresh }) => {
  const { projectName, requirements, ddd, frontendData, summary } = useApp();

  // Extract requirements data
  const projectTitle = requirements?.projectName || projectName || 'Project';
  const functionalReqs = requirements?.functionalRequirements || [];
  const nonFunctionalReqs = requirements?.nonFunctionalRequirements || [];
  const stakeholders = requirements?.stakeholders || [];
  const constraints = requirements?.constraints || [];

  // Extract DDD data
  const boundedContexts = ddd?.boundedContexts || [];
  const domainEvents = ddd?.domainEvents || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{projectTitle}</h2>
        <Button onClick={onRefresh} variant="secondary" size="small">
          Refresh
        </Button>
      </div>

      <div className={styles.content}>
        {/* Project Info */}
        {requirements?.version && (
          <Card title="Project Information" padding="large" shadow>
            <div className={styles.summary}>
              <p><strong>Version:</strong> {requirements.version}</p>
              {stakeholders.length > 0 && (
                <div>
                  <strong>Stakeholders:</strong>
                  <ul>
                    {stakeholders.map((s, idx) => (
                      <li key={idx}>{s.name} - {s.role} ({s.email})</li>
                    ))}
                  </ul>
                </div>
              )}
              {constraints.length > 0 && (
                <div>
                  <strong>Constraints:</strong>
                  <ul>
                    {constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Functional Requirements */}
        {functionalReqs.length > 0 && (
          <Card title="Functional Requirements" padding="large" shadow>
            <div className={styles.features}>
              {functionalReqs.map((req, index) => (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureHeader}>
                    <span className={styles.icon}>{req.id}</span>
                    <h3 className={styles.featureName}>{req.title}</h3>
                    {req.priority && (
                      <span className={`${styles.priority} ${styles[req.priority.toLowerCase()]}`}>
                        {req.priority}
                      </span>
                    )}
                    {req.status && (
                      <span className={styles.status}>
                        {req.status}
                      </span>
                    )}
                  </div>
                  {req.description && (
                    <p className={styles.featureDescription}>{req.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Non-Functional Requirements */}
        {nonFunctionalReqs.length > 0 && (
          <Card title="Non-Functional Requirements" padding="large" shadow>
            <div className={styles.features}>
              {nonFunctionalReqs.map((req, index) => (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureHeader}>
                    <span className={styles.icon}>{req.id}</span>
                    <h3 className={styles.featureName}>{req.category}</h3>
                  </div>
                  <p className={styles.featureDescription}>{req.description}</p>
                  {req.metric && (
                    <p className={styles.metric}><strong>Metric:</strong> {req.metric}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Domain-Driven Design */}
        {boundedContexts.length > 0 && (
          <Card title="Domain-Driven Design (DDD)" padding="large" shadow>
            <div className={styles.ddd}>
              {boundedContexts.map((context, index) => (
                <div key={index} className={styles.dddSection}>
                  <h4 className={styles.dddTitle}>{context.name}</h4>
                  <p>{context.description}</p>
                  {context.aggregates && context.aggregates.length > 0 && (
                    <div className={styles.aggregates}>
                      {context.aggregates.map((agg, idx) => (
                        <div key={idx} className={styles.aggregate}>
                          <strong>{agg.name}:</strong> {agg.description}
                          {agg.entities && (
                            <ul className={styles.dddList}>
                              {agg.entities.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {functionalReqs.length === 0 && nonFunctionalReqs.length === 0 && boundedContexts.length === 0 && (
          <Card padding="large" shadow>
            <div className={styles.emptyState}>
              <h3>No Requirements Data Available</h3>
              <p>Waiting for project data from the backend...</p>
              <p>Connection status: {!requirements || Object.keys(requirements).length === 0 ? 'No data received' : 'Data received but empty'}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RequirementsView;
