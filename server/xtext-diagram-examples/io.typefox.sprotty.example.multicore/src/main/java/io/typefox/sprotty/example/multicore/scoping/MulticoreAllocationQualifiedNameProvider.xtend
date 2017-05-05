package io.typefox.sprotty.example.multicore.scoping

import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import org.eclipse.xtext.naming.DefaultDeclarativeQualifiedNameProvider
import org.eclipse.xtext.naming.QualifiedName

class MulticoreAllocationQualifiedNameProvider extends DefaultDeclarativeQualifiedNameProvider {
	
	def qualifiedName(Task task) {
		QualifiedName.create(task.name)
	}
	
}