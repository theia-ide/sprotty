package io.typefox.sprotty.example.multicore.web.selection

import org.eclipse.xtend.lib.annotations.Data
import org.eclipse.xtext.web.server.IServiceResult

@Data
class SelectionResult implements IServiceResult {
	
	int offset
	
}