package io.typefox.sprotte.example.multicore.web.diagram

import io.typefox.sprotte.api.GModelRoot
import org.eclipse.lsp4j.generator.JsonRpcData
import io.typefox.sprotte.api.GModelElement

@JsonRpcData
class Chip extends GModelRoot {
	int rows
	int columns
}

@JsonRpcData
class Core extends GModelElement {
	int row
	int column
	double load
}

@JsonRpcData
class Crossbar extends GModelElement {
	Direction direction
	double load
}

@JsonRpcData
class Channel extends GModelElement {
	int row
	int column
	Direction direction
	double load
}

enum Direction { left, right, up, down }
