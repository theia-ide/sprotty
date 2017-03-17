import {expect} from "chai"
import {SModelRoot, SChildElement, SModelIndex} from "./smodel"

describe('SModelRoot', () => {
    const element = new SModelRoot()
    element.id = 'root'
    it('contains children after adding them', () => {
        const child1 = new SChildElement()
        child1.id = 'child1'
        element.add(child1)
        const child2 = new SChildElement()
        child2.id = 'child2'
        element.add(child2)
        const child3 = new SChildElement()
        child3.id = 'child3'
        element.add(child3)
        expect(element.children.map(c => c.id)).to.deep.equal(['child1', 'child2', 'child3'])
    })
    it('can reorder children', () => {
        element.move(element.children[1], 2)
        expect(element.children.map(c => c.id)).to.deep.equal(['child1', 'child3', 'child2'])
        element.move(element.children[1], 0)
        expect(element.children.map(c => c.id)).to.deep.equal(['child3', 'child1', 'child2'])
    })
    it('can remove children', () => {
        element.remove(element.children[1])
        expect(element.children.map(c => c.id)).to.deep.equal(['child3', 'child2'])
    })
    it('correctly assigns the parent to children', () => {
        expect(element.children[0].parent.id).to.equal('root')
        expect(element.children[1].parent.id).to.equal('root')
    })
})

describe('SModelIndex', () => {
    const index = new SModelIndex()
    it('contains elements after adding them', () => {
        const child1 = new SChildElement()
        child1.id = 'child1'
        index.add(child1)
        expect(index.contains(child1)).to.be.true
        expect(index.getById('child1')!.id).to.equal('child1')
    })
    it('does not contain elements after removing them', () => {
        index.removeById('child1')
        expect(index.getById('child1')).to.be.undefined
        const child2 = new SChildElement()
        child2.id = 'child2'
        index.add(child2)
        index.remove(child2)
        expect(index.getById('child2')).to.be.undefined
    })
})
