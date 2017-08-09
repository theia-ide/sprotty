/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.layout;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.eclipse.elk.core.IGraphLayoutEngine;
import org.eclipse.elk.core.RecursiveGraphLayoutEngine;
import org.eclipse.elk.core.data.ILayoutMetaDataProvider;
import org.eclipse.elk.core.data.LayoutMetaDataService;
import org.eclipse.elk.core.util.BasicProgressMonitor;
import org.eclipse.elk.core.util.ElkUtil;
import org.eclipse.elk.graph.ElkBendPoint;
import org.eclipse.elk.graph.ElkConnectableShape;
import org.eclipse.elk.graph.ElkEdge;
import org.eclipse.elk.graph.ElkEdgeSection;
import org.eclipse.elk.graph.ElkGraphElement;
import org.eclipse.elk.graph.ElkGraphFactory;
import org.eclipse.elk.graph.ElkLabel;
import org.eclipse.elk.graph.ElkNode;
import org.eclipse.elk.graph.ElkPort;
import org.eclipse.elk.graph.ElkShape;
import org.eclipse.elk.graph.properties.IProperty;
import org.eclipse.elk.graph.properties.Property;
import org.eclipse.elk.graph.util.ElkGraphUtil;

import com.google.common.collect.Maps;

import io.typefox.sprotty.api.BoundsAware;
import io.typefox.sprotty.api.Dimension;
import io.typefox.sprotty.api.ILayoutEngine;
import io.typefox.sprotty.api.Point;
import io.typefox.sprotty.api.SEdge;
import io.typefox.sprotty.api.SGraph;
import io.typefox.sprotty.api.SLabel;
import io.typefox.sprotty.api.SModelElement;
import io.typefox.sprotty.api.SModelRoot;
import io.typefox.sprotty.api.SNode;
import io.typefox.sprotty.api.SPort;

/**
 * Layout engine that uses the <a href="https://www.eclipse.org/elk/">Eclipse Layout Kernel (ELK)</a>.
 * 
 * <p>The layout engine must be initialized once during the lifecycle of the application by calling
 * {@link #initialize(ILayoutMetaDataProvider...)}. The arguments of that method should be all meta data
 * providers of the layout algorithms that should be used by this layout engine,
 * e.g. {@link org.eclipse.elk.alg.layered.options.LayeredMetaDataProvider}.</p>
 */
public class ElkLayoutEngine implements ILayoutEngine {
	
	public static final IProperty<String> P_TYPE = new Property<>("io.typefox.sprotty.layout.type");
	
	public static void initialize(ILayoutMetaDataProvider ...providers) {
		LayoutMetaDataService.getInstance().registerLayoutMetaDataProviders(providers);
	}
	
	private IGraphLayoutEngine engine = new RecursiveGraphLayoutEngine();
	
	protected final ElkGraphFactory factory = ElkGraphFactory.eINSTANCE;
	
	/**
	 * Compute a layout for a graph. The default implementation uses only default settings for all layout
	 * options (see <a href="https://www.eclipse.org/elk/reference.html">layout options reference</a>).
	 * Override this in a subclass in order to customize the layout for your model using a
	 * {@link SprottyLayoutConfigurator}.
	 */
	@Override
	public void layout(SModelRoot root) {
		if (root instanceof SGraph) {
			layout((SGraph) root, null);
		}
	}

	/**
	 * Compute a layout for a graph with the given configurator (or {@code null} to use only default settings).
	 */
	public void layout(SGraph sgraph, SprottyLayoutConfigurator configurator) {
		LayoutContext context = transformGraph(sgraph);
		if (configurator != null) {
			ElkUtil.applyVisitors(context.elkGraph, configurator);
		}
		applyEngine(context.elkGraph);
		transferLayout(context);
	}
	
