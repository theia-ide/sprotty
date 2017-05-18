/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.examples

import io.typefox.sprotty.api.AbstractDiagramServer
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.api.ComputedBoundsAction
import io.typefox.sprotty.api.ModelAction
import io.typefox.sprotty.api.Point
import io.typefox.sprotty.api.SEdge
import io.typefox.sprotty.api.SModelRoot
import io.typefox.sprotty.api.SNode
import io.typefox.sprotty.api.SelectAction
import org.eclipse.jetty.util.log.Slf4jLog

class SimpleDiagramServer extends AbstractDiagramServer {

	static val LOG = new Slf4jLog(SimpleServerLauncher.name)
	
	override protected getModel(ModelAction action, String clientId) {
		new SModelRoot => [
			type = 'graph'
			id = 'graph'
			children = #[
				new SNode => [
					type = 'node:circle'
					id = 'node0'
					position = new Point(100.0, 100.0)
				],
				new SNode => [
					type = 'node:circle'
					id = 'node1'
					position = new Point(300.0, 150.0)
				],
				new SEdge => [
					type = 'edge:straight'
					id = 'edge0'
					sourceId = 'node0'
					targetId = 'node1'
				]
			]
		]
	}
	
	override protected needsServerLayout(SModelRoot root) {
		false
	}
	
	override protected needsClientLayout(SModelRoot root) {
		false
	}
	
	override protected computeLayout(SModelRoot root, ComputedBoundsAction computedBounds) {
		throw new UnsupportedOperationException
	}
	
	override handle(SelectAction action, ActionMessage message) {
		LOG.info('element selected: ' + action)
	}
	
}
