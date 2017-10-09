/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.web.diagram

import io.typefox.sprotty.api.Bounds
import io.typefox.sprotty.api.HtmlRoot
import io.typefox.sprotty.api.IDiagramServer
import io.typefox.sprotty.api.IPopupModelFactory
import io.typefox.sprotty.api.PreRenderedElement
import io.typefox.sprotty.api.RequestPopupModelAction
import io.typefox.sprotty.api.SModelElement
import io.typefox.sprotty.example.multicore.multicoreAllocation.Barrier
import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskAllocation
import java.util.List

class MulticoreAllocationPopupModelFactory implements IPopupModelFactory {
	
	override createPopupModel(SModelElement element, RequestPopupModelAction request, IDiagramServer server) {
		val source = if (server instanceof MulticoreAllocationDiagramServer) server.modelMapping.inverse.get(element)
		var String title
		val body = newArrayList
		if (server.model.type == 'flow') {
			switch source {
				Task: {
					title = '''Task «source.name»'''
					if (source.kernel !== null) {
						body += '''Kernel: «source.kernel.name»'''
						if (source.kernel.duration > 0)
							body += '''Stack size: «source.kernel.stackSize»'''
						if (source.kernel.stackBeginAddr !== null)
							body += '''Stack start address: «source.kernel.stackBeginAddr»'''
					}
				}
				Barrier: {
					title = '''Barrier «source.name»'''
					if (!source.joined.empty)
						body += '''Joins «FOR t : source.joined SEPARATOR ', '»«t.name»«ENDFOR»'''
					if (!source.triggered.empty)
						body += '''Triggers «FOR t : source.triggered SEPARATOR ', '»«t.name»«ENDFOR»'''
				}
			}
		} else if (server.model.type == 'processor') {
			if (element instanceof Core) {
				val processor = server.model as Processor
				if (source instanceof TaskAllocation) {
					title = '''Core «source.core»'''
					if (source.task !== null) {
						body += '''Task: «source.task.name»'''
						if (source.task.kernel !== null) {
							body += '''Kernel: «source.task.kernel.name»'''
							if (source.task.kernel.duration > 0)
								body += '''Stack size: «source.task.kernel.stackSize»'''
							if (source.task.kernel.stackBeginAddr !== null)
								body += '''Stack start address: «source.task.kernel.stackBeginAddr»'''
						}
					}
					if (source.programCounter !== null)
						body += '''Program counter: «source.programCounter»'''
					if (source.stackPointer !== null)
						body += '''Stack pointer: «source.stackPointer»'''
					if (source.sourceFile !== null)
						body += '''Source file: «source.sourceFile»'''
					if (source.stackTrace !== null)
						body += '''Stack trace: «source.stackTrace»'''
				} else {
					title = '''Core «processor.columns * element.row + element.column + 1»'''
				}
			}
		}
		if (title !== null) {
			return createPopupModel(title, body, request.bounds)
		}
	}
	
	protected def createPopupModel(String title, List<String> body, Bounds bounds) {
		new HtmlRoot [
			type = 'html'
			id = 'popup'
			children = #[
				new PreRenderedElement[
					type = 'pre-rendered'
					id = 'popup-title'
					code = '''<div class="sprotty-popup-title">«title»</div>'''
				],
				new PreRenderedElement[
					type = 'pre-rendered'
					id = 'popup-body'
					code = '''
						<div class="sprotty-popup-body">
							«FOR text : body»
								<p>«text»</p>
							«ENDFOR»
						</div>
					'''
				]
			]
			canvasBounds = bounds
		]
	}
	
}