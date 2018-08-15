/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
package org.eclipse.sprotty.xtext.testlanguage.diagram

import com.google.inject.Singleton
import org.eclipse.sprotty.IDiagramState
import org.eclipse.sprotty.SGraph
import org.eclipse.sprotty.SModelRoot
import org.eclipse.sprotty.SNode
import org.eclipse.sprotty.xtext.IDiagramGenerator
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer
import org.eclipse.sprotty.xtext.testlanguage.testLanguage.Model
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