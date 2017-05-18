/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.selection

import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.services.MulticoreAllocationGrammarAccess
import org.eclipse.xtext.nodemodel.ILeafNode
import org.eclipse.xtext.nodemodel.INode
import org.eclipse.xtext.parsetree.reconstr.impl.NodeIterator

class NodeModelExtensions {
	
	@Inject extension MulticoreAllocationGrammarAccess
	
	def contains(INode node, int caretOffset) {
		if (node === null)
			return false
		else if (node.textRegion.contains(caretOffset))
			return true
		else if (caretOffset >= node.endOffset) {
			val wsLeaf = node.followingWhitespace
			if (wsLeaf !== null && wsLeaf.textRegion.contains(caretOffset)) {
				val whiteSpace = wsLeaf.text
				return !whiteSpace.substring(0, caretOffset - wsLeaf.offset).contains('\n')
			}
		} else if (caretOffset < node.offset) {
			val wsLeaf = node.precedingWhitespace
			if (wsLeaf !== null && wsLeaf.textRegion.contains(caretOffset)) {
				val whiteSpace = wsLeaf.text
				return !whiteSpace.substring(caretOffset - wsLeaf.offset).contains('\n') 
			}
		}
		return false
	}
	
	def ILeafNode getFollowingWhitespace(INode node) {
		val iter = new NodeIterator(node)
		var ILeafNode result
		while (iter.hasNext) {
			val next = iter.next
			if (next instanceof ILeafNode) {
				if (next.isHidden && next.grammarElement == WSRule) {
					if (result === null)
						result = next
				} else if (next.offset >= node.endOffset)
					return result
				else
					result = null
			}
		}
		return result
	}
	
	def ILeafNode getPrecedingWhitespace(INode node) {
		val iter = new NodeIterator(node)
		var ILeafNode result
		var continue = true
		while (continue && iter.hasNext) {
			val next = iter.next
			if (next instanceof ILeafNode) {
				if (next.isHidden && next.grammarElement == WSRule)
					result = next
				else if (result !== null)
					return result
				else
					continue = false
			}
		}
		val iter2 = new NodeIterator(node)
		while (iter2.hasPrevious) {
			val previous = iter2.previous
			if (previous instanceof ILeafNode) {
				if (previous.isHidden && previous.grammarElement == WSRule)
					return previous
				else
					return null
			}
		}
	}
	
}