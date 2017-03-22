package io.typefox.sprotte.layout;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.eclipse.elk.core.IGraphLayoutEngine;
import org.eclipse.elk.core.RecursiveGraphLayoutEngine;
import org.eclipse.elk.core.data.ILayoutMetaDataProvider;
import org.eclipse.elk.core.data.LayoutMetaDataService;
import org.eclipse.elk.core.options.CoreOptions;
import org.eclipse.elk.core.util.BasicProgressMonitor;
import org.eclipse.elk.graph.ElkBendPoint;
import org.eclipse.elk.graph.ElkEdge;
import org.eclipse.elk.graph.ElkEdgeSection;
import org.eclipse.elk.graph.ElkGraphFactory;
import org.eclipse.elk.graph.ElkNode;
import org.eclipse.elk.graph.util.ElkGraphUtil;

import com.google.common.collect.Maps;

import io.typefox.sprotte.api.Point;
import io.typefox.sprotte.api.SEdge;
import io.typefox.sprotte.api.SGraph;
import io.typefox.sprotte.api.SModelElement;
import io.typefox.sprotte.api.SNode;

public class ElkLayoutEngine implements ILayoutEngine {
	
	public static void initialize(ILayoutMetaDataProvider ...providers) {
		LayoutMetaDataService metaDataService = LayoutMetaDataService.getInstance();
		metaDataService.registerLayoutMetaDataProvider(new CoreOptions());
		for (ILayoutMetaDataProvider p : providers) {
			metaDataService.registerLayoutMetaDataProvider(p);
		}
	}
	
	private IGraphLayoutEngine engine = new RecursiveGraphLayoutEngine();
	
	private ElkGraphFactory factory = ElkGraphFactory.eINSTANCE;
	
	@Override
	public void layout(SGraph sgraph) {
		LayoutContext context = transformGraph(sgraph);
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
		return elkGraph;
	}
	
	protected void processChildren(SModelElement element, ElkNode parent, LayoutContext context) {
		if (element.getChildren() != null) {
			for (SModelElement child : element.getChildren()) {
				if (child instanceof SNode) {
					SNode snode = (SNode) child;
					ElkNode elkNode = createNode(snode);
					elkNode.setParent(parent);
					context.nodeMap.put(snode, elkNode);
					processChildren(snode, elkNode, context);
				} else if (child instanceof SEdge) {
					SEdge sedge = (SEdge) child;
					ElkEdge elkEdge = createEdge(sedge);
					// The most suitable container for the edge is determined later
					context.edgeMap.put(sedge, elkEdge);
				}
			}
		}
	}
	
	protected void resolveReferences(LayoutContext context) {
		Map<String, ElkNode> id2NodeMap = Maps.newHashMapWithExpectedSize(context.nodeMap.size());
		for (Map.Entry<SNode, ElkNode> entry : context.nodeMap.entrySet()) {
			String id = entry.getKey().getId();
			if (id != null)
				id2NodeMap.put(id, entry.getValue());
		}
		for (Map.Entry<SEdge, ElkEdge> entry : context.edgeMap.entrySet()) {
			SEdge sedge = entry.getKey();
			ElkEdge elkEdge = entry.getValue();
			ElkNode source = id2NodeMap.get(sedge.getSourceId());
			if (source != null)
				elkEdge.getSources().add(source);
			ElkNode target = id2NodeMap.get(sedge.getTargetId());
			if (target != null)
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
		if (snode.getX() != null)
			elkNode.setX(snode.getX());
		if (snode.getY() != null)
			elkNode.setY(snode.getY());
		if (snode.getWidth() != null)
			elkNode.setWidth(snode.getWidth());
		if (snode.getHeight() != null)
			elkNode.setHeight(snode.getHeight());
		return elkNode;
	}
	
	protected ElkEdge createEdge(SEdge sedge) {
		ElkEdge elkEdge = factory.createElkEdge();
		elkEdge.setIdentifier(sedge.getId());
		// The source and target of the edge are resolved later
		return elkEdge;
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
			ElkNode elkNode = context.nodeMap.get(snode);
			if (elkNode != null)
				transferNodeLayout(snode, elkNode);
		} else if (element instanceof SEdge) {
			SEdge sedge = (SEdge) element;
			ElkEdge elkEdge = context.edgeMap.get(sedge);
			if (elkEdge != null)
				transferEdgeLayout(sedge, elkEdge);
		}
		if (element.getChildren() != null) {
			for (SModelElement child: element.getChildren()) {
				transferLayout(child, context);
			}
		}
	}
	
	protected void transferGraphLayout(SGraph sgraph, ElkNode elkGraph) {
//		sgraph.setWidth(elkGraph.getWidth());
//		sgraph.setHeight(elkGraph.getHeight());
		sgraph.setAutosize(false);
	}
	
	protected void transferNodeLayout(SNode snode, ElkNode elkNode) {
		snode.setX(elkNode.getX());
		snode.setY(elkNode.getY());
		snode.setWidth(elkNode.getWidth());
		snode.setHeight(elkNode.getHeight());
		snode.setAutosize(false);
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
		public final Map<SNode, ElkNode> nodeMap = Maps.newHashMap();
		public final Map<SEdge, ElkEdge> edgeMap = Maps.newHashMap();
	}

}
