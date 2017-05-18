/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
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