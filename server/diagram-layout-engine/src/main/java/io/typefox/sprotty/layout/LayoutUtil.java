package io.typefox.sprotty.layout;

import java.util.Map;

import com.google.common.collect.Maps;

import io.typefox.sprotty.api.Bounds;
import io.typefox.sprotty.api.ElementAndBounds;
import io.typefox.sprotty.api.SGraph;
import io.typefox.sprotty.api.SModelElement;
import io.typefox.sprotty.api.SModelRoot;
import io.typefox.sprotty.api.SNode;
import io.typefox.sprotty.api.SetBoundsAction;

public final class LayoutUtil {
	
	private LayoutUtil() {}
	
	public static Map<String, SNode> createId2NodeMap(SModelRoot graph) {
		Map<String, SNode> result = Maps.newHashMap();
		addNodes(graph, result);
		return result;
	}
	
	private static void addNodes(SModelElement element, Map<String, SNode> map) {
		if (element.getChildren() != null) {
			for (SModelElement child : element.getChildren()) {
				if (child instanceof SNode) {
					if (child.getId() != null)
						map.put(child.getId(), (SNode) child);
					addNodes(child, map);
				}
			}
		}
	}
	
	public static void applyResizeAction(SGraph graph, SetBoundsAction action) {
		Map<String, SNode> nodeMap = createId2NodeMap(graph);
		for (ElementAndBounds resize : action.getResizes()) {
			SNode node = nodeMap.get(resize.getElementId());
			if (node != null) {
				Bounds newBounds = resize.getNewBounds();
				if (newBounds.getWidth() != null)
					node.setWidth(newBounds.getWidth());
				if (newBounds.getHeight() != null)
					node.setHeight(newBounds.getHeight());
			}
		}
	}

}
