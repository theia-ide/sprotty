import "mocha"
import { expect } from "chai"
import { almostEquals, euclideanDistance, manhattanDistance } from "./geometry"

describe('euclideanDistance', () => {
    it('works as expected', () => {
        expect(euclideanDistance({x: 0, y: 0}, {x: 3, y: 4})).to.equal(5)
    })
})

describe('manhattanDistance', () => {
    it('works as expected', () => {
        expect(manhattanDistance({x: 0, y: 0}, {x: 3, y: 4})).to.equal(7)
    })
})

describe('almostEquals', () => {
    it('returns false for clearly different values', () => {
        expect(almostEquals(3, 17)).to.be.false
    })
    it('returns true for almost equal values', () => {
        expect(almostEquals(3.12895, 3.12893)).to.be.true
    })
})
