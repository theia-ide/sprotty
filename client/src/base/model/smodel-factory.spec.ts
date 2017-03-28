import { expect } from "chai"
import { SParentElementSchema } from "./smodel"
import { SModelFactory } from "./smodel-factory"

describe('model factory', () => {
    function setup() {
        const factory = new SModelFactory()
        return factory
    }

    it('creates a single element from a schema', () => {
        const factory = setup()
        const element = factory.createElement({
            type: 'foo',
            id: 'element1'
        })
        expect(element.id).to.equal('element1')
    })
    it('creates a root element and its chilren from a schema', () => {
        const factory = setup()
        const root = factory.createRoot({
            type: 'root',
            id: 'root',
            children: [
                {
                    type: 'element',
                    id: 'element1'
                },
                {
                    type: 'element',
                    id: 'element2',
                    children: [
                        {
                            type: 'element',
                            id: 'element3'
                        }
                    ]
                } as SParentElementSchema
            ]
        })
        const element1 = root.children[0]
        expect(element1.id).to.equal('element1')
        expect(element1.parent.id).to.equal('root')
        const element3 = root.children[1].children[0]
        expect(element3.id).to.equal('element3')
        expect(element3.parent.id).to.equal('element2')
    })
    it('detects duplicate ids and throws an error', () => {
        const factory = setup()
        const test = () => factory.createRoot({
            type: 'root',
            id: 'root',
            children: [
                {
                    type: 'element',
                    id: 'element1'
                },
                {
                    type: 'element',
                    id: 'element1',
                }
            ]
        })
        expect(test).to.throw(Error)
    })
})
