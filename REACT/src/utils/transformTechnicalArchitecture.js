/**
 * Transform C4 Model (Structurizr format) to simplified format for UI display
 */
export const transformTechnicalArchitecture = (c4Data) => {
  if (!c4Data || !c4Data.model) {
    return {};
  }

  const { model, properties, documentation } = c4Data;
  const softwareSystem = model.softwareSystems?.[0];

  if (!softwareSystem) {
    return {};
  }

  // Extract system overview
  const systemName = softwareSystem.name || '';
  const architectureStyle = softwareSystem.properties?.architectureStyle ||
                           properties?.architecture_pattern || '';

  // Extract containers as services/layers
  const containers = softwareSystem.containers || [];

  // Separate microservices from infrastructure
  const services = containers
    .filter(c => c.tags?.includes('Microservice') || c.tags?.includes('Container'))
    .filter(c => !c.tags?.includes('Database') && !c.tags?.includes('Infrastructure'))
    .map(container => ({
      name: container.name,
      description: container.description,
      technology: container.technology,
      database: extractDatabase(container, containers),
      apis: extractAPIs(container),
      dependencies: extractDependencies(container, model.relationships)
    }));

  // Extract infrastructure components
  const infrastructure = {
    cloud: properties?.deployment?.platform || softwareSystem.properties?.platform || '',
    compute: extractByTag(containers, 'Infrastructure', 'compute'),
    storage: extractByTag(containers, 'Database', 'storage'),
    networking: extractNetworking(containers),
    monitoring: extractByProperty(properties, 'monitoring'),
    cicd: extractByProperty(properties, 'cicd')
  };

  // Extract security information
  const security = {
    authentication: properties?.security?.authentication || '',
    authorization: properties?.security?.authorization || '',
    encryption: extractEncryption(properties?.security),
    compliance: extractCompliance(properties?.security),
    tools: extractSecurityTools(properties?.security)
  };

  // Extract integration information
  const integration = {
    messageQueue: properties?.integration?.messageQueue || findContainerByTechnology(containers, 'RabbitMQ', 'AMQP'),
    eventBus: properties?.integration?.eventBus || findContainerByTechnology(containers, 'Kafka'),
    apiProtocol: properties?.integration?.apiProtocol || softwareSystem.properties?.apiProtocol || '',
    webhooks: properties?.integration?.webhooks || false
  };

  // Extract scalability information
  const scalability = {
    horizontalScaling: properties?.scalability?.horizontalScaling ?? true,
    loadBalancing: properties?.scalability?.loadBalancing || '',
    caching: properties?.scalability?.caching || findContainerByTechnology(containers, 'Redis'),
    databaseScaling: properties?.scalability?.databaseScaling || '',
    autoScaling: properties?.scalability?.autoScaling || ''
  };

  // Extract deployment information
  const deployment = {
    containerization: properties?.deployment?.containerization || '',
    orchestration: properties?.deployment?.orchestration || softwareSystem.properties?.deployment || '',
    environments: properties?.deployment?.environments || [],
    strategy: properties?.deployment?.strategy || ''
  };

  return {
    systemName,
    architectureStyle,
    layers: [], // C4 model doesn't have explicit layers, but we could derive from container grouping
    services,
    infrastructure,
    security,
    integration,
    scalability,
    deployment,
    documentation: documentation?.sections?.[0]?.content || ''
  };
};

// Helper functions
function extractDatabase(container, allContainers) {
  // Look for relationships to database containers
  if (!container.components) return '';

  const dbRels = container.components
    .flatMap(c => c.relationships || [])
    .filter(r => {
      const dest = allContainers.find(ac => ac.id === r.destinationId);
      return dest?.tags?.includes('Database');
    });

  if (dbRels.length > 0) {
    const dbContainer = allContainers.find(c => c.id === dbRels[0].destinationId);
    return dbContainer?.technology || '';
  }

  return '';
}

function extractAPIs(container) {
  // Extract API endpoints from components
  const apis = [];

  if (container.components) {
    container.components.forEach(component => {
      if (component.properties?.endpoints) {
        apis.push(...component.properties.endpoints);
      }
    });
  }

  return apis;
}

function extractDependencies(container, relationships) {
  // Find outgoing relationships from this container
  const deps = relationships
    ?.filter(r => r.sourceId === container.id)
    .map(r => {
      // Extract service name from relationship
      const parts = r.description?.split(' ') || [];
      return parts[0];
    })
    .filter(Boolean);

  return [...new Set(deps)]; // Remove duplicates
}

function extractByTag(containers, tag, category) {
  return containers
    .filter(c => c.tags?.includes(tag))
    .map(c => c.name || c.technology)
    .filter(Boolean);
}

function extractNetworking(containers) {
  const networking = [];

  containers.forEach(c => {
    if (c.tags?.includes('Gateway') || c.name?.toLowerCase().includes('gateway')) {
      networking.push(c.name);
    }
    if (c.tags?.includes('LoadBalancer') || c.name?.toLowerCase().includes('balancer')) {
      networking.push(c.name);
    }
  });

  return networking;
}

function extractByProperty(properties, key) {
  if (!properties || !properties[key]) return [];
  const value = properties[key];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return Object.values(value);
  return [];
}

function extractEncryption(security) {
  const encryption = [];
  if (security?.encryption_in_transit) {
    encryption.push(`In Transit: ${security.encryption_in_transit}`);
  }
  if (security?.encryption_at_rest) {
    encryption.push(`At Rest: ${security.encryption_at_rest}`);
  }
  return encryption;
}

function extractCompliance(security) {
  if (!security?.compliance) return [];
  if (typeof security.compliance === 'string') {
    return security.compliance.split(',').map(s => s.trim());
  }
  return Array.isArray(security.compliance) ? security.compliance : [];
}

function extractSecurityTools(security) {
  if (!security?.tools) return [];
  if (typeof security.tools === 'string') {
    return security.tools.split(',').map(s => s.trim());
  }
  return Array.isArray(security.tools) ? security.tools : [];
}

function findContainerByTechnology(containers, ...techKeywords) {
  const found = containers.find(c =>
    techKeywords.some(keyword =>
      c.technology?.toLowerCase().includes(keyword.toLowerCase()) ||
      c.name?.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  return found?.name || '';
}
