/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext.test

import io.typefox.sprotty.api.RequestModelAction
import io.typefox.sprotty.server.xtext.LanguageAwareDiagramServer
import io.typefox.sprotty.server.xtext.testlanguage.diagram.TestLanguageDiagramGenerator
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