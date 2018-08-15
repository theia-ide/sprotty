package org.eclipse.sprotty.xtext.test

import org.eclipse.sprotty.RequestModelAction
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer
import org.eclipse.sprotty.xtext.testlanguage.diagram.TestDiagramLanguageServerExtension
import java.util.HashMap
import org.junit.Test

import static org.junit.Assert.*

class DiagramExtensionTest extends AbstractDiagramServerTest {
	
    @Test
    def void testCloseDiagram() {
        val sourceUri = writeFile('graph.testlang', '''
            node foo
            node bar
        ''')
    	initialize()
    	action(new RequestModelAction[
    		options = new HashMap => [
    			put(LanguageAwareDiagramServer.OPTION_SOURCE_URI, sourceUri)
    		]
    	])
    	val diagramExtension = getServiceProvider(sourceUri).get(TestDiagramLanguageServerExtension)
    	assertEquals(1, diagramExtension.diagramServers.size)
    	closeDiagram()
    	assertEquals(0, diagramExtension.diagramServers.size)
    }
	
}