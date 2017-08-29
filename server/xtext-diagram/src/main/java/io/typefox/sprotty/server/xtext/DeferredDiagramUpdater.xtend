package io.typefox.sprotty.server.xtext

import java.util.Collection
import java.util.Set
import java.util.Timer
import java.util.TimerTask
import java.util.concurrent.LinkedBlockingQueue
import org.eclipse.emf.common.util.URI

class DeferredDiagramUpdater {
	
	Timer currentTimer
	
	val uris = new LinkedBlockingQueue<URI>
	
	val lock = new Object

	val (Set<? extends URI>)=>void updateFunction 
	
	new((Set<? extends URI>)=>void updateFunction) {
		this.updateFunction = updateFunction
	}
	
	def updateLater(Collection<? extends URI> newUris) {
		uris.addAll(newUris)
		schedule(200)
	}
	
	protected def schedule(long delay) {
		synchronized(lock) {
			if(currentTimer !== null)
				currentTimer.cancel
			currentTimer = new Timer('Diagram updater', true)	
			currentTimer.schedule(createTimerTask, delay)
		}
	}
	
	protected def TimerTask createTimerTask() {
		[ this.update() ]
	}
	
	protected def update() {
		val processUris = <URI>newHashSet
		uris.drainTo(processUris)
		updateFunction.apply(processUris)
	}
}

