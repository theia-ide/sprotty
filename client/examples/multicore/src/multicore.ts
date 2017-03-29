import {
    TYPES, IActionDispatcher, SetModelAction, ActionHandlerRegistry, ViewRegistry
} from "../../../src/base"
import {Direction} from "../../../src/utils"
import {CenterAction, SelectCommand } from "../../../src/features"
import {Core, ProcessorSchema, Crossbar, Channel, CoreSchema, ChannelSchema, CrossbarSchema} from "./chipmodel"
import {ProcessorView, CoreView, ChannelView, CrossbarView} from "./views"
import {ChipModelFactory} from "./chipmodel-factory"
import createContainer from "./di.config"

export default function runMulticore() {
    const container = createContainer()

    // init gmodel
    const dim = 32
    const cores: CoreSchema[] = []
    const channels: ChannelSchema[] = []
    for (let i = 0; i < dim; ++i) {
        for (let j = 0; j < dim; ++j) {
            const pos = i + '_' + j
            cores.push({
                id: 'core_' + pos,
                type: 'core',
                column: i,
                row: j,
                load: Math.random()
            })
            channels.push(createChannel(i, j, Direction.up))
            channels.push(createChannel(i, j, Direction.down))
            channels.push(createChannel(i, j, Direction.left))
            channels.push(createChannel(i, j, Direction.right))
        }
        channels.push(createChannel(dim, i, Direction.up))
        channels.push(createChannel(dim, i, Direction.down))
        channels.push(createChannel(i, dim, Direction.left))
        channels.push(createChannel(i, dim, Direction.right))
    }

    function createChannel(row: number, column: number, direction: Direction): ChannelSchema {
        const pos = row + '_' + column
        return {
            id: 'channel_' + direction + '_' + pos,
            type: 'channel',
            column: column,
            row: row,
            direction: direction,
            load: Math.random(),
        }
    }

    const crossbars = [{
        id: 'cb_up',
        type: 'crossbar',
        load: Math.random(),
        direction: Direction.up
    }, {
        id: 'cb_down',
        type: 'crossbar',
        load: Math.random(),
        direction: Direction.down
    }, {
        id: 'cb_left',
        type: 'crossbar',
        load: Math.random(),
        direction: Direction.left
    }, {
        id: 'cb_right',
        type: 'crossbar',
        load: Math.random(),
        direction: Direction.right
    }]

    let children: (CrossbarSchema | ChannelSchema | CoreSchema)[] = []
    children = children.concat(channels)
    children = children.concat(crossbars)
    children = children.concat(cores)

    const modelFactory = container.get<ChipModelFactory>(TYPES.IModelFactory)
    const processorSchema: ProcessorSchema = {
        id: 'processor',
        type: 'processor',
        rows: dim,
        columns: dim,
        children: children
    }
    const processor = modelFactory.createRoot(processorSchema)

    // Register views
    const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
    viewRegistry.register('processor', ProcessorView)
    viewRegistry.register('core', CoreView)
    viewRegistry.register('crossbar', CrossbarView)
    viewRegistry.register('channel', ChannelView)

    // Run
    const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)
    dispatcher.dispatch(new SetModelAction(processor))
    dispatcher.dispatchNextFrame(new CenterAction([]))

    function changeModel() {
        for (let i = 0; i < processor.children.length; ++i) {
            const child = processor.children[i] as (Core | Channel | Crossbar)
            child.load = Math.max(0, Math.min(1, child.load + Math.random() * 0.2 - 0.1))
        }
        const action = new SetModelAction(processor)
        dispatcher.dispatch(action)
    }

    // setInterval(changeModel.bind(this), 5000)
}