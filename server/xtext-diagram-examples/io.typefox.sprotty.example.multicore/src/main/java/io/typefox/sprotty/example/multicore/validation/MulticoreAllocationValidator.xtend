package io.typefox.sprotty.example.multicore.validation

import com.google.common.collect.HashMultimap
import io.typefox.sprotty.example.multicore.multicoreAllocation.Barrier
import io.typefox.sprotty.example.multicore.multicoreAllocation.Kernel
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Step
import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskAllocation
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskFinished
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskRunning
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.validation.Check

import static io.typefox.sprotty.example.multicore.multicoreAllocation.MulticoreAllocationPackage.Literals.*

import static extension org.eclipse.xtext.EcoreUtil2.*

/**
 * This class contains custom validation rules. 
 */
class MulticoreAllocationValidator extends AbstractMulticoreAllocationValidator {
	
	@Check
	def void checkUniqueNames(Program program) {
		val usedNames = newHashMap
		for (declaration : program.declarations) {
			val name = switch declaration {
				Kernel: declaration.name
				Task: declaration.name
				Step: declaration.index.toString
			}
			if (name !== null) {
				if (usedNames.containsKey(name)) {
					fireNameUsed(declaration)
					val otherDecl = usedNames.get(name)
					if (otherDecl !== null) {
						fireNameUsed(otherDecl)
						usedNames.put(name, null)
					}
				} else {
					usedNames.put(name, declaration)
				}
			}
		}
	}
	
	private def void fireNameUsed(EObject element) {
		if (element instanceof Step) {
			error("Step index is already used.", element, STEP__INDEX)
		} else {
			val feature = switch element {
				Kernel: KERNEL__NAME
				Task: TASK__NAME
			}
			error("Name is already used.", element, feature)
		}
	}
	
	@Check
	def void checkBarrier(Barrier barrier) {
		barrier.joined.filter[it !== null && !eIsProxy].forEach[ joinedTask, index |
			if (barrier.triggered.contains(joinedTask)) {
				error("Cannot join a task that is triggered by the same barrier.", BARRIER__JOINED, index)
			}
		]
	}
	
	@Check
	def void checkTaskAllocation(TaskAllocation taskAllocation) {
		val program = taskAllocation.getContainerOfType(Program)
		if (taskAllocation.core <= 0 || taskAllocation.core > program.numberOfCores)
			error("The core index must be between 1 and the number of cores (" + program.numberOfCores + ").", TASK_ALLOCATION__CORE)
	}
	
	@Check
	def void checkStep(Step step) {
		val tasks = HashMultimap.create
		for (allocation : step.allocations) {
			if (allocation.task !== null && !allocation.task.eIsProxy)
				tasks.put(allocation.task, allocation)
		}
		for (task : tasks.keySet) {
			val allocations = tasks.get(task)
			val running = allocations.filter(TaskRunning)
			val finished = allocations.filter(TaskFinished)
			if (running.size > 1) {
				for (a : running) {
					error("Cannot run a task on multiple cores.", a, TASK_ALLOCATION__TASK)
				}
			} else if (finished.size > 1) {
				for (a : finished) {
					error("A task cannot be finished by multiple cores.", a, TASK_ALLOCATION__TASK)
				}
			} else if (!running.empty && !finished.empty) {
				for (a : running + finished) {
					error("A task cannot be running and finished in the same step.", a, TASK_ALLOCATION__TASK)
				}
			}
		}
	}
	
}
