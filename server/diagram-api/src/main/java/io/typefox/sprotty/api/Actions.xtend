/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.api

import java.util.List
import java.util.Map
import java.util.function.Consumer
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

/**
 * An action describes a change to the model declaratively.
 * It is a plain data structure, and as such transferable between server and client.
 */
interface Action {
	def String getKind()
}

/**
 * Wrapper for actions when transferring them between server and client via an {@link IDiagramServer}.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class ActionMessage {
	String clientId
	Action action
	
	new() {}
	new(Consumer<ActionMessage> initializer) {
		initializer.accept(this)
	}
	new(String clientId, Action action) {
		this.clientId = clientId
		this.action = action
	}
}

/**
 * Sent from the client to the server in order to request a model. Usually this is the first message
 * that is sent to the server, so it is also used to initiate the communication. The response is a
 * {@link SetModelAction} or an {@link UpdateModelAction}.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class RequestModelAction implements Action {
	public static val KIND = 'requestModel'
	String kind = KIND
	
	Map<String, String> options
	
	new() {}
	new(Consumer<RequestModelAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Sent from the server to the client in order to set the model. If a model is already present, it is replaced.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class SetModelAction implements Action {
	public static val KIND = 'setModel'
	String kind = KIND
	
	SModelRoot newRoot
	
	new() {}
	new(Consumer<SetModelAction> initializer) {
		initializer.accept(this)
	}
	new(SModelRoot newRoot) {
		this.newRoot = newRoot
	}
}

/**
 * Sent from the server to the client in order to update the model. If no model is present yet, this behaves
 * the same as a {@link SetModelAction}. The transition from the old model to the new one can be animated.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class UpdateModelAction implements Action {
	public static val KIND = 'updateModel'
	String kind = KIND
	
	SModelRoot newRoot
	Boolean animate
	
	new() {}
	new(Consumer<UpdateModelAction> initializer) {
		initializer.accept(this)
	}
	new(SModelRoot newRoot) {
		this.newRoot = newRoot
	}
}

/**
 * Sent from the server to the client to request bounds for the given model. The model is rendered
 * invisibly so the bounds can derived from the DOM. The response is a {@link ComputedBoundsAction}.
 * This hidden rendering round-trip is necessary if the client is responsible for parts of the layout
 * (see {@link DefaultDiagramServer#needsClientLayout(SModelRoot)}).
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class RequestBoundsAction implements Action {
	public static val KIND = 'requestBounds'
	String kind = KIND
	
	SModelRoot newRoot
	
	new() {}
	new(Consumer<RequestBoundsAction> initializer) {
		initializer.accept(this)
	}
	new(SModelRoot newRoot) {
		this.newRoot = newRoot
	}
}

/**
 * Sent from the client to the server to transmit the result of bounds computation as a response
 * to a {@link RequestBoundsAction}. If the server is responsible for parts of the layout
 * (see {@link DefaultDiagramServer#needsServerLayout(SModelRoot)}), it can do so after applying
 * the computed bounds received with this action. Otherwise there is no need to send the computed
 * bounds to the server, so they can be processed locally by the client.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class ComputedBoundsAction implements Action {
	public static val KIND = 'computedBounds'
	String kind = KIND
	int revision 
	
	List<ElementAndBounds> bounds
	List<ElementAndAlignment> alignments
	
	new() {}
	new(Consumer<ComputedBoundsAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Sent from the server to the client to update the bounds of some (or all) model elements.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class SetBoundsAction implements Action {
    public static val KIND ='setBounds'
	String kind = KIND
	
	List<ElementAndBounds> bounds
	
	new() {}
	new(Consumer<SetBoundsAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Associates new bounds with a model element, which is referenced via its id.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class ElementAndBounds {
    String elementId
    Bounds newBounds
	
	new() {}
	new(Consumer<ElementAndBounds> initializer) {
		initializer.accept(this)
	}
}

/**
 * Associates a new alignment with a model element, which is referenced via its id.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class ElementAndAlignment{
    String elementId
    Point newAlignment
	
	new() {}
	new(Consumer<ElementAndAlignment> initializer) {
		initializer.accept(this)
	}
}

/**
 * Triggered when the user changes the selection, e.g. by clicking on a selectable element. This action
 * is forwarded to the diagram server, if present, so it may react on the selection change. Furthermore,
 * the server can send such an action to the client in order to change the selection programmatically.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class SelectAction implements Action {
	public static val KIND = 'elementSelected'
	String kind = KIND
	
	List<String> selectedElementsIDs = emptyList
	List<String> deselectedElementsIDs = emptyList
	
	new() {}
	new(Consumer<SelectAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Programmatic action for selecting or deselecting all elements.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class SelectAllAction implements Action {
	public static val KIND = 'allSelected'
	String kind = KIND
	
	boolean select = true
	
	new() {}
	new(Consumer<SelectAllAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Triggered when the user requests the viewer to center on the current model. The resulting
 * CenterCommand changes the scroll setting of the viewport accordingly and resets the zoom to its default.
 * This action can also be sent from the model source to the client in order to perform such a
 * viewport change programmatically.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class CenterAction implements Action {
	public static val KIND = 'center'
	String kind = KIND
	
	List<String> elementIds
	boolean animate = true
	
	new() {}
	new(Consumer<CenterAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Triggered when the user requests the viewer to fit its content to the available drawing area.
 * The resulting FitToScreenCommand changes the zoom and scroll settings of the viewport so the model
 * can be shown completely. This action can also be sent from the server to the client in order
 * to perform such a viewport change programmatically.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class FitToScreenAction implements Action {
	public static val KIND = 'fit'
	String kind = KIND
	
	List<String> elementIds
	Double padding
	Double maxZoom
	boolean animate = true
	
	new() {}
	new(Consumer<FitToScreenAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Triggered when the user hovers the mouse pointer over an element to get a popup with details on
 * that element. This action is sent from the client to the server. The response is a
 * {@link SetPopupModelAction}.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class RequestPopupModelAction implements Action {
	public static val KIND = 'requestPopupModel'
	String kind = KIND
	
	String elementId
	Bounds bounds
	
	new() {}
	new(Consumer<RequestPopupModelAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Sent from the server to the client to display a popup in response to a {@link RequestPopupModelAction}.
 * This action can also be used to remove any existing popup by choosing {@code NONE} as type of the
 * root element.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class SetPopupModelAction implements Action {
	public static val KIND = 'setPopupModel'
	String kind = KIND
	
	SModelRoot newRoot
	
	new() {}
	new(Consumer<SetPopupModelAction> initializer) {
		initializer.accept(this)
	}
	new(SModelRoot newRoot) {
		this.newRoot = newRoot
	}
}

/**
 * Sent from the client to the server to recalculate a diagram when elements
 * are collapsed/expanded by the client.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class CollapseExpandAction implements Action {
	public static val KIND = 'collapseExpand'
	String kind = KIND
	
	List<String> expandIds = emptyList
	List<String> collapseIds = emptyList
	
	new() {}
	new(Consumer<CollapseExpandAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Programmatic action for expanding or collapsing all elements.
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class CollapseExpandAllAction implements Action {
	public static val KIND = 'collapseExpandAll'
	String kind = KIND
	
	boolean expand = true
	
	new() {}
	new(Consumer<CollapseExpandAllAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Sent from the client to the server when an element is opened (double-clicked).
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class OpenAction implements Action {
	public static val KIND = 'open'
	String kind = KIND
	
	String elementId
	
	new() {}
	new(Consumer<OpenAction> initializer) {
		initializer.accept(this)
	}
}

@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class RequestExportSvgAction implements Action {
	public static val KIND = 'requestExportSvg'
	String kind = KIND
	
	new() {}
	new(Consumer<RequestExportSvgAction> initializer) {
		initializer.accept(this)
	}
}

@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class ExportSvgAction implements Action {
    public static val KIND = 'exportSvg'
    String svg
    String kind = KIND

	new() {}
	new(Consumer<ExportSvgAction> initializer) {
		initializer.accept(this)
	}
}

@Accessors
@EqualsHashCode
@ToString(skipNulls = true)
class ServerStatusAction implements Action {
    public static val KIND = 'serverStatus'
    String severity
    String message
    String kind = KIND

	new() {}
	new(Consumer<ServerStatusAction> initializer) {
		initializer.accept(this)
	}
	new(ServerStatus status) {
		this.severity = status.severity.toString
		this.message = status.message
	}
}