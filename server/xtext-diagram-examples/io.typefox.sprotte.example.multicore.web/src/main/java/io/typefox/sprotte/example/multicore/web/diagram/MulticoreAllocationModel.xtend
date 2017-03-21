package io.typefox.sprotte.example.multicore.web.diagram

import org.eclipse.lsp4j.generator.JsonRpcData
import io.typefox.sprotte.api.SModelElement
import io.typefox.sprotte.api.SModelRoot

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
