package io.typefox.sprotty.layout;

import java.util.ArrayList;

import io.typefox.sprotty.api.Bounds;
import io.typefox.sprotty.api.BoundsAware;
import io.typefox.sprotty.api.ElementAndBounds;
import io.typefox.sprotty.api.SEdge;
import io.typefox.sprotty.api.SGraph;
import io.typefox.sprotty.api.SModelElement;
import io.typefox.sprotty.api.SModelIndex;
import io.typefox.sprotty.api.SetBoundsAction;

public final class LayoutUtil {
	
	private LayoutUtil() {}
	
	public static void applyResizeAction(SGraph graph, SetBoundsAction action) {
		SModelIndex index = new SModelIndex(graph);
		for (ElementAndBounds resize : action.getResizes()) {
			SModelElement element = index.get(resize.getElementId());
			if (element instanceof BoundsAware) {
				Bounds newBounds = resize.getNewBounds();
				((BoundsAware)element).setBounds(newBounds);
				((BoundsAware)element).setRevalidateBounds(false);
			}
		}
	}

	public static void copyLayoutData(SGraph oldGraph, SGraph newGraph) {
		SModelIndex oldIndex = new SModelIndex(oldGraph);
		copyLayoutDataRecursively(newGraph, oldIndex);
	}
	
	protected static void copyLayoutDataRecursively(SModelElement element, SModelIndex oldIndex) {
		if(element instanceof BoundsAware) {
			SModelElement oldElement = oldIndex.get(element.getId());
			if(oldElement instanceof BoundsAware) {
				((BoundsAware)element).setBounds(((BoundsAware) oldElement).getBounds());
				((BoundsAware)element).setRevalidateBounds(true);
			}
		} else if(element instanceof SEdge) {
			SModelElement oldElement = oldIndex.get(element.getId());
			if(oldElement instanceof SEdge && ((SEdge) oldElement).getRoutingPoints() != null) {
				((SEdge) element).setRoutingPoints(new ArrayList<>(((SEdge) oldElement).getRoutingPoints()));
			}
		}
		if(element.getChildren() != null) {
			for(SModelElement child: element.getChildren()) 
				copyLayoutDataRecursively(child, oldIndex);	
		}
	}
}
