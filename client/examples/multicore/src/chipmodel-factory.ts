import {
    SModelElementSchema, SParentElement, SChildElement, SModelRootSchema, SModelRoot, SModelFactory, getBasicType, SModelElement
} from "../../../src/base"
import {
    ProcessorSchema, Processor, CoreSchema, ChannelSchema, Core, Channel, Crossbar, CrossbarSchema
} from "./chipmodel"
import {Direction} from "../../../src/utils"


export class ChipModelFactory extends SModelFactory {

    createElement(schema: SModelElementSchema, parent?: SParentElement): SChildElement {
        if (schema instanceof SChildElement) {
            if (parent !== undefined)
                schema.parent = parent
            return schema
        } else {
            try {
                if (this.isCoreSchema(schema)) {
                    this.validate(schema, parent)
                    return this.initializeChild(new Core(), schema, parent)
                } else if (this.isChannelSchema(schema)) {
                    this.validate(schema, parent)
                    const child = this.initializeChild(new Channel(), schema, parent);
                    (child as Channel).direction = typeof schema.direction == 'string' ? Direction[schema.direction] : schema.direction
                    return child
                } else if (this.isCrossbarSchema(schema)) {
                    const child = this.initializeChild(new Crossbar(), schema, parent);
                    (child as Crossbar).direction = typeof schema.direction == 'string' ? Direction[schema.direction] : schema.direction
                    return child
                }
            } catch (e) {
                console.error(e.message)
            }
        }
        return super.createElement(schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (schema instanceof Processor)
            return schema
        else if (this.isProcessorSchema(schema))
            return this.initializeRoot(new Processor(), schema)
        else
            return super.createRoot(schema)
    }

    private validate(coreOrChannel: CoreSchema | ChannelSchema, processor?: SParentElement) {
        if (processor) {
            if (!(processor instanceof Processor))
                throw new Error('Parent model element must be a Processor')
            let rowDelta = 0
            let columnDelta = 0
            if (this.isChannelSchema(coreOrChannel)) {
                switch (coreOrChannel.direction) {
                    case Direction.down:
                    case 'down':
                    case Direction.up:
                    case 'up':
                        rowDelta = 1
                        break
                    default:
                        columnDelta = 1
                        break;
                }
            }
            if (coreOrChannel.row < 0 || coreOrChannel.row >= processor.rows + rowDelta
                || coreOrChannel.column < 0 && coreOrChannel.column >= processor.columns + columnDelta)
                throw Error('Element coordinates are out of bounds ' + coreOrChannel)
        }
    }

    isProcessorSchema(schema: SModelElementSchema): schema is ProcessorSchema {
        return getBasicType(schema) == 'processor'
    }

    isCoreSchema(schema: SModelElementSchema): schema is CoreSchema {
        return getBasicType(schema) == 'core'
    }

    isChannelSchema(schema: SModelElementSchema): schema is ChannelSchema {
        return getBasicType(schema) == 'channel'
    }

    isCrossbarSchema(schema: SModelElementSchema): schema is CrossbarSchema {
        return getBasicType(schema) == 'crossbar'
    }
}
