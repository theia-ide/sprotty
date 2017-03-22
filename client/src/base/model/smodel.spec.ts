import {expect} from "chai"
import {SModelRoot, SChildElement, SModelIndex} from "./smodel"

describe('SModelRoot', () => {
    function setup() {
        const element = new SModelRoot()
        element.id = 'root'
        const child1 = new SChildElement()
        child1.id = 'child1'
        element.add(child1)
        const child2 = new SChildElement()
        child2.id = 'child2'
        element.add(child2)
        const child3 = new SChildElement()
        child3.id = 'child3'
        element.add(child3)
        return element
    }
    it('contains children after adding them', () => {
        const element = setup()
        expect(element.children.map(c => c.id)).to.deep.equal(['child1', 'child2', 'child3'])
    })
    it('can reorder children', () => {
        const element = setup()
        element.move(element.children[1], 2)
        expect(element.children.map(c => c.id)).to.deep.equal(['child1', 'child3', 'child2'])
        element.move(element.children[1], 0)
        expect(element.children.map(c => c.id)).to.deep.equal(['child3', 'child1', 'child2'])
    })
    it('can remove children', () => {
        const element = setup()
        element.remove(element.children[1])
        expect(element.children.map(c => c.id)).to.deep.equal(['child1', 'child3'])
    })
    it('correctly assigns the parent to children', () => {
        const element = setup()
        expect(element.children[0].parent.id).to.equal('root')
        expect(element.children[2].parent.id).to.equal('root')
    })
})

describe('SModelIndex', () => {
    function setup() {
        const index = new SModelIndex()
        const child1 = new SChildElement()
        child1.id = 'child1'
        index.add(child1)
        const child2 = new SChildElement()
        child2.id = 'child2'
        index.add(child2)
        return {index, child1, child2}
    }
    it('contains elements after adding them', () => {
        const ctx = setup()
        expect(ctx.index.contains(ctx.child1)).to.be.true
        expect(ctx.index.getById('child1')!.id).to.equal('child1')
    })
    it('does not contain elements after removing them', () => {
        const ctx = setup()
        ctx.index.removeById('child1')
        expect(ctx.index.getById('child1')).to.be.undefined
        ctx.index.remove(ctx.child2)
        expect(ctx.index.getById('child2')).to.be.undefined
    })
})
