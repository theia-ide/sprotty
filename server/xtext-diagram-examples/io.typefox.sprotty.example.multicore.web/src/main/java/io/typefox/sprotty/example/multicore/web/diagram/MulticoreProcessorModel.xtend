package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.api.SModelRoot
import java.util.function.Consumer
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.ToString

@Accessors@ToString
class Processor extends SModelRoot {
	int rows
	int columns
}

@Accessors@ToString
class Core extends SModelElement {
	int row
	int column
	int kernelNr
	String layout
	Boolean resizeContainer
	Boolean selected
	 
	new() {}
	new(Consumer<Core> initializer) {
		initializer.accept(this)
	}
	
}

@Accessors@ToString
class Crossbar extends SModelElement {
	CoreDirection direction
}

@Accessors@ToString
class Channel extends SModelElement {
	int row
	int column
	CoreDirection direction
}

enum CoreDirection { left, right, up, down }
