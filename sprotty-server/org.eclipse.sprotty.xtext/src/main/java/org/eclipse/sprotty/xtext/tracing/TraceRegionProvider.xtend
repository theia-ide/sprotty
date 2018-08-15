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
package org.eclipse.sprotty.xtext.tracing

import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.EStructuralFeature
import org.eclipse.emf.ecore.EcorePackage
import org.eclipse.xtext.nodemodel.INode
import org.eclipse.xtext.nodemodel.util.NodeModelUtils
import org.eclipse.xtext.util.TextRegion
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.resource.EObjectAtOffsetHelper
import com.google.inject.Inject

class TraceRegionProvider {

	@Inject extension EObjectAtOffsetHelper
	
	def EObject getElementAtOffset(XtextResource resource, int offset) {
		val document = resource.parseResult.rootNode.text
		var offset2 = offset
		while(offset2 < document.length && document.charAt(offset2) === 32)
			offset2++
		return resource.resolveContainedElementAt(offset2)	
	}

	def TextRegion getSignificantRegion(EObject element) {
		val feature = element.relevantFeature
		if (feature !== null) {
			val node = NodeModelUtils.findNodesForFeature(element, feature).head
			if(node !== null)
				return node.toTextRegion
		}
		return NodeModelUtils.findActualNodeFor(element).toTextRegion
	}

	protected def toTextRegion(INode node) {
		val leafNodes = node.leafNodes.filter[!hidden]
		if(!leafNodes.empty) {
			var start = leafNodes.head.offset
			var end = leafNodes.last.endOffset
			return new TextRegion(start, end - start)
		}
	}	
	
	protected def EStructuralFeature getRelevantFeature(EObject element) {
		element.eClass.getEAllAttributes.findFirst[name == 'name'] 
		?: element.eClass.getEAllAttributes.findFirst[getEAttributeType === EcorePackage.Literals.ESTRING]
		?: element.eClass.getEAllReferences.findFirst[isContainment && upperBound === 1]
	}
}
