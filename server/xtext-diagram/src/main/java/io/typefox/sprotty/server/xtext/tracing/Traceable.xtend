/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */ 
package io.typefox.sprotty.server.xtext.tracing

import org.eclipse.xtend.lib.annotations.Data

interface Traceable {
	def TextRegion getTraceRegion()
	def void setTraceRegion(TextRegion traceRegion)
	def TextRegion getSignificantRegion()
	def void setSignificantRegion(TextRegion traceRegion)
}

@Data
class TextRegion {
	int offset
	int length
}