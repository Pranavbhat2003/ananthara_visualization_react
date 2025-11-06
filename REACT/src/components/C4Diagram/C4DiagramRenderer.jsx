import { useRef, useEffect, useState } from 'react';
import styles from './C4DiagramRenderer.module.css';

const C4DiagramRenderer = ({ c4Data, viewType = 'container', selectedView = null, filters = null }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState({});
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggingElement, setDraggingElement] = useState(null);
  const [elementDragStart, setElementDragStart] = useState({ x: 0, y: 0 });
  const [diagramDimensions, setDiagramDimensions] = useState({ width: 0, height: 0 });
  const [hasAutoFit, setHasAutoFit] = useState(false);

  useEffect(() => {
    if (!c4Data || !svgRef.current || !containerRef.current) return;

    // Clear previous content
    svgRef.current.innerHTML = '';

    // Render the appropriate view
    const view = getView(c4Data, viewType, selectedView);
    if (view) {
      renderView(svgRef.current, c4Data, view, containerRef.current);
    }
  }, [c4Data, viewType, selectedView, layout, filters]);

  // Auto-fit diagram when view changes
  useEffect(() => {
    if (diagramDimensions.width > 0 && diagramDimensions.height > 0 && !hasAutoFit) {
      handleFitToScreen();
      setHasAutoFit(true);
    }
  }, [diagramDimensions, hasAutoFit]);

  // Reset auto-fit flag when view changes
  useEffect(() => {
    setHasAutoFit(false);
    setLayout({});
  }, [viewType, selectedView]);

  const getView = (data, type, viewKey) => {
    const views = data.views || {};

    switch (type) {
      case 'landscape':
        return viewKey
          ? views.systemLandscapeViews?.find(v => v.key === viewKey)
          : views.systemLandscapeViews?.[0];
      case 'context':
        return viewKey
          ? views.systemContextViews?.find(v => v.key === viewKey)
          : views.systemContextViews?.[0];
      case 'container':
        return viewKey
          ? views.containerViews?.find(v => v.key === viewKey)
          : views.containerViews?.[0];
      case 'component':
        return viewKey
          ? views.componentViews?.find(v => v.key === viewKey)
          : views.componentViews?.[0];
      case 'deployment':
        return viewKey
          ? views.deploymentViews?.find(v => v.key === viewKey)
          : views.deploymentViews?.[0];
      case 'dynamic':
        return viewKey
          ? views.dynamicViews?.find(v => v.key === viewKey)
          : views.dynamicViews?.[0];
      default:
        return views.containerViews?.[0];
    }
  };

  const renderView = (svg, data, view, container) => {
    // Get elements and relationships
    const elements = getElementsForView(data, view);
    const allRelationships = getRelationshipsForView(data, view);

    // Filter relationships to only show those where both source and destination are visible
    const visibleElementIds = new Set(elements.map(e => e.id));
    const relationships = allRelationships.filter(r =>
      visibleElementIds.has(r.sourceId) && visibleElementIds.has(r.destinationId)
    );

    // Calculate or use existing layout
    const currentLayout = Object.keys(layout).length > 0
      ? layout
      : calculateLayout(elements, relationships, view);

    if (Object.keys(layout).length === 0) {
      setLayout(currentLayout);
    }

    // Calculate bounds of all elements
    const bounds = calculateBounds(currentLayout);

    // Add padding
    const padding = 100;
    const diagramWidth = bounds.maxX - bounds.minX + padding * 2;
    const diagramHeight = bounds.maxY - bounds.minY + padding * 2;

    // Adjust layout to center and add padding
    const adjustedLayout = {};
    Object.keys(currentLayout).forEach(id => {
      adjustedLayout[id] = {
        ...currentLayout[id],
        x: currentLayout[id].x - bounds.minX + padding,
        y: currentLayout[id].y - bounds.minY + padding
      };
    });

    // Set viewBox to fit the diagram
    svg.setAttribute('viewBox', `0 0 ${diagramWidth} ${diagramHeight}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Store diagram dimensions for auto-fit
    setDiagramDimensions({ width: diagramWidth, height: diagramHeight });

    // Add definitions (arrowheads, etc)
    addDefinitions(svg);

    // Render relationships first (so they appear behind elements)
    relationships.forEach(rel => {
      renderRelationship(svg, rel, adjustedLayout, data);
    });

    // Render elements
    elements.forEach(el => {
      renderElement(svg, el, adjustedLayout, data, view);
    });
  };

  const calculateBounds = (layout) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    Object.values(layout).forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    });

    return { minX, minY, maxX, maxY };
  };

  const getElementsForView = (data, view) => {
    const elementIds = view.elements?.map(e => e.id) || [];
    const allElements = [];

    // Default filters (all enabled)
    const activeFilters = filters || {
      person: true,
      softwareSystem: true,
      container: true,
      component: true,
      database: true,
      external: true
    };

    // Collect all people
    if (activeFilters.person) {
      data.model?.people?.forEach(p => {
        if (elementIds.includes(p.id)) {
          allElements.push({ ...p, type: 'person' });
        }
      });
    }

    // Collect all software systems
    data.model?.softwareSystems?.forEach(sys => {
      // Check if system itself is external
      const isSystemExternal = sys.tags?.includes('External') || sys.location === 'External';

      if (elementIds.includes(sys.id)) {
        // Show if softwareSystem filter is on AND (not external OR external filter is on)
        if (activeFilters.softwareSystem && (!isSystemExternal || activeFilters.external)) {
          allElements.push({ ...sys, type: 'softwareSystem' });
        }
      }

      // Collect containers
      sys.containers?.forEach(container => {
        if (elementIds.includes(container.id)) {
          // Check if it's a database or external
          const isDatabase = container.tags?.includes('Database');
          const isContainerExternal = container.tags?.includes('External');

          // Determine if should show based on filters
          let shouldShow = true;

          // Must pass container filter (unless it's specifically database or external)
          if (!isDatabase && !isContainerExternal && !activeFilters.container) {
            shouldShow = false;
          }

          // Must pass database filter if it's a database
          if (isDatabase && !activeFilters.database) {
            shouldShow = false;
          }

          // Must pass external filter if it's external
          if (isContainerExternal && !activeFilters.external) {
            shouldShow = false;
          }

          if (shouldShow) {
            allElements.push({ ...container, type: 'container', parentId: sys.id });
          }
        }

        // Collect components
        container.components?.forEach(component => {
          if (elementIds.includes(component.id) && activeFilters.component) {
            allElements.push({ ...component, type: 'component', parentId: container.id });
          }
        });
      });
    });

    return allElements;
  };

  const getRelationshipsForView = (data, view) => {
    const relationshipIds = view.relationships?.map(r => r.id) || [];
    const allRelationships = data.model?.relationships || [];

    // Default filters (all enabled)
    const activeFilters = filters || {
      synchronous: true,
      asynchronous: true
    };

    return allRelationships.filter(r => {
      if (!relationshipIds.includes(r.id)) return false;

      // Check relationship type
      const isAsynchronous = r.tags?.includes('Asynchronous') || r.interactionStyle === 'Asynchronous';

      if (isAsynchronous && !activeFilters.asynchronous) return false;
      if (!isAsynchronous && !activeFilters.synchronous) return false;

      return true;
    });
  };

  const calculateLayout = (elements, relationships, view) => {
    const newLayout = {};

    const nodeWidth = 200;
    const nodeHeight = 150;
    const horizontalGap = 120;
    const verticalGap = 180;

    // Group elements by type
    const people = elements.filter(e => e.type === 'person');
    const systems = elements.filter(e => e.type === 'softwareSystem');
    const containers = elements.filter(e => e.type === 'container');
    const components = elements.filter(e => e.type === 'component');

    let currentY = 0;

    // Layout people at the top
    if (people.length > 0) {
      let currentX = 0;

      people.forEach((person, idx) => {
        newLayout[person.id] = {
          x: currentX + idx * (nodeWidth + horizontalGap),
          y: currentY,
          width: nodeWidth,
          height: 130
        };
      });
      currentY += 230;
    }

    // Layout systems
    if (systems.length > 0) {
      let currentX = 0;

      systems.forEach((system, idx) => {
        newLayout[system.id] = {
          x: currentX + idx * (nodeWidth + horizontalGap),
          y: currentY,
          width: nodeWidth,
          height: nodeHeight
        };
      });
      currentY += verticalGap + nodeHeight;
    }

    // Layout containers in a grid
    if (containers.length > 0) {
      const itemsPerRow = Math.min(4, containers.length);

      containers.forEach((container, idx) => {
        const row = Math.floor(idx / itemsPerRow);
        const col = idx % itemsPerRow;

        newLayout[container.id] = {
          x: col * (nodeWidth + horizontalGap),
          y: currentY + row * (nodeHeight + verticalGap),
          width: nodeWidth,
          height: nodeHeight
        };
      });
    }

    // Layout components
    if (components.length > 0) {
      const itemsPerRow = Math.min(3, components.length);
      components.forEach((component, idx) => {
        const row = Math.floor(idx / itemsPerRow);
        const col = idx % itemsPerRow;

        newLayout[component.id] = {
          x: col * (nodeWidth + horizontalGap),
          y: currentY + row * (nodeHeight + 100),
          width: nodeWidth,
          height: 130
        };
      });
    }

    return newLayout;
  };

  const renderElement = (svg, element, layout, data, view) => {
    const pos = layout[element.id];
    if (!pos) return;

    const elementStyles = getElementStyle(element, data.views?.configuration?.styles);
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'c4-element');
    group.setAttribute('data-id', element.id);
    group.style.cursor = 'move';

    // Add event listeners for dragging
    group.addEventListener('mousedown', (e) => handleElementMouseDown(e, element.id));
    group.addEventListener('click', (e) => {
      e.stopPropagation();
      setSelectedElement(element.id);
    });

    // Highlight if selected
    if (selectedElement === element.id) {
      const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      highlight.setAttribute('x', pos.x - 5);
      highlight.setAttribute('y', pos.y - 5);
      highlight.setAttribute('width', pos.width + 10);
      highlight.setAttribute('height', pos.height + 10);
      highlight.setAttribute('fill', 'none');
      highlight.setAttribute('stroke', '#0066cc');
      highlight.setAttribute('stroke-width', '3');
      highlight.setAttribute('stroke-dasharray', '5,5');
      highlight.setAttribute('rx', '10');
      group.appendChild(highlight);
    }

    // Render based on shape
    if (element.type === 'person' || elementStyles.shape === 'Person') {
      renderPersonShape(group, pos, element, elementStyles);
    } else if (elementStyles.shape === 'Cylinder') {
      renderCylinderShape(group, pos, element, elementStyles);
    } else {
      renderBoxShape(group, pos, element, elementStyles);
    }

    svg.appendChild(group);
  };

  const renderPersonShape = (group, pos, element, styles) => {
    const centerX = pos.x + pos.width / 2;
    const headRadius = 20;
    const headY = pos.y + 28;
    const bodyY = pos.y + 60;

    // Head (circle)
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    head.setAttribute('cx', centerX);
    head.setAttribute('cy', headY);
    head.setAttribute('r', headRadius);
    head.setAttribute('fill', styles.background || '#08427b');
    head.setAttribute('stroke', '#000');
    head.setAttribute('stroke-width', '2');
    group.appendChild(head);

    // Body (trapezoid-like shape)
    const bodyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const bodyWidth = 55;
    const bodyHeight = 38;
    bodyPath.setAttribute('d', `
      M ${centerX - bodyWidth/2} ${bodyY}
      L ${centerX + bodyWidth/2} ${bodyY}
      L ${centerX + bodyWidth/2 + 10} ${bodyY + bodyHeight}
      L ${centerX - bodyWidth/2 - 10} ${bodyY + bodyHeight}
      Z
    `);
    bodyPath.setAttribute('fill', styles.background || '#08427b');
    bodyPath.setAttribute('stroke', '#000');
    bodyPath.setAttribute('stroke-width', '2');
    group.appendChild(bodyPath);

    // Name
    const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    name.setAttribute('x', centerX);
    name.setAttribute('y', bodyY + bodyHeight + 22);
    name.setAttribute('text-anchor', 'middle');
    name.setAttribute('font-weight', 'bold');
    name.setAttribute('font-size', '14');
    name.setAttribute('fill', '#000');
    name.textContent = truncateText(element.name, 24);
    group.appendChild(name);

    // Description
    if (element.description) {
      const lines = wrapText(element.description, 28);
      lines.slice(0, 2).forEach((line, idx) => {
        const desc = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        desc.setAttribute('x', centerX);
        desc.setAttribute('y', bodyY + bodyHeight + 40 + idx * 15);
        desc.setAttribute('text-anchor', 'middle');
        desc.setAttribute('font-size', '11');
        desc.setAttribute('fill', '#666');
        desc.textContent = line;
        group.appendChild(desc);
      });
    }
  };

  const renderCylinderShape = (group, pos, element, styles) => {
    const rx = pos.width / 2;
    const ry = 15;
    const centerX = pos.x + rx;
    const topY = pos.y + ry;
    const bottomY = pos.y + pos.height - ry;

    // Top ellipse
    const topEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    topEllipse.setAttribute('cx', centerX);
    topEllipse.setAttribute('cy', topY);
    topEllipse.setAttribute('rx', rx);
    topEllipse.setAttribute('ry', ry);
    topEllipse.setAttribute('fill', styles.background || '#438dd5');
    topEllipse.setAttribute('stroke', '#000');
    topEllipse.setAttribute('stroke-width', '2');
    group.appendChild(topEllipse);

    // Left side
    const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftLine.setAttribute('x1', pos.x);
    leftLine.setAttribute('y1', topY);
    leftLine.setAttribute('x2', pos.x);
    leftLine.setAttribute('y2', bottomY);
    leftLine.setAttribute('stroke', '#000');
    leftLine.setAttribute('stroke-width', '2');
    group.appendChild(leftLine);

    // Right side
    const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightLine.setAttribute('x1', pos.x + pos.width);
    rightLine.setAttribute('y1', topY);
    rightLine.setAttribute('x2', pos.x + pos.width);
    rightLine.setAttribute('y2', bottomY);
    rightLine.setAttribute('stroke', '#000');
    rightLine.setAttribute('stroke-width', '2');
    group.appendChild(rightLine);

    // Body fill
    const bodyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bodyRect.setAttribute('x', pos.x);
    bodyRect.setAttribute('y', topY);
    bodyRect.setAttribute('width', pos.width);
    bodyRect.setAttribute('height', bottomY - topY);
    bodyRect.setAttribute('fill', styles.background || '#438dd5');
    bodyRect.setAttribute('stroke', 'none');
    group.insertBefore(bodyRect, group.firstChild);

    // Bottom ellipse
    const bottomEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    bottomEllipse.setAttribute('cx', centerX);
    bottomEllipse.setAttribute('cy', bottomY);
    bottomEllipse.setAttribute('rx', rx);
    bottomEllipse.setAttribute('ry', ry);
    bottomEllipse.setAttribute('fill', styles.background || '#438dd5');
    bottomEllipse.setAttribute('stroke', '#000');
    bottomEllipse.setAttribute('stroke-width', '2');
    group.appendChild(bottomEllipse);

    addTextToElement(group, pos, element, styles);
  };

  const renderBoxShape = (group, pos, element, styles) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', pos.x);
    rect.setAttribute('y', pos.y);
    rect.setAttribute('width', pos.width);
    rect.setAttribute('height', pos.height);
    rect.setAttribute('fill', styles.background || '#438dd5');
    rect.setAttribute('stroke', '#000');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', styles.shape === 'RoundedBox' ? '8' : '0');
    group.appendChild(rect);

    addTextToElement(group, pos, element, styles);
  };

  const addTextToElement = (group, pos, element, styles) => {
    const centerX = pos.x + pos.width / 2;
    let currentY = pos.y + 32;

    // Name
    const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    name.setAttribute('x', centerX);
    name.setAttribute('y', currentY);
    name.setAttribute('text-anchor', 'middle');
    name.setAttribute('font-weight', 'bold');
    name.setAttribute('font-size', '13');
    name.setAttribute('fill', styles.color || '#ffffff');
    name.textContent = truncateText(element.name, 24);
    group.appendChild(name);
    currentY += 20;

    // Type label
    if (element.technology) {
      const tech = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tech.setAttribute('x', centerX);
      tech.setAttribute('y', currentY);
      tech.setAttribute('text-anchor', 'middle');
      tech.setAttribute('font-size', '10');
      tech.setAttribute('font-style', 'italic');
      tech.setAttribute('fill', styles.color || '#ffffff');
      tech.textContent = `[${truncateText(element.technology, 28)}]`;
      group.appendChild(tech);
      currentY += 18;
    }

    // Description
    if (element.description) {
      const lines = wrapText(element.description, 30);
      lines.slice(0, 3).forEach((line, idx) => {
        const desc = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        desc.setAttribute('x', centerX);
        desc.setAttribute('y', currentY + idx * 14);
        desc.setAttribute('text-anchor', 'middle');
        desc.setAttribute('font-size', '10');
        desc.setAttribute('fill', styles.color || '#ffffff');
        desc.textContent = line;
        group.appendChild(desc);
      });
    }
  };

  const renderRelationship = (svg, rel, layout, data) => {
    const source = layout[rel.sourceId];
    const dest = layout[rel.destinationId];

    if (!source || !dest) return;

    const styles = getRelationshipStyle(rel, data.views?.configuration?.styles);

    // Calculate connection points
    const sourcePoint = getConnectionPoint(source, dest, false);
    const destPoint = getConnectionPoint(dest, source, true);

    // Create group
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'c4-relationship');

    // Draw line
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = `M ${sourcePoint.x} ${sourcePoint.y} L ${destPoint.x} ${destPoint.y}`;

    path.setAttribute('d', pathData);
    path.setAttribute('stroke', styles.color || '#707070');
    path.setAttribute('stroke-width', styles.thickness || '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-dasharray', styles.style === 'dashed' ? '5,5' : '0');
    path.setAttribute('marker-end', `url(#arrowhead-${styles.style === 'dashed' ? 'dashed' : 'solid'})`);
    group.appendChild(path);

    // Add label background and text
    if (rel.description) {
      const midX = (sourcePoint.x + destPoint.x) / 2;
      const midY = (sourcePoint.y + destPoint.y) / 2;

      // Background rect for better readability
      const labelText = truncateText(rel.description, 28);
      const labelWidth = labelText.length * 6.5;

      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('x', midX - labelWidth / 2 - 5);
      bgRect.setAttribute('y', midY - 20);
      bgRect.setAttribute('width', labelWidth + 10);
      bgRect.setAttribute('height', 18);
      bgRect.setAttribute('fill', 'white');
      bgRect.setAttribute('stroke', styles.color || '#707070');
      bgRect.setAttribute('stroke-width', '1');
      bgRect.setAttribute('rx', '4');
      group.appendChild(bgRect);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', midX);
      label.setAttribute('y', midY - 7);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-weight', '500');
      label.setAttribute('fill', '#000');
      label.textContent = labelText;
      group.appendChild(label);

      // Technology label
      if (rel.technology) {
        const techLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        techLabel.setAttribute('x', midX);
        techLabel.setAttribute('y', midY + 14);
        techLabel.setAttribute('text-anchor', 'middle');
        techLabel.setAttribute('font-size', '9');
        techLabel.setAttribute('font-style', 'italic');
        techLabel.setAttribute('fill', '#666');
        techLabel.textContent = `[${truncateText(rel.technology, 22)}]`;
        group.appendChild(techLabel);
      }
    }

    svg.appendChild(group);
  };

  const getConnectionPoint = (from, to, isDestination = false) => {
    const fromCenterX = from.x + from.width / 2;
    const fromCenterY = from.y + from.height / 2;
    const toCenterX = to.x + to.width / 2;
    const toCenterY = to.y + to.height / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    // Calculate angle
    const angle = Math.atan2(dy, dx);

    // Arrow marker offset
    const arrowOffset = isDestination ? 12 : 0;

    // Determine which edge the line intersects
    const tanAngle = Math.abs(Math.tan(angle));
    const boxRatio = from.height / from.width;

    let x, y;

    if (tanAngle < boxRatio) {
      // Intersects left or right edge
      if (dx > 0) {
        // Right edge
        x = from.x + from.width - (isDestination ? arrowOffset : 0);
        y = fromCenterY + (x - fromCenterX) * Math.tan(angle);
      } else {
        // Left edge
        x = from.x + (isDestination ? arrowOffset : 0);
        y = fromCenterY + (x - fromCenterX) * Math.tan(angle);
      }
    } else {
      // Intersects top or bottom edge
      if (dy > 0) {
        // Bottom edge
        y = from.y + from.height - (isDestination ? arrowOffset : 0);
        x = fromCenterX + (y - fromCenterY) / Math.tan(angle);
      } else {
        // Top edge
        y = from.y + (isDestination ? arrowOffset : 0);
        x = fromCenterX + (y - fromCenterY) / Math.tan(angle);
      }
    }

    return { x, y };
  };

  const getElementStyle = (element, config) => {
    const defaultStyles = {
      'Person': { shape: 'Person', background: '#08427b', color: '#ffffff' },
      'Software System': { shape: 'RoundedBox', background: '#1168bd', color: '#ffffff' },
      'Container': { shape: 'RoundedBox', background: '#438dd5', color: '#ffffff' },
      'Component': { shape: 'RoundedBox', background: '#85bbf0', color: '#000000' },
      'Database': { shape: 'Cylinder', background: '#438dd5', color: '#ffffff' },
      'External': { background: '#999999', color: '#ffffff' },
      'Gateway': { background: '#0ea5e9', color: '#ffffff' },
      'Microservice': { background: '#20B2AA', color: '#ffffff' },
      'Infrastructure': { background: '#6366f1', color: '#ffffff' },
    };

    let style = { shape: 'RoundedBox', background: '#438dd5', color: '#ffffff' };

    const tags = element.tags?.split(',').map(t => t.trim()) || [];
    tags.forEach(tag => {
      const configStyle = config?.elementStyles?.find(s => s.tag === tag);
      if (configStyle) {
        style = { ...style, ...configStyle };
      } else if (defaultStyles[tag]) {
        style = { ...style, ...defaultStyles[tag] };
      }
    });

    return style;
  };

  const getRelationshipStyle = (relationship, config) => {
    const defaultStyle = { thickness: 2, color: '#707070', style: 'solid' };
    const tags = relationship.tags?.split(',').map(t => t.trim()) || [];

    let style = { ...defaultStyle };

    tags.forEach(tag => {
      const configStyle = config?.relationshipStyles?.find(s => s.tag === tag);
      if (configStyle) {
        style = { ...style, ...configStyle };
      }
    });

    return style;
  };

  const addDefinitions = (svg) => {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Solid arrowhead
    const markerSolid = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerSolid.setAttribute('id', 'arrowhead-solid');
    markerSolid.setAttribute('markerWidth', '12');
    markerSolid.setAttribute('markerHeight', '12');
    markerSolid.setAttribute('refX', '11');
    markerSolid.setAttribute('refY', '6');
    markerSolid.setAttribute('orient', 'auto');
    markerSolid.setAttribute('markerUnits', 'userSpaceOnUse');

    const polygonSolid = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygonSolid.setAttribute('points', '0 0, 12 6, 0 12');
    polygonSolid.setAttribute('fill', '#707070');
    markerSolid.appendChild(polygonSolid);
    defs.appendChild(markerSolid);

    // Dashed arrowhead
    const markerDashed = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerDashed.setAttribute('id', 'arrowhead-dashed');
    markerDashed.setAttribute('markerWidth', '12');
    markerDashed.setAttribute('markerHeight', '12');
    markerDashed.setAttribute('refX', '11');
    markerDashed.setAttribute('refY', '6');
    markerDashed.setAttribute('orient', 'auto');
    markerDashed.setAttribute('markerUnits', 'userSpaceOnUse');

    const polygonDashed = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygonDashed.setAttribute('points', '0 0, 12 6, 0 12');
    polygonDashed.setAttribute('fill', '#707070');
    markerDashed.appendChild(polygonDashed);
    defs.appendChild(markerDashed);

    svg.appendChild(defs);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const wrapText = (text, maxLength) => {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxLength) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    if (currentLine) lines.push(currentLine.trim());
    return lines;
  };

  // Element dragging handlers
  const handleElementMouseDown = (e, elementId) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only left mouse button

    setDraggingElement(elementId);
    setSelectedElement(elementId);

    const svgRect = svgRef.current.getBoundingClientRect();
    const svgPoint = {
      x: (e.clientX - svgRect.left - pan.x) / zoom,
      y: (e.clientY - svgRect.top - pan.y) / zoom
    };

    setElementDragStart({
      x: svgPoint.x - layout[elementId].x,
      y: svgPoint.y - layout[elementId].y
    });
  };

  const handleSvgMouseMove = (e) => {
    if (draggingElement) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const svgPoint = {
        x: (e.clientX - svgRect.left - pan.x) / zoom,
        y: (e.clientY - svgRect.top - pan.y) / zoom
      };

      setLayout(prev => ({
        ...prev,
        [draggingElement]: {
          ...prev[draggingElement],
          x: svgPoint.x - elementDragStart.x,
          y: svgPoint.y - elementDragStart.y
        }
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleSvgMouseUp = () => {
    setDraggingElement(null);
    setIsPanning(false);
  };

  // Canvas panning handlers
  const handleMouseDown = (e) => {
    if (e.button === 0 && !draggingElement) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedElement(null);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.3));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedElement(null);
  };

  const handleResetLayout = () => {
    setLayout({});
    setSelectedElement(null);
    setHasAutoFit(false);
  };

  const handleFitToScreen = () => {
    if (!containerRef.current || diagramDimensions.width === 0) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Calculate zoom to fit
    const zoomX = containerWidth / diagramDimensions.width;
    const zoomY = containerHeight / diagramDimensions.height;
    const fitZoom = Math.min(zoomX, zoomY) * 0.95; // 95% to add some margin

    // Center the diagram
    const finalZoom = Math.min(Math.max(fitZoom, 0.3), 3); // Clamp between 0.3 and 3
    setZoom(finalZoom);

    // Calculate pan to center
    const scaledWidth = diagramDimensions.width * finalZoom;
    const scaledHeight = diagramDimensions.height * finalZoom;
    const panX = (containerWidth - scaledWidth) / 2;
    const panY = (containerHeight - scaledHeight) / 2;

    setPan({ x: panX, y: panY });
    setSelectedElement(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button onClick={handleZoomIn} className={styles.controlBtn} title="Zoom In">
          <span className={styles.icon}>+</span>
        </button>
        <button onClick={handleZoomOut} className={styles.controlBtn} title="Zoom Out">
          <span className={styles.icon}>−</span>
        </button>
        <button onClick={handleFitToScreen} className={styles.controlBtn} title="Fit to Screen">
          <span className={styles.icon}>⛶</span>
        </button>
        <button onClick={handleReset} className={styles.controlBtn} title="Reset View">
          <span className={styles.icon}>⟲</span>
        </button>
        <button onClick={handleResetLayout} className={styles.controlBtn} title="Reset Layout">
          <span className={styles.icon}>⊞</span>
        </button>
        <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
        <span className={styles.helpText}>Drag boxes to reposition • Click background to pan</span>
      </div>
      <div
        ref={containerRef}
        className={styles.diagramContainer}
        onMouseDown={handleMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
      >
        <svg
          ref={svgRef}
          className={styles.diagram}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            cursor: isPanning ? 'grabbing' : draggingElement ? 'move' : 'grab'
          }}
        />
      </div>
    </div>
  );
};

export default C4DiagramRenderer;
