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

import com.google.inject.Inject
import org.eclipse.sprotty.Action
import org.eclipse.sprotty.ActionMessage
import org.eclipse.sprotty.xtext.testlanguage.diagram.TestDiagramLanguageServerExtension
import org.eclipse.sprotty.xtext.testlanguage.diagram.TestLanguageDiagramGenerator
import org.eclipse.xtext.ide.server.UriExtensions
import org.eclipse.xtext.testing.AbstractLanguageServerTest

abstract class AbstractDiagramServerTest extends AbstractLanguageServerTest {
	
	static val WAIT_TIMEOUT = 10000
	
	protected static val CLIENT_ID = 'testClient'
	
	@Inject extension UriExtensions
	
	new() {
		super('testlang')
	}
	
	protected def getServiceProvider(String uri) {
		resourceServerProviderRegistry.getResourceServiceProvider(uri.toUri)
	}
	
	protected def void action(Action action) {
		languageServer.notify('diagram/accept', new ActionMessage(CLIENT_ID, action))
	}
	
	protected def void closeDiagram() {
		languageServer.notify('diagram/didClose', CLIENT_ID)
	}
	
	protected def void assertGenerated(CharSequence expectedResult) {
		val diagramGenerator = getServiceProvider('file:/dummy.testlang').get(TestLanguageDiagramGenerator)
		assertEquals(expectedResult.toString.trim, diagramGenerator.results.toString)
	}
	
	protected def void waitForUpdates(String uri, int count) {
		val diagramExtension = getServiceProvider('file:/dummy.testlang').get(TestDiagramLanguageServerExtension)
		diagramExtension.waitForUpdates(uri, count, WAIT_TIMEOUT)
	}
	
}