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

public class ElkLayoutEngine implements ILayoutEngine {
	
	public static final IProperty<String> P_TYPE = new Property<>("io.typefox.sprotty.layout.type");
	
	public static void initialize(ILayoutMetaDataProvider ...providers) {
		LayoutMetaDataService.getInstance().registerLayoutMetaDataProviders(providers);
	}
	
	private IGraphLayoutEngine engine = new RecursiveGraphLayoutEngine();
	
	protected final ElkGraphFactory factory = ElkGraphFactory.eINSTANCE;
	
	@Override
	public void layout(SModelRoot root) {
		if (root instanceof SGraph) {
			layout((SGraph) root, null);
		}
	}

	public void layout(SGraph sgraph, SprottyLayoutConfigurator configurator) {
		LayoutContext context = transformGraph(sgraph);
		if (configurator != null) {
			ElkUtil.applyVisitors(context.elkGraph, configurator);
		}
		applyEngine(context.elkGraph);
		transferLayout(context);
	}
	
	protected LayoutContext transformGraph(SGraph sgraph) {
		LayoutContext result = new LayoutContext();
		result.sgraph = sgraph;
		ElkNode rootNode = createGraph(sgraph);
		result.elkGraph = rootNode;
		processChildren(sgraph, rootNode, result);
		resolveReferences(result);
		return result;
	}
	
	protected ElkNode createGraph(SGraph sgraph) {
		ElkNode elkGraph = factory.createElkNode();
		elkGraph.setIdentifier(sgraph.getId());
		elkGraph.setProperty(P_TYPE, sgraph.getType());
		return elkGraph;
	}
	
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
	
	protected boolean shouldInclude(SModelElement element, SModelElement parent, LayoutContext context) {
		if (element instanceof SLabel)
			// Omit node labels, since these are handled by the sprotty client layouts
			return !(parent instanceof SNode);
		else
			// All other graph elements can only be contained in a node or in the graph (root node)
			return parent instanceof SNode || parent instanceof SGraph;
	}
	
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
	
	protected ElkNode createNode(SNode snode) {
		ElkNode elkNode = factory.createElkNode();
		elkNode.setIdentifier(snode.getId());
		elkNode.setProperty(P_TYPE, snode.getType());
		applyBounds(snode, elkNode);
		return elkNode;
	}
	
	protected ElkPort createPort(SPort sport) {
		ElkPort elkPort = factory.createElkPort();
		elkPort.setIdentifier(sport.getId());
		elkPort.setProperty(P_TYPE, sport.getType());
		applyBounds(sport, elkPort);
		return elkPort;
	}
	
	protected ElkEdge createEdge(SEdge sedge) {
		ElkEdge elkEdge = factory.createElkEdge();
		elkEdge.setIdentifier(sedge.getId());
		elkEdge.setProperty(P_TYPE, sedge.getType());
		// The source and target of the edge are resolved later
		return elkEdge;
	}
	
	protected ElkLabel createLabel(SLabel slabel) {
		ElkLabel elkLabel = factory.createElkLabel();
		elkLabel.setIdentifier(slabel.getId());
		elkLabel.setProperty(P_TYPE, slabel.getType());
		applyBounds(slabel, elkLabel);
		return elkLabel;
	}
	
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
	
	public void setEngine(IGraphLayoutEngine engine) {
		this.engine = engine;
	}
	
	protected void applyEngine(ElkNode elkGraph) {
		engine.layout(elkGraph, new BasicProgressMonitor());
	}
	
	protected void transferLayout(LayoutContext context) {
		transferLayout(context.sgraph, context);
	}
	
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
	
	protected void transferGraphLayout(SGraph sgraph, ElkNode elkGraph) {
		sgraph.setPosition(new Point(elkGraph.getX(), elkGraph.getY()));
		sgraph.setSize(new Dimension(elkGraph.getWidth(), elkGraph.getHeight()));
	}
	
	protected void transferNodeLayout(SNode snode, ElkNode elkNode) {
		snode.setPosition(new Point(elkNode.getX(), elkNode.getY()));
		snode.setSize(new Dimension(elkNode.getWidth(), elkNode.getHeight()));
	}
	
	protected void transferPortLayout(SPort sport, ElkPort elkPort) {
		sport.setPosition(new Point(elkPort.getX(), elkPort.getY()));
		sport.setSize(new Dimension(elkPort.getWidth(), elkPort.getHeight()));
	}
	
	protected void transferLabelLayout(SLabel slabel, ElkLabel elkLabel) {
		slabel.setPosition(new Point(elkLabel.getX(), elkLabel.getY()));
		slabel.setSize(new Dimension(elkLabel.getWidth(), elkLabel.getHeight()));
	}
	
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
	
	protected static class LayoutContext {
		public SGraph sgraph;
		public ElkNode elkGraph;
		public final Map<SModelElement, ElkConnectableShape> connectableMap = Maps.newLinkedHashMap();
		public final Map<SEdge, ElkEdge> edgeMap = Maps.newLinkedHashMap();
		public final Map<SLabel, ElkLabel> labelMap = Maps.newLinkedHashMap();
	}

}
