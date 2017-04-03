import { AbstractCommand, Command, CommandExecutionContext, SModelRootOrPromise } from "./commands"
import { SModelRoot } from "../model/smodel"
import { Container, ContainerModule } from "inversify"
import { TYPES } from "../types"
import { defaultModule } from "../index"
import { IViewer } from "../view/viewer"
import { ICommandStack } from "./command-stack"
import { expect } from "chai"

let operations: string[] = []

class TestCommand extends AbstractCommand {
    constructor(public name: string, public systemCommand: boolean, public mergeable: boolean) {
        super()
    }

    execute(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise {
        operations.push('exec ' + this.name)
        return element
    }

    undo(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise {
        operations.push('undo ' + this.name)
        return element
    }

    redo(element: SModelRoot, context: CommandExecutionContext): SModelRootOrPromise {
        operations.push('redo ' + this.name)
        return element
    }

    isSystemCommand() {
        return this.systemCommand
    }

    merge(other: TestCommand, context: CommandExecutionContext) {
        if(this.mergeable && other.mergeable) {
            this.name = this.name + '/' + other.name
        }
        return this.mergeable
    }
}

describe('CommandStack', () => {

    let viewerUpdates: number = 0

    const mockViewer: IViewer = {
        update() {
            ++viewerUpdates
        }
    }

    const module = new ContainerModule((bind, unbind, isBound, rebind) => {
        rebind(TYPES.IViewer).toConstantValue(mockViewer)
    })

    const container = new Container()
    container.load(defaultModule, module)

    const commandStack = container.get<ICommandStack>(TYPES.ICommandStack)

    const foo = new TestCommand('Foo', false, false)
    const bar = new TestCommand('Bar', false, false)
    const system = new TestCommand('System', true, false)
    const mergable = new TestCommand('Mergable', false, true)

    it('calls viewer correctly', async () => {
        await commandStack.executeAll([foo, bar, system])
        expect(viewerUpdates).to.be.equal(1)
        await commandStack.execute(foo)
        expect(viewerUpdates).to.be.equal(2)
        await commandStack.execute(bar)
        expect(viewerUpdates).to.be.equal(3)
        await commandStack.execute(system)
        expect(viewerUpdates).to.be.equal(4)
    })

    it('handles plain undo/redo', async () => {
        operations = []
        viewerUpdates = 0
        await commandStack.executeAll([foo, bar])
        await commandStack.undo()
        await commandStack.redo()
        await commandStack.undo()
        await commandStack.undo()
        await commandStack.redo()
        expect(operations).to.be.eql(['exec Foo', 'exec Bar', 'undo Bar', 'redo Bar', 'undo Bar', 'undo Foo', 'redo Foo'])
        expect(6).to.be.equal(viewerUpdates)
    })

    it('handles system command at the end', async () => {
        operations = []
        viewerUpdates = 0
        await commandStack.executeAll([foo, bar, system])
        expect(1).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'exec System']).to.be.eql(operations)
        await commandStack.undo()
        expect(2).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'exec System', 'undo System', 'undo Bar']).to.be.eql(operations)
        await commandStack.execute(system)
        expect(3).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'exec System', 'undo System', 'undo Bar', 'exec System']).to.be.eql(operations)
        await commandStack.redo()
        expect(4).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'exec System', 'undo System', 'undo Bar', 'exec System', 'undo System', 'redo Bar', 'redo System']).to.be.eql(operations)
    })

    it('handles system command in the middle', async () => {
        operations = []
        viewerUpdates = 0
        await commandStack.executeAll([foo, bar])
        expect(1).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar']).to.be.eql(operations)
        await commandStack.undo()
        expect(2).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'undo Bar']).to.be.eql(operations)
        await commandStack.execute(system)
        expect(3).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'undo Bar', 'exec System']).to.be.eql(operations)
        await commandStack.undo()
        expect(4).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'undo Bar', 'exec System', 'undo System', 'undo Foo']).to.be.eql(operations)
        await commandStack.executeAll([system, system])
        expect(5).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'undo Bar', 'exec System', 'undo System', 'undo Foo', 'exec System', 'exec System']).to.be.eql(operations)
        await commandStack.redo()
        expect(6).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'undo Bar', 'exec System', 'undo System', 'undo Foo', 'exec System', 'exec System', 'undo System', 'undo System', 'redo Foo']).to.be.eql(operations)
        await commandStack.redo()
        expect(7).to.be.equal(viewerUpdates)
        expect(['exec Foo', 'exec Bar', 'undo Bar', 'exec System', 'undo System', 'undo Foo', 'exec System', 'exec System', 'undo System', 'undo System', 'redo Foo', 'redo Bar']).to.be.eql(operations)
    })

    it('handles merge command', async () => {
        operations = []
        viewerUpdates = 0
        await commandStack.executeAll([mergable, mergable])
        expect(1).to.be.equal(viewerUpdates)
        expect(['exec Mergable', 'exec Mergable']).to.be.eql(operations)
        await commandStack.undo()
        expect(2).to.be.equal(viewerUpdates)
        expect(['exec Mergable', 'exec Mergable', 'undo Mergable/Mergable']).to.be.eql(operations)
        await commandStack.redo()
        expect(3).to.be.equal(viewerUpdates)
        expect(['exec Mergable', 'exec Mergable', 'undo Mergable/Mergable', 'redo Mergable/Mergable']).to.be.eql(operations)
        await commandStack.execute(foo)
        expect(4).to.be.equal(viewerUpdates)
        expect(['exec Mergable', 'exec Mergable', 'undo Mergable/Mergable', 'redo Mergable/Mergable', 'exec Foo']).to.be.eql(operations)

    })
})