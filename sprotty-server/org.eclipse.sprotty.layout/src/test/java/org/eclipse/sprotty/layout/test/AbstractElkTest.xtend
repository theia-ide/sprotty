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
package org.eclipse.sprotty.layout.test

import com.google.inject.Inject
import com.google.inject.Injector
import com.google.inject.Provider
import org.eclipse.sprotty.SModelElement
import org.eclipse.elk.graph.text.ElkGraphStandaloneSetup
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.resource.XtextResourceSet
import org.eclipse.xtext.serializer.ISerializer
import org.junit.Assert
import org.junit.Before
import org.junit.BeforeClass

abstract class AbstractElkTest {
	
	static Injector injector
	
	@BeforeClass
	static def void setup() {
		injector = new ElkGraphStandaloneSetup().createInjectorAndDoEMFRegistration()
	}
	
	@Inject Provider<XtextResourceSet> resourceSetProvider
	
	@Inject ISerializer serializer
	
	@Before
	def void injectMembers() {
		injector.injectMembers(this)
	}
	
	protected def String serialize(EObject object) {
		val resourceSet = resourceSetProvider.get
		val resource = resourceSet.createResource(URI.createURI('file:/test.elkt'))
		resource.contents.add(object)
		return serializer.serialize(object)
	}
	
	protected def void assertSerializedTo(EObject object, String expected) {
		Assert.assertEquals(expected.trim, serialize(object).trim)
	}
	
	protected def void assertSerializedTo(SModelElement element, String expected) {
		Assert.assertEquals(expected.trim, element.toString.trim)
	}
	
}