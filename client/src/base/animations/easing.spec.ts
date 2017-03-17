import {easeInOut} from "./easing"
import {expect} from "chai"
import "mocha"

describe('easing', () => {
    it('test in/out',() => {
        let lastValue = 0
        for(let i=0; i< 10; ++i) {
            const newValue = easeInOut(0.1 * i)
            expect(newValue).to.be.at.least(0)
            expect(newValue).to.be.at.most(1)
            expect(newValue).to.be.at.least(lastValue)
            lastValue = newValue
        }
    })
})