	/**
	 * Transform a sprotty graph to an ELK graph, including all contents.
	 */
	protected LayoutContext transformGraph(SGraph sgraph) {
		LayoutContext result = new LayoutContext();
		result.sgraph = sgraph;
		ElkNode rootNode = createGraph(sgraph);
		result.elkGraph = rootNode;
		processChildren(sgraph, rootNode, result);
		resolveReferences(result);
		return result;
	}
	
	/**
	 * Create a root ELK node for the given sprotty graph.
	 */
	protected ElkNode createGraph(SGraph sgraph) {
		ElkNode elkGraph = factory.createElkNode();
		elkGraph.setIdentifier(sgraph.getId());
		elkGraph.setProperty(P_TYPE, sgraph.getType());
		return elkGraph;
	}
	
	/**
	 * Transform the children of a sprotty model element to their ELK graph counterparts.
	 */
	protected void processChildren(SModelElement element, ElkGraphElement parent, LayoutContext context) {
		if (element.getChildren() != null) {
			for (SModelElement schild : element.getChildren()) {
				if (shouldInclude(schild, element, context)) {
					ElkGraphElement elkChild = null;
					if (schild instanceof SNode) {
						SNode snode = (SNode) schild;
						ElkNode elkNode = createNode(snode);
						if (parent instanceof ElkNode)
							elkNode.setParent((ElkNode) parent);
						context.connectableMap.put(snode, elkNode);
						elkChild = elkNode;
					} else if (schild instanceof SPort) {
						SPort sport = (SPort) schild;
						ElkPort elkPort = createPort(sport);
						if (parent instanceof ElkNode)
							elkPort.setParent((ElkNode) parent);
						context.connectableMap.put(sport, elkPort);
						elkChild = elkPort;
					} else if (schild instanceof SEdge) {
						SEdge sedge = (SEdge) schild;
						ElkEdge elkEdge = createEdge(sedge);
						// The most suitable container for the edge is determined later
						context.edgeMap.put(sedge, elkEdge);
						elkChild = elkEdge;
					} else if (schild instanceof SLabel) {
						SLabel slabel = (SLabel) schild;
						ElkLabel elkLabel = createLabel(slabel);
						elkLabel.setParent(parent);
						context.labelMap.put(slabel, elkLabel);
						elkChild = elkLabel;
					}
					if (elkChild != null) {
						processChildren(schild, elkChild, context);
					}
				}
			}
		}
	}
	
	/**
	 * Return true if the given model element should be included in the layout computation.
	 */
	protected boolean shouldInclude(SModelElement element, SModelElement parent, LayoutContext context) {
		if (element instanceof SLabel)
			// Omit node labels, since these are handled by the sprotty client layouts
			return !(parent instanceof SNode);
		else
			// All other graph elements can only be contained in a node or in the graph (root node)
			return parent instanceof SNode || parent instanceof SGraph;
	}
	
	/**
	 * Resolve cross-references in the ELK graph.
	 */
	protected void resolveReferences(LayoutContext context) {
		Map<String, ElkConnectableShape> id2NodeMap = Maps.newHashMapWithExpectedSize(context.connectableMap.size());
		for (Map.Entry<SModelElement, ElkConnectableShape> entry : context.connectableMap.entrySet()) {
			String id = entry.getKey().getId();
			if (id != null)
				id2NodeMap.put(id, entry.getValue());
		}
		for (Map.Entry<SEdge, ElkEdge> entry : context.edgeMap.entrySet()) {
			resolveReferences(entry.getValue(), entry.getKey(), id2NodeMap, context);
		}
	}
	
	/**
	 * Resolve the source and target cross-references for the given ELK edge.
	 */
	protected void resolveReferences(ElkEdge elkEdge, SEdge sedge, Map<String, ElkConnectableShape> id2NodeMap, LayoutContext context) {
		ElkConnectableShape source = id2NodeMap.get(sedge.getSourceId());
		ElkConnectableShape target = id2NodeMap.get(sedge.getTargetId());
		if (source != null && target != null) {
			elkEdge.getSources().add(source);
			elkEdge.getTargets().add(target);
			ElkNode container = ElkGraphUtil.findBestEdgeContainment(elkEdge);
			if (container != null)
				elkEdge.setContainingNode(container);
			else
				elkEdge.setContainingNode(context.elkGraph);
		}
	}
	
