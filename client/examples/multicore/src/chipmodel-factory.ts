import {SModelFactory} from "../../../src/base"
import {
    SModelElementSchema,
    SParentElement,
    SChildElement,
    SModelRootSchema,
    SModelRoot,
    SModel
} from "../../../src/base"
import {ChipSchema, Chip, CoreSchema, ChannelSchema, Core, Channel, Crossbar, CrossbarSchema} from "./chipmodel"
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
                    return this.initializeChild(new Channel(), schema, parent)
                } else if (this.isCrossbarSchema(schema))
                    return this.initializeChild(new Crossbar(), schema, parent)
            } catch (e) {
                console.error(e.message)
            }
        }
        return super.createElement(schema, parent)
    }

    createRoot(schema: SModelRootSchema): SModelRoot {
        if (schema instanceof Chip)
            return schema
        else if (this.isChipSchema(schema))
            return this.initializeRoot(new Chip(), schema)
        else
            return super.createRoot(schema)
    }

    private validate(coreOrChannel: CoreSchema | ChannelSchema, chip?: SParentElement) {
        if (chip) {
            if (!(chip instanceof Chip))
                throw new Error('Parent model element must be a Chip')
            let rowDelta = 0
            let columnDelta = 0
            if (this.isChannelSchema(coreOrChannel)) {
                switch (coreOrChannel.direction) {
                    case Direction.down:
                    case Direction.up:
                        rowDelta = 1
                        break
                    default:
                        columnDelta = 1
                        break;
                }
            }
            if (coreOrChannel.row < 0 || coreOrChannel.row >= chip.rows + rowDelta
                || coreOrChannel.column < 0 && coreOrChannel.column >= chip.columns + columnDelta)
                throw Error('Element coordinates are out of bounds ' + coreOrChannel)
        }
    }

    isChipSchema(schema: SModelElementSchema): schema is ChipSchema {
        return SModel.getBasicType(schema) == 'chip'
    }

    isCoreSchema(schema: SModelElementSchema): schema is CoreSchema {
        return SModel.getBasicType(schema) == 'core'
    }

    isChannelSchema(schema: SModelElementSchema): schema is ChannelSchema {
        return SModel.getBasicType(schema) == 'channel'
    }

    isCrossbarSchema(schema: SModelElementSchema): schema is CrossbarSchema {
        return SModel.getBasicType(schema) == 'crossbar'
    }
}
