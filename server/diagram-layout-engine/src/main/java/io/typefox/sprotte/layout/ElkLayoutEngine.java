package io.typefox.sprotte.layout;

import java.util.Map;

import org.eclipse.elk.core.IGraphLayoutEngine;
import org.eclipse.elk.core.RecursiveGraphLayoutEngine;
import org.eclipse.elk.core.data.ILayoutMetaDataProvider;
import org.eclipse.elk.core.data.LayoutMetaDataService;
import org.eclipse.elk.core.options.CoreOptions;
import org.eclipse.elk.core.util.BasicProgressMonitor;
import org.eclipse.elk.graph.ElkEdge;
import org.eclipse.elk.graph.ElkGraphFactory;
import org.eclipse.elk.graph.ElkNode;
import org.eclipse.elk.graph.util.ElkGraphUtil;

import com.google.common.collect.Maps;

import io.typefox.sprotte.api.SEdge;
import io.typefox.sprotte.api.SModelElement;
import io.typefox.sprotte.api.SModelRoot;
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
	public void layout(SModelRoot sgraph) {
		LayoutContext context = transformGraph(sgraph);
		applyEngine(context.elkGraph);
		transferLayout(context);
	}
	
	protected LayoutContext transformGraph(SModelRoot sgraph) {
		LayoutContext result = new LayoutContext();
		result.sgraph = sgraph;
		ElkNode rootNode = factory.createElkNode();
		rootNode.setIdentifier(sgraph.getId());
		result.elkGraph = rootNode;
		processChildren(sgraph, rootNode, result);
		resolveReferences(result);
		return result;
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
		for (SModelElement element: context.sgraph.getChildren()) {
			if (element instanceof SNode)
				transferLayout((SNode) element, context);
		}
	}
	
	protected void transferLayout(SNode snode, LayoutContext context) {
		ElkNode elkNode = context.nodeMap.get(snode);
		if (elkNode != null) {
			snode.setX(elkNode.getX());
			snode.setY(elkNode.getY());
			snode.setWidth(elkNode.getWidth());
			snode.setHeight(elkNode.getHeight());
		}
		for (SModelElement element: snode.getChildren()) {
			if (element instanceof SNode)
				transferLayout((SNode) element, context);
		}
	}
	
	protected static class LayoutContext {
		public SModelRoot sgraph;
		public ElkNode elkGraph;
		public final Map<SNode, ElkNode> nodeMap = Maps.newHashMap();
		public final Map<SEdge, ElkEdge> edgeMap = Maps.newHashMap();
	}

}
