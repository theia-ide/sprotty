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
package org.eclipse.sprotty.xtext.test

import org.eclipse.sprotty.RequestModelAction
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer
import org.eclipse.sprotty.xtext.testlanguage.diagram.TestLanguageDiagramGenerator
import java.util.HashMap
import org.eclipse.lsp4j.DidChangeTextDocumentParams
import org.eclipse.lsp4j.DidOpenTextDocumentParams
import org.eclipse.lsp4j.Position
import org.eclipse.lsp4j.Range
import org.eclipse.lsp4j.TextDocumentContentChangeEvent
import org.eclipse.lsp4j.TextDocumentItem
import org.eclipse.lsp4j.VersionedTextDocumentIdentifier
import org.junit.Test

import static org.junit.Assert.*

class DiagramGeneratorTest extends AbstractDiagramServerTest {
	
    @Test
    def void testRequestModel() {
        val sourceUri = writeFile('graph.testlang', '''
            node foo
            node bar
        ''')
    	initialize()
    	val diagramGenerator = getServiceProvider(sourceUri).get(TestLanguageDiagramGenerator)
    	assertTrue(diagramGenerator.results.empty)
    	action(new RequestModelAction[
    		options = new HashMap => [
    			put(LanguageAwareDiagramServer.OPTION_SOURCE_URI, sourceUri)
    		]
    	])
    	waitForUpdates(sourceUri, 1)
    	assertGenerated('''
    		[{
    		  resource: graph.testlang
    		  options: { sourceUri: graph.testlang }
    		  model: SGraph [
    		    revision = 1
    		    type = "graph"
    		    id = "graph"
    		    children = ArrayList (
    		      SNode [
    		        type = "node"
    		        id = "foo"
    		      ],
    		      SNode [
    		        type = "node"
    		        id = "bar"
    		      ]
    		    )
    		  ]
    		}]
    	''')
    }
	
    @Test
    def void testChangeModel() {
    	val initialContent = '''
            node foo
            node bar
        '''
        val sourceUri = writeFile('graph.testlang', initialContent)
    	initialize()
    	languageServer.didOpen(new DidOpenTextDocumentParams(
    		new TextDocumentItem(sourceUri, 'testlang', 0, initialContent)
    	))
    	action(new RequestModelAction[
    		options = new HashMap => [
    			put(LanguageAwareDiagramServer.OPTION_SOURCE_URI, sourceUri)
    		]
    	])
    	languageServer.didChange(new DidChangeTextDocumentParams(
    		new VersionedTextDocumentIdentifier => [uri = sourceUri],
    		#[new TextDocumentContentChangeEvent(new Range(new Position(1, 5), new Position(1, 8)), 3, 'baz')]
    	))
    	waitForUpdates(sourceUri, 2)
    	assertGenerated('''
    		[{
    		  resource: graph.testlang
    		  options: { sourceUri: graph.testlang }
    		  model: SGraph [
    		    revision = 1
    		    type = "graph"
    		    id = "graph"
    		    children = ArrayList (
    		      SNode [
    		        type = "node"
    		        id = "foo"
    		      ],
    		      SNode [
    		        type = "node"
    		        id = "bar"
    		      ]
    		    )
    		  ]
    		}, {
    		  resource: graph.testlang
    		  options: { sourceUri: graph.testlang }
    		  model: SGraph [
    		    revision = 2
    		    type = "graph"
    		    id = "graph"
    		    children = ArrayList (
    		      SNode [
    		        type = "node"
    		        id = "foo"
    		      ],
    		      SNode [
    		        type = "node"
    		        id = "baz"
    		      ]
    		    )
    		  ]
    		}]
    	''')
    }
	
}