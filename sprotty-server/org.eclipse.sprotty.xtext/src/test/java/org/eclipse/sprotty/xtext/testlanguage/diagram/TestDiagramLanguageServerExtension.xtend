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
package org.eclipse.sprotty.xtext.testlanguage.diagram

import com.google.inject.Singleton
import org.eclipse.sprotty.xtext.DiagramLanguageServerExtension
import org.eclipse.sprotty.xtext.ILanguageAwareDiagramServer
import java.util.HashMap
import java.util.List
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

@Singleton
class TestDiagramLanguageServerExtension extends DiagramLanguageServerExtension {
	
	// uri -> (number of updates, last update future)
	val updateFutures = new HashMap<String, Pair<Integer, CompletableFuture<Void>>>
	
	override getDiagramServers() {
		super.getDiagramServers()
	}
	
	override protected doUpdateDiagrams(String path, List<? extends ILanguageAwareDiagramServer> diagramServers) {
		val result = super.doUpdateDiagrams(path, diagramServers)
		synchronized (updateFutures) {
			val lastValue = updateFutures.get(path)
			if (lastValue === null)
				updateFutures.put(path, 1 -> result)
			else
				updateFutures.put(path, lastValue.key + 1 -> result)
			updateFutures.notifyAll()
		}
		return result
	}
	
	def void waitForUpdates(String uri, int count, long timeout) throws TimeoutException {
		val startTime = System.currentTimeMillis
		val future = synchronized (updateFutures) {
			while (!updateFutures.containsKey(uri) || updateFutures.get(uri).key < count) {
				updateFutures.wait()
				if (System.currentTimeMillis - startTime > timeout)
					throw new TimeoutException("Timeout of " + timeout + " ms elapsed.")
			}
			updateFutures.get(uri).value
		}
		future.get(timeout - (System.currentTimeMillis - startTime), TimeUnit.MILLISECONDS)
	}
	
}