	/**
	 * Create an ELK node for the given sprotty node.
	 */
	protected ElkNode createNode(SNode snode) {
		ElkNode elkNode = factory.createElkNode();
		elkNode.setIdentifier(snode.getId());
		elkNode.setProperty(P_TYPE, snode.getType());
		applyBounds(snode, elkNode);
		return elkNode;
	}
	
	/**
	 * Create an ELK port for the given sprotty port.
	 */
	protected ElkPort createPort(SPort sport) {
		ElkPort elkPort = factory.createElkPort();
		elkPort.setIdentifier(sport.getId());
		elkPort.setProperty(P_TYPE, sport.getType());
		applyBounds(sport, elkPort);
		return elkPort;
	}
	
	/**
	 * Create an ELK edge for the given sprotty edge.
	 */
	protected ElkEdge createEdge(SEdge sedge) {
		ElkEdge elkEdge = factory.createElkEdge();
		elkEdge.setIdentifier(sedge.getId());
		elkEdge.setProperty(P_TYPE, sedge.getType());
		// The source and target of the edge are resolved later
		return elkEdge;
	}
	
	/**
	 * Create an ELK label for the given sprotty label.
	 */
	protected ElkLabel createLabel(SLabel slabel) {
		ElkLabel elkLabel = factory.createElkLabel();
		elkLabel.setIdentifier(slabel.getId());
		elkLabel.setProperty(P_TYPE, slabel.getType());
		applyBounds(slabel, elkLabel);
		return elkLabel;
	}
	
	/**
	 * Apply the bounds of the given bounds-aware element to an ELK shape (node, port, or label).
	 */
	protected void applyBounds(BoundsAware bounds, ElkShape elkShape) {
		Point position = bounds.getPosition();
		if (position != null) {
			elkShape.setX(position.getX());
			elkShape.setY(position.getY());
		}
		Dimension size = bounds.getSize();
		if (size != null) {
			if (size.getWidth() >= 0)
				elkShape.setWidth(size.getWidth());
			if (size.getHeight() >= 0)
				elkShape.setHeight(size.getHeight());
		}
	}
	
	/**
	 * Set the graph layout engine to invoke in {@link #applyEngine(ElkNode)}. The default is
	 * the {@link RecursiveGraphLayoutEngine}, which determines the layout algorithm to apply to each
	 * composite node based on the {@link org.eclipse.elk.core.options.CoreOptions#ALGORITHM} option.
	 * This requires the meta data providers of the referenced algorithms to be registered
	 * using {@link #initialize(ILayoutMetaDataProvider...)} before any layout is performed, e.g. on
	 * application start. Alternatively, you can use a specific layout algorithm directly, e.g.
	 * {@link org.eclipse.elk.alg.layered.LayeredLayoutProvider}.
	 */
	public void setEngine(IGraphLayoutEngine engine) {
		if (engine == null)
			throw new NullPointerException();
		this.engine = engine;
	}
	
	public IGraphLayoutEngine getEngine() {
		return engine;
	}
	
	/**
	 * Apply the layout engine that has been configured with {@link #setEngine(IGraphLayoutEngine)}.
	 */
	protected void applyEngine(ElkNode elkGraph) {
		getEngine().layout(elkGraph, new BasicProgressMonitor());
	}
	
	/**
	 * Transfer the computed ELK layout back to the original sprotty graph.
	 */
	protected void transferLayout(LayoutContext context) {
		transferLayout(context.sgraph, context);
	}
	
