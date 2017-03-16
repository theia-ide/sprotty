import {expect} from "chai"
import "mocha"
import { almostEquals } from "./geometry"

describe('almostEquals', () => {
    it('should return false for clearly different values', () => {
        expect(almostEquals(3, 17)).to.be.false
    })
    it('should return true for almost equal values', () => {
        expect(almostEquals(3.12895, 3.12893)).to.be.true
    })
})
