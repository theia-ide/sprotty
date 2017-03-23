package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.api.SModelRoot
import org.eclipse.lsp4j.generator.JsonRpcData

@JsonRpcData
class Chip extends SModelRoot {
	int rows
	int columns
}

@JsonRpcData
class Core extends SModelElement {
	int row
	int column
	double load
}

@JsonRpcData
class Crossbar extends SModelElement {
	Direction direction
	double load
}

@JsonRpcData
class Channel extends SModelElement {
	int row
	int column
	Direction direction
	double load
}

enum Direction { left, right, up, down }