	/**
	 * Apply the computed ELK layout to the given model element.
	 */
	protected void transferLayout(SModelElement element, LayoutContext context) {
		if (element instanceof SGraph) {
			transferGraphLayout((SGraph) element, context.elkGraph);
		} else if (element instanceof SNode) {
			SNode snode = (SNode) element;
			ElkNode elkNode = (ElkNode) context.connectableMap.get(snode);
			if (elkNode != null)
				transferNodeLayout(snode, elkNode);
		} else if (element instanceof SPort) {
			SPort sport = (SPort) element;
			ElkPort elkPort = (ElkPort) context.connectableMap.get(sport);
			if (elkPort != null)
				transferPortLayout(sport, elkPort);
		} else if (element instanceof SEdge) {
			SEdge sedge = (SEdge) element;
			ElkEdge elkEdge = context.edgeMap.get(sedge);
			if (elkEdge != null)
				transferEdgeLayout(sedge, elkEdge);
		} else if (element instanceof SLabel) {
			SLabel slabel = (SLabel) element;
			ElkLabel elkLabel = context.labelMap.get(slabel);
			if (elkLabel != null)
				transferLabelLayout(slabel, elkLabel);
		}
		if (element.getChildren() != null) {
			for (SModelElement child: element.getChildren()) {
				transferLayout(child, context);
			}
		}
	}
	
	/**
	 * Apply the computed ELK layout to the given sprotty graph.
	 */
	protected void transferGraphLayout(SGraph sgraph, ElkNode elkGraph) {
		sgraph.setPosition(new Point(elkGraph.getX(), elkGraph.getY()));
		sgraph.setSize(new Dimension(elkGraph.getWidth(), elkGraph.getHeight()));
	}
	
	/**
	 * Apply the computed ELK layout to the given sprotty node.
	 */
	protected void transferNodeLayout(SNode snode, ElkNode elkNode) {
		snode.setPosition(new Point(elkNode.getX(), elkNode.getY()));
		snode.setSize(new Dimension(elkNode.getWidth(), elkNode.getHeight()));
	}
	
	/**
	 * Apply the computed ELK layout to the given sprotty port.
	 */
	protected void transferPortLayout(SPort sport, ElkPort elkPort) {
		sport.setPosition(new Point(elkPort.getX(), elkPort.getY()));
		sport.setSize(new Dimension(elkPort.getWidth(), elkPort.getHeight()));
	}
	
	/**
	 * Apply the computed ELK layout to the given sprotty label.
	 */
	protected void transferLabelLayout(SLabel slabel, ElkLabel elkLabel) {
		slabel.setPosition(new Point(elkLabel.getX(), elkLabel.getY()));
		slabel.setSize(new Dimension(elkLabel.getWidth(), elkLabel.getHeight()));
	}
	
	/**
	 * Apply the computed ELK layout to the given sprotty edge.
	 */
	protected void transferEdgeLayout(SEdge sedge, ElkEdge elkEdge) {
		if (!elkEdge.getSections().isEmpty()) {
			ElkEdgeSection section = elkEdge.getSections().get(0);
			List<Point> routingPoints = new ArrayList<>();
			Point p1 = new Point();
			p1.setX(section.getStartX());
			p1.setY(section.getStartY());
			routingPoints.add(p1);
			for (ElkBendPoint bendPoint : section.getBendPoints()) {
				Point p2 = new Point();
				p2.setX(bendPoint.getX());
				p2.setY(bendPoint.getY());
				routingPoints.add(p2);
			}
			Point p3 = new Point();
			p3.setX(section.getEndX());
			p3.setY(section.getEndY());
			routingPoints.add(p3);
			sedge.setRoutingPoints(routingPoints);
		}
	}
	
	/**
	 * Data required for applying the computed ELK layout to the original sprotty model.
	 */
	protected static class LayoutContext {
		public SGraph sgraph;
		public ElkNode elkGraph;
		public final Map<SModelElement, ElkConnectableShape> connectableMap = Maps.newLinkedHashMap();
		public final Map<SEdge, ElkEdge> edgeMap = Maps.newLinkedHashMap();
		public final Map<SLabel, ElkLabel> labelMap = Maps.newLinkedHashMap();
	}

}
