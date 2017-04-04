package io.typefox.sprotty.example.multicore.web

import javax.servlet.ServletContext
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtext.web.server.model.DocumentSynchronizer
import org.eclipse.xtext.web.server.model.XtextWebDocument

class ServletAwareWebDocument extends XtextWebDocument {
	
	@Accessors
	ServletContext servletContext
	
	new(String resourceId, DocumentSynchronizer synchronizer) {
		super(resourceId, synchronizer)
	}
	
}