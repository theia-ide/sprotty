/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.layout;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.eclipse.elk.core.IGraphLayoutEngine;
import org.eclipse.elk.core.RecursiveGraphLayoutEngine;
import org.eclipse.elk.core.data.ILayoutMetaDataProvider;
import org.eclipse.elk.core.data.LayoutMetaDataService;
import org.eclipse.elk.core.math.ElkPadding;
import org.eclipse.elk.core.options.CoreOptions;
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
import org.eclipse.emf.ecore.EObject;

import com.google.common.collect.Maps;

import io.typefox.sprotty.api.BoundsAware;
import io.typefox.sprotty.api.Dimension;
import io.typefox.sprotty.api.ILayoutEngine;
import io.typefox.sprotty.api.Layouting;
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
		LayoutContext context = new LayoutContext();
		context.sgraph = sgraph;
		ElkNode rootNode = createGraph(sgraph);
		context.elkGraph = rootNode;
		context.shapeMap.put(sgraph, rootNode);
		processChildren(sgraph, rootNode, context);
		resolveReferences(context);
		return context;
	}
	
	/**
	 * Create a root ELK node for the given sprotty graph.
	 */
	protected ElkNode createGraph(SGraph sgraph) {
		ElkNode elkGraph = factory.createElkNode();
		elkGraph.setIdentifier(SprottyLayoutConfigurator.toElkId(sgraph.getId()));
		elkGraph.setProperty(P_TYPE, sgraph.getType());
		return elkGraph;
	}
	
	/**
	 * Transform the children of a sprotty model element to their ELK graph counterparts.
	 */
	protected int processChildren(SModelElement sParent, ElkGraphElement elkParent, LayoutContext context) {
		int childrenCount = 0;
		if (sParent.getChildren() != null) {
			for (SModelElement schild : sParent.getChildren()) {
				context.parentMap.put(schild, sParent);
				ElkGraphElement elkChild = null;
				if (shouldInclude(schild, sParent, elkParent, context)) {
					if (schild instanceof SNode) {
						SNode snode = (SNode) schild;
						ElkNode elkNode = createNode(snode);
						if (elkParent instanceof ElkNode) {
							elkNode.setParent((ElkNode) elkParent);
							childrenCount++;
						}
						context.shapeMap.put(snode, elkNode);
						elkChild = elkNode;
					} else if (schild instanceof SPort) {
						SPort sport = (SPort) schild;
						ElkPort elkPort = createPort(sport);
						if (elkParent instanceof ElkNode) {
							elkPort.setParent((ElkNode) elkParent);
							childrenCount++;
						}
						context.shapeMap.put(sport, elkPort);
						elkChild = elkPort;
					} else if (schild instanceof SEdge) {
						SEdge sedge = (SEdge) schild;
						ElkEdge elkEdge = createEdge(sedge);
						// The most suitable container for the edge is determined later
						childrenCount++;
						context.edgeMap.put(sedge, elkEdge);
						elkChild = elkEdge;
					} else if (schild instanceof SLabel) {
						SLabel slabel = (SLabel) schild;
						ElkLabel elkLabel = createLabel(slabel);
						elkLabel.setParent(elkParent);
						childrenCount++;
						context.shapeMap.put(slabel, elkLabel);
						elkChild = elkLabel;
					}
				}
				int grandChildrenCount = processChildren(schild, elkChild != null ? elkChild : elkParent, context);
				childrenCount += grandChildrenCount;
				if (grandChildrenCount > 0 && sParent instanceof Layouting && schild instanceof BoundsAware) {
					handleClientLayout((BoundsAware) schild, (Layouting) sParent, elkParent, context);
				}
			}
		}
		return childrenCount;
	}
	
	/**
	 * Return true if the given model element should be included in the layout computation.
	 */
	protected boolean shouldInclude(SModelElement element, SModelElement sParent, ElkGraphElement elkParent, LayoutContext context) {
		if (element instanceof SNode || element instanceof SPort)
			// Nodes and ports can only be contained in a node
			return elkParent instanceof ElkNode;
		else if (element instanceof SEdge)
			// Edges are automatically put into their most suitable container
			return true;
		else if (sParent instanceof Layouting) {
			// If the parent has configured a client layout, we ignore its direct children in the server layout
			String layout = ((Layouting) sParent).getLayout();
			if (layout != null && !layout.isEmpty())
				return false;
		}
		return true;
	}
	
	/**
	 * Consider the layout computed by the client by configuring appropriate ELK layout options.
	 */
	protected void handleClientLayout(BoundsAware element, Layouting sParent, ElkGraphElement elkParent, LayoutContext context) {
		String layout = sParent.getLayout();
		if (layout != null && !layout.isEmpty()) {
			Point position = element.getPosition();
			if (position == null)
				position = new Point();
			Dimension size = element.getSize();
			if (size == null)
				size = new Dimension();
			ElkPadding padding = new ElkPadding();
			padding.setLeft(position.getX());
			padding.setTop(position.getY());
			if (sParent instanceof BoundsAware) {
				Dimension parentSize = ((BoundsAware) sParent).getSize();
				if (parentSize != null) {
					padding.setRight(parentSize.getWidth() - position.getX() - size.getWidth());
					padding.setBottom(parentSize.getHeight() - position.getY() - size.getHeight());
				}
			}
			if (elkParent.hasProperty(CoreOptions.PADDING)) {
				// Add the previously computed padding to the current one.
				// NOTE: This makes sense only if there are multiple _nested_ layouting containers of which the deepest
				//       one contains actual graph elements. Multiple compartments that contain graph elements but are
				//       not nested into each other cannot be mapped properly to the ELK graph format.
				padding.add(elkParent.getProperty(CoreOptions.PADDING));
			}
			elkParent.setProperty(CoreOptions.PADDING, padding);
		}
	}
	
	/**
	 * Resolve cross-references in the ELK graph.
	 */
	protected void resolveReferences(LayoutContext context) {
		Map<String, ElkConnectableShape> id2NodeMap = Maps.newHashMapWithExpectedSize(context.shapeMap.size());
		for (Map.Entry<SModelElement, ElkShape> entry : context.shapeMap.entrySet()) {
			String id = entry.getKey().getId();
			if (id != null && entry.getValue() instanceof ElkConnectableShape)
				id2NodeMap.put(id, (ElkConnectableShape) entry.getValue());
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
		elkNode.setIdentifier(SprottyLayoutConfigurator.toElkId(snode.getId()));
		elkNode.setProperty(P_TYPE, snode.getType());
		applyBounds(snode, elkNode);
		return elkNode;
	}
	
	/**
	 * Create an ELK port for the given sprotty port.
	 */
	protected ElkPort createPort(SPort sport) {
		ElkPort elkPort = factory.createElkPort();
		elkPort.setIdentifier(SprottyLayoutConfigurator.toElkId(sport.getId()));
		elkPort.setProperty(P_TYPE, sport.getType());
		applyBounds(sport, elkPort);
		return elkPort;
	}
	
	/**
	 * Create an ELK edge for the given sprotty edge.
	 */
	protected ElkEdge createEdge(SEdge sedge) {
		ElkEdge elkEdge = factory.createElkEdge();
		elkEdge.setIdentifier(SprottyLayoutConfigurator.toElkId(sedge.getId()));
		elkEdge.setProperty(P_TYPE, sedge.getType());
		// The source and target of the edge are resolved later
		return elkEdge;
	}
	
	/**
	 * Create an ELK label for the given sprotty label.
	 */
	protected ElkLabel createLabel(SLabel slabel) {
		ElkLabel elkLabel = factory.createElkLabel();
		elkLabel.setIdentifier(SprottyLayoutConfigurator.toElkId(slabel.getId()));
		elkLabel.setProperty(P_TYPE, slabel.getType());
		elkLabel.setText(slabel.getText());
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
			transferGraphLayout((SGraph) element, context.elkGraph, context);
		} else if (element instanceof SNode) {
			SNode snode = (SNode) element;
			ElkNode elkNode = (ElkNode) context.shapeMap.get(snode);
			if (elkNode != null)
				transferNodeLayout(snode, elkNode, context);
		} else if (element instanceof SPort) {
			SPort sport = (SPort) element;
			ElkPort elkPort = (ElkPort) context.shapeMap.get(sport);
			if (elkPort != null)
				transferPortLayout(sport, elkPort, context);
		} else if (element instanceof SEdge) {
			SEdge sedge = (SEdge) element;
			ElkEdge elkEdge = context.edgeMap.get(sedge);
			if (elkEdge != null)
				transferEdgeLayout(sedge, elkEdge, context);
		} else if (element instanceof SLabel) {
			SLabel slabel = (SLabel) element;
			ElkLabel elkLabel = (ElkLabel) context.shapeMap.get(slabel);
			if (elkLabel != null)
				transferLabelLayout(slabel, elkLabel, context);
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
	protected void transferGraphLayout(SGraph sgraph, ElkNode elkGraph, LayoutContext context) {
		sgraph.setPosition(new Point(elkGraph.getX(), elkGraph.getY()));
		sgraph.setSize(new Dimension(elkGraph.getWidth(), elkGraph.getHeight()));
	}
	
	/**
	 * Apply the computed ELK layout to the given sprotty node.
	 */
	protected void transferNodeLayout(SNode snode, ElkNode elkNode, LayoutContext context) {
		Point offset = getOffset(snode, elkNode, context);
		snode.setPosition(new Point(elkNode.getX() + offset.getX(), elkNode.getY() + offset.getY()));
		snode.setSize(new Dimension(elkNode.getWidth(), elkNode.getHeight()));
	}
	
	/**
	 * Apply the computed ELK layout to the given sprotty port.
	 */
	protected void transferPortLayout(SPort sport, ElkPort elkPort, LayoutContext context) {
		Point offset = getOffset(sport, elkPort, context);
		sport.setPosition(new Point(elkPort.getX() + offset.getX(), elkPort.getY() + offset.getY()));
		sport.setSize(new Dimension(elkPort.getWidth(), elkPort.getHeight()));
	}
	
	/**
	 * Apply the computed ELK layout to the given sprotty label.
	 */
	protected void transferLabelLayout(SLabel slabel, ElkLabel elkLabel, LayoutContext context) {
		Point offset = getOffset(slabel, elkLabel, context);
		slabel.setPosition(new Point(elkLabel.getX() + offset.getX(), elkLabel.getY() + offset.getY()));
		slabel.setSize(new Dimension(elkLabel.getWidth(), elkLabel.getHeight()));
	}
	
	/**
	 * Apply the computed ELK layout to the given sprotty edge.
	 */
	protected void transferEdgeLayout(SEdge sedge, ElkEdge elkEdge, LayoutContext context) {
		if (!elkEdge.getSections().isEmpty()) {
			Point offset = getOffset(sedge, elkEdge, context);
			ElkEdgeSection section = elkEdge.getSections().get(0);
			List<Point> routingPoints = new ArrayList<>();
			Point p1 = new Point(section.getStartX() + offset.getX(), section.getStartY() + offset.getY());
			routingPoints.add(p1);
			for (ElkBendPoint bendPoint : section.getBendPoints()) {
				Point p2 = new Point(bendPoint.getX() + offset.getX(), bendPoint.getY() + offset.getY());
				routingPoints.add(p2);
			}
			Point p3 = new Point(section.getEndX() + offset.getX(), section.getEndY() + offset.getY());
			routingPoints.add(p3);
			sedge.setRoutingPoints(routingPoints);
		}
	}
	
	/**
	 * Compute the offset for applying a computed ELK layout to a sprotty model element. Such an offset can
	 * occur when the two elements are put into containers with different coordinate systems.
	 */
	protected Point getOffset(SModelElement selem, ElkGraphElement elkElem, LayoutContext context) {
		// Build a list of parents of the sprotty model element
		LinkedList<SModelElement> sParents = null;
		SModelElement currentSParent = selem;
		while (currentSParent != null) {
			currentSParent = context.parentMap.get(currentSParent);
			if (currentSParent != null) {
				ElkShape shapeForSParent = context.shapeMap.get(currentSParent);
				if (shapeForSParent == elkElem.eContainer()) {
					// Shortcut: the current sprotty parent matches the ELK container 
					double x = 0, y = 0;
					if (sParents != null) {
						for (SModelElement sParent : sParents) {
							if (sParent instanceof BoundsAware) {
								Point position = ((BoundsAware) sParent).getPosition();
								x -= position.getX();
								y -= position.getY();
							}
						}
					}
					return new Point(x, y);
				}
				if (sParents == null)
					sParents = new LinkedList<>();
				sParents.addFirst(currentSParent);
			}
		}
		
		// Build a list of parents of the ELK graph element
		LinkedList<EObject> elkParents = new LinkedList<>();
		EObject currentElkParent = elkElem;
		while (currentElkParent != null) {
			currentElkParent = currentElkParent.eContainer();
			if (currentElkParent != null) {
				elkParents.addFirst(currentElkParent);
			}
		}
		
		boolean foundMismatch = false;
		do {
			// Find the next sprotty parent that is connected to a shape
			ElkShape shapeForSParent = null;
			int nextSParentIndex = 0;
			while (shapeForSParent == null && nextSParentIndex < sParents.size()) {
				shapeForSParent = context.shapeMap.get(sParents.get(nextSParentIndex++));
			}
			// Find the next ELK parent that is a shape
			ElkShape elkParentShape = null;
			while (elkParentShape == null && !elkParents.isEmpty()) {
				EObject elkParent = elkParents.getFirst();
				if (elkParent instanceof ElkShape)
					elkParentShape = (ElkShape) elkParent;
				else
					elkParents.removeFirst();
			}
			// Remove the current parents if they match
			if (shapeForSParent != null && shapeForSParent == elkParentShape) {
				for (int i = 0; i < nextSParentIndex; i++) {
					sParents.removeFirst();
				}
				elkParents.removeFirst();
			} else {
				foundMismatch = true;
			}
		} while (!foundMismatch && !sParents.isEmpty() && !elkParents.isEmpty());
		
		double x = 0, y = 0;
		// Add the remaining ELK shapes to the offset
		for (EObject elkParent : elkParents) {
			if (elkParent instanceof ElkShape) {
				ElkShape elkShape = (ElkShape) elkParent;
				x += elkShape.getX();
				y += elkShape.getY();
			}
		}
		// Subtract the remaining sprotty shapes from the offset
		for (SModelElement sParent : sParents) {
			if (sParent instanceof BoundsAware) {
				Point position = ((BoundsAware) sParent).getPosition();
				x -= position.getX();
				y -= position.getY();
			}
		}
		return new Point(x, y);
	}
	
	/**
	 * Data required for applying the computed ELK layout to the original sprotty model.
	 */
	protected static class LayoutContext {
		public SGraph sgraph;
		public ElkNode elkGraph;
		public final Map<SModelElement, SModelElement> parentMap = Maps.newHashMap();
		public final Map<SModelElement, ElkShape> shapeMap = Maps.newLinkedHashMap();
		public final Map<SEdge, ElkEdge> edgeMap = Maps.newLinkedHashMap();
	}

}
