import {expect} from "chai"
import "mocha"
import { ProviderRegistry, InstanceRegistry } from "./utils";

describe('ProviderRegistry', () => {
    class Foo {
        constructor(public argument: string) {
        }
    }
    const registry = new ProviderRegistry<Foo, string>()
    registry.register('foo', Foo)
    it('should create instances of registered classes', () => {
        const value = registry.get('foo', 'bar')
        expect(value.argument).to.equal('bar')
    })
    it('should not contain deregistered classes', () => {
        expect(registry.hasKey('foo')).to.be.true
        registry.deregister('foo')
        expect(registry.hasKey('foo')).to.be.false
    })
})

describe('InstanceRegistry', () => {
    const registry = new InstanceRegistry<string>()
    registry.register('foo', 'bar')
    it('should return the registered values', () => {
        const value = registry.get('foo')
        expect(value).to.equal('bar')
    })
    it('should not contain deregistered classes', () => {
        expect(registry.hasKey('foo')).to.be.true
        registry.deregister('foo')
        expect(registry.hasKey('foo')).to.be.false
    })
})
