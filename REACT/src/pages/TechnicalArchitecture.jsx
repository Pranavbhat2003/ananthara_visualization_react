import { useApp } from '../contexts/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from './TechnicalArchitecture.module.css';

const TechnicalArchitecture = ({ onRefresh }) => {
  const { technicalArchitecture, projectName } = useApp();

  const {
    systemName = '',
    architectureStyle = '',
    layers = [],
    services = [],
    infrastructure = {},
    security = {},
    integration = {},
    scalability = {},
    deployment = {}
  } = technicalArchitecture || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Technical Architecture</h2>
          {projectName && (
            <p className={styles.subtitle}>System design and infrastructure for {projectName}</p>
          )}
        </div>
        <Button onClick={onRefresh} variant="secondary" size="small">
          Refresh
        </Button>
      </div>

      <div className={styles.content}>
        {/* System Overview */}
        {(systemName || architectureStyle) && (
          <Card title="System Overview" padding="large" shadow>
            <div className={styles.overview}>
              {systemName && <p><strong>System:</strong> {systemName}</p>}
              {architectureStyle && <p><strong>Architecture:</strong> {architectureStyle}</p>}
            </div>
          </Card>
        )}

        {/* Architecture Layers */}
        {layers.length > 0 && (
          <Card title="Architecture Layers" padding="large" shadow>
            <div className={styles.layers}>
              {layers.map((layer, index) => (
                <div key={index} className={styles.layerCard}>
                  <div className={styles.layerHeader}>
                    <div className={styles.layerIcon}>🏗️</div>
                    <h4 className={styles.layerName}>{layer.name}</h4>
                  </div>
                  {layer.description && (
                    <p className={styles.layerDescription}>{layer.description}</p>
                  )}
                  {layer.technologies && layer.technologies.length > 0 && (
                    <div className={styles.technologies}>
                      <strong>Technologies:</strong>
                      <div className={styles.techList}>
                        {layer.technologies.map((tech, idx) => (
                          <span key={idx} className={styles.techBadge}>{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {layer.components && layer.components.length > 0 && (
                    <div className={styles.components}>
                      <strong>Components:</strong> {layer.components.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Microservices */}
        {services.length > 0 && (
          <Card title="Microservices" padding="large" shadow>
            <div className={styles.grid}>
              {services.map((service, index) => (
                <div key={index} className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>⚙️</div>
                  <div className={styles.serviceContent}>
                    <h4 className={styles.serviceName}>{service.name}</h4>
                    {service.description && (
                      <p className={styles.serviceDescription}>{service.description}</p>
                    )}
                    {service.technology && (
                      <p><strong>Technology:</strong> {service.technology}</p>
                    )}
                    {service.database && (
                      <p><strong>Database:</strong> {service.database}</p>
                    )}
                    {service.apis && service.apis.length > 0 && (
                      <div className={styles.apis}>
                        <strong>APIs:</strong>
                        <ul className={styles.apiList}>
                          {service.apis.map((api, idx) => (
                            <li key={idx}><code>{api}</code></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {service.dependencies && service.dependencies.length > 0 && (
                      <div className={styles.dependencies}>
                        <strong>Dependencies:</strong> {service.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Infrastructure */}
        {Object.keys(infrastructure).length > 0 && (
          <Card title="Infrastructure" padding="large" shadow>
            <div className={styles.infrastructure}>
              {infrastructure.cloud && (
                <p><strong>Cloud Provider:</strong> {infrastructure.cloud}</p>
              )}
              {infrastructure.compute && infrastructure.compute.length > 0 && (
                <div>
                  <strong>Compute:</strong>
                  <div className={styles.techList}>
                    {infrastructure.compute.map((item, idx) => (
                      <span key={idx} className={styles.techBadge}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {infrastructure.storage && infrastructure.storage.length > 0 && (
                <div>
                  <strong>Storage:</strong>
                  <div className={styles.techList}>
                    {infrastructure.storage.map((item, idx) => (
                      <span key={idx} className={styles.techBadge}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {infrastructure.networking && infrastructure.networking.length > 0 && (
                <div>
                  <strong>Networking:</strong>
                  <div className={styles.techList}>
                    {infrastructure.networking.map((item, idx) => (
                      <span key={idx} className={styles.techBadge}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {infrastructure.monitoring && infrastructure.monitoring.length > 0 && (
                <div>
                  <strong>Monitoring:</strong>
                  <div className={styles.techList}>
                    {infrastructure.monitoring.map((item, idx) => (
                      <span key={idx} className={styles.techBadge}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {infrastructure.cicd && infrastructure.cicd.length > 0 && (
                <div>
                  <strong>CI/CD:</strong>
                  <div className={styles.techList}>
                    {infrastructure.cicd.map((item, idx) => (
                      <span key={idx} className={styles.techBadge}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Security */}
        {Object.keys(security).length > 0 && (
          <Card title="Security" padding="large" shadow>
            <div className={styles.security}>
              {security.authentication && (
                <p><strong>Authentication:</strong> {security.authentication}</p>
              )}
              {security.authorization && (
                <p><strong>Authorization:</strong> {security.authorization}</p>
              )}
              {security.encryption && security.encryption.length > 0 && (
                <div>
                  <strong>Encryption:</strong>
                  <ul>
                    {security.encryption.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {security.compliance && security.compliance.length > 0 && (
                <div>
                  <strong>Compliance:</strong> {security.compliance.join(', ')}
                </div>
              )}
              {security.tools && security.tools.length > 0 && (
                <div>
                  <strong>Security Tools:</strong>
                  <div className={styles.techList}>
                    {security.tools.map((tool, idx) => (
                      <span key={idx} className={styles.techBadge}>{tool}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Integration */}
        {Object.keys(integration).length > 0 && (
          <Card title="Integration" padding="large" shadow>
            <div className={styles.integration}>
              {integration.messageQueue && (
                <p><strong>Message Queue:</strong> {integration.messageQueue}</p>
              )}
              {integration.eventBus && (
                <p><strong>Event Bus:</strong> {integration.eventBus}</p>
              )}
              {integration.apiProtocol && (
                <p><strong>API Protocol:</strong> {integration.apiProtocol}</p>
              )}
              {integration.webhooks !== undefined && (
                <p><strong>Webhooks:</strong> {integration.webhooks ? 'Enabled' : 'Disabled'}</p>
              )}
            </div>
          </Card>
        )}

        {/* Scalability */}
        {Object.keys(scalability).length > 0 && (
          <Card title="Scalability" padding="large" shadow>
            <div className={styles.scalability}>
              {scalability.horizontalScaling !== undefined && (
                <p><strong>Horizontal Scaling:</strong> {scalability.horizontalScaling ? 'Enabled' : 'Disabled'}</p>
              )}
              {scalability.loadBalancing && (
                <p><strong>Load Balancing:</strong> {scalability.loadBalancing}</p>
              )}
              {scalability.caching && (
                <p><strong>Caching:</strong> {scalability.caching}</p>
              )}
              {scalability.databaseScaling && (
                <p><strong>Database Scaling:</strong> {scalability.databaseScaling}</p>
              )}
              {scalability.autoScaling && (
                <p><strong>Auto Scaling:</strong> {scalability.autoScaling}</p>
              )}
            </div>
          </Card>
        )}

        {/* Deployment */}
        {Object.keys(deployment).length > 0 && (
          <Card title="Deployment" padding="large" shadow>
            <div className={styles.deployment}>
              {deployment.containerization && (
                <p><strong>Containerization:</strong> {deployment.containerization}</p>
              )}
              {deployment.orchestration && (
                <p><strong>Orchestration:</strong> {deployment.orchestration}</p>
              )}
              {deployment.environments && deployment.environments.length > 0 && (
                <div>
                  <strong>Environments:</strong>
                  <div className={styles.techList}>
                    {deployment.environments.map((env, idx) => (
                      <span key={idx} className={styles.techBadge}>{env}</span>
                    ))}
                  </div>
                </div>
              )}
              {deployment.strategy && (
                <p><strong>Deployment Strategy:</strong> {deployment.strategy}</p>
              )}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!systemName && layers.length === 0 && services.length === 0 && (
          <Card padding="large" shadow>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏛️</div>
              <h3>No Technical Architecture Data Available</h3>
              <p>System architecture and infrastructure details will appear here once defined.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TechnicalArchitecture;
