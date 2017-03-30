package io.typefox.sprotty.layout;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.eclipse.elk.core.IGraphLayoutEngine;
import org.eclipse.elk.core.RecursiveGraphLayoutEngine;
import org.eclipse.elk.core.data.ILayoutMetaDataProvider;
import org.eclipse.elk.core.data.LayoutMetaDataService;
import org.eclipse.elk.core.options.CoreOptions;
import org.eclipse.elk.core.util.BasicProgressMonitor;
import org.eclipse.elk.core.util.ElkUtil;
import org.eclipse.elk.graph.ElkBendPoint;
import org.eclipse.elk.graph.ElkEdge;
import org.eclipse.elk.graph.ElkEdgeSection;
import org.eclipse.elk.graph.ElkGraphFactory;
import org.eclipse.elk.graph.ElkNode;
import org.eclipse.elk.graph.properties.IProperty;
import org.eclipse.elk.graph.properties.Property;
import org.eclipse.elk.graph.util.ElkGraphUtil;

import com.google.common.collect.Maps;

import io.typefox.sprotty.api.Bounds;
import io.typefox.sprotty.api.Point;
import io.typefox.sprotty.api.SEdge;
import io.typefox.sprotty.api.SGraph;
import io.typefox.sprotty.api.SModelElement;
import io.typefox.sprotty.api.SNode;

public class ElkLayoutEngine implements ILayoutEngine {
	
	public static final IProperty<String> P_TYPE = new Property<>("io.typefox.sprotty.layout.type");
	
	public static void initialize(ILayoutMetaDataProvider ...providers) {
		LayoutMetaDataService metaDataService = LayoutMetaDataService.getInstance();
		metaDataService.registerLayoutMetaDataProvider(new CoreOptions());
		for (ILayoutMetaDataProvider p : providers) {
			metaDataService.registerLayoutMetaDataProvider(p);
		}
	}
	
	private IGraphLayoutEngine engine = new RecursiveGraphLayoutEngine();
	
	protected final ElkGraphFactory factory = ElkGraphFactory.eINSTANCE;
	
	@Override
	public void layout(SGraph sgraph) {
		layout(sgraph, null);
	}

	@Override
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
			resolveReferences(entry.getValue(), entry.getKey(), id2NodeMap, context);
		}
	}
	
	protected void resolveReferences(ElkEdge elkEdge, SEdge sedge, Map<String, ElkNode> id2NodeMap, LayoutContext context) {
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
	
	protected ElkNode createNode(SNode snode) {
		ElkNode elkNode = factory.createElkNode();
		elkNode.setIdentifier(snode.getId());
		elkNode.setProperty(P_TYPE, snode.getType());
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
		elkEdge.setProperty(P_TYPE, sedge.getType());
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
		Bounds bounds = new Bounds();
		bounds.setX(elkGraph.getX());
		bounds.setY(elkGraph.getY());
		bounds.setWidth(elkGraph.getWidth());
		bounds.setHeight(elkGraph.getHeight());
		sgraph.setBounds(bounds);
	}
	
	protected void transferNodeLayout(SNode snode, ElkNode elkNode) {
		snode.setX(elkNode.getX());
		snode.setY(elkNode.getY());
		snode.setWidth(elkNode.getWidth());
		snode.setHeight(elkNode.getHeight());
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
