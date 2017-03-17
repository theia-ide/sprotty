import {expect} from "chai"
import {almostEquals} from "./geometry"

describe('almostEquals', () => {
    it('returns false for clearly different values', () => {
        expect(almostEquals(3, 17)).to.be.false
    })
    it('returns true for almost equal values', () => {
        expect(almostEquals(3.12895, 3.12893)).to.be.true
    })
})
