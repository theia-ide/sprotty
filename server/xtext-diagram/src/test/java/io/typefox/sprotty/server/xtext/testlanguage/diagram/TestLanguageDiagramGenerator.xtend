/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext.testlanguage.diagram

import com.google.inject.Singleton
import io.typefox.sprotty.api.IDiagramState
import io.typefox.sprotty.api.SGraph
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SNode
import io.typefox.sprotty.server.xtext.IDiagramGenerator
import io.typefox.sprotty.server.xtext.LanguageAwareDiagramServer
import io.typefox.sprotty.server.xtext.testlanguage.testLanguage.Model
import java.util.List
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.Data
import org.eclipse.xtext.util.CancelIndicator

@Singleton
class TestLanguageDiagramGenerator implements IDiagramGenerator {
	
	@Data
	static class Result {
		Resource resource
		IDiagramState diagramContext
		SModelRoot model
		
		override toString() {
			'''
			{
			  resource: «resource.URI.lastSegment»
			  options: { «diagramContext.options.entrySet.map[printOption(key, value)].join(', ')» }
			  model: «model»
			}'''
		}
		
		private def printOption(String key, String value) {
			if (key == LanguageAwareDiagramServer.OPTION_SOURCE_URI)
				'''«key»: «URI.createURI(value).lastSegment»'''
			else
				'''«key»: «value»'''
		}
	}
	
	@Accessors
	val List<Result> results = newArrayList
	
	override generate(Resource resource, IDiagramState state, CancelIndicator cancelIndicator) {
		val model = resource.contents.head
		if (model instanceof Model) {
			val result = new SGraph
			result.type = 'graph'
			result.id = 'graph'
			result.children = newArrayList
			for (node : model.nodes) {
				val snode = new SNode
				snode.type = 'node'
				snode.id = node.name
				result.children += snode
			}
			synchronized (results) {
				results += new Result(resource, state, result)
			}
			return result
		}
	}
}