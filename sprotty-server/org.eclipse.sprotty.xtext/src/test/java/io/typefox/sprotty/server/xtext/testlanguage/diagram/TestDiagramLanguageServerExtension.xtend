/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.server.xtext.testlanguage.diagram

import com.google.inject.Singleton
import io.typefox.sprotty.server.xtext.DiagramLanguageServerExtension
import io.typefox.sprotty.server.xtext.ILanguageAwareDiagramServer
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