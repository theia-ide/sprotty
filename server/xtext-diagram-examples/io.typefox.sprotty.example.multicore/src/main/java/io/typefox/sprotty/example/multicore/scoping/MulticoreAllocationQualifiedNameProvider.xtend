/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
package io.typefox.sprotty.example.multicore.scoping

import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import org.eclipse.xtext.naming.DefaultDeclarativeQualifiedNameProvider
import org.eclipse.xtext.naming.QualifiedName

class MulticoreAllocationQualifiedNameProvider extends DefaultDeclarativeQualifiedNameProvider {
	
	def qualifiedName(Task task) {
		QualifiedName.create(task.name)
	}
	
}