/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.layout.test

import com.google.inject.Inject
import com.google.inject.Injector
import com.google.inject.Provider
import io.typefox.sprotty.api.SModelElement
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