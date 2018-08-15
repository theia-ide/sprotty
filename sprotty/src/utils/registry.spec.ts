/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import 'mocha';
import { expect } from "chai";
import { InstanceRegistry, ProviderRegistry } from "./registry";

describe('ProviderRegistry', () => {
    function setup() {
        class Foo {
            constructor(public argument: string) {
            }
        }
        const registry = new ProviderRegistry<Foo, string>();
        registry.register('foo', Foo);
        return registry;
    }
    it('creates instances of registered classes', () => {
        const registry = setup();
        const value = registry.get('foo', 'bar');
        expect(value.argument).to.equal('bar');
    });
    it('does not contain deregistered classes', () => {
        const registry = setup();
        expect(registry.hasKey('foo')).to.be.true;
        registry.deregister('foo');
        expect(registry.hasKey('foo')).to.be.false;
    });
});

describe('InstanceRegistry', () => {
    function setup() {
        const registry = new InstanceRegistry<string>();
        registry.register('foo', 'bar');
        return registry;
    }
    it('returns the registered values', () => {
        const registry = setup();
        const value = registry.get('foo');
        expect(value).to.equal('bar');
    });
    it('does not contain deregistered classes', () => {
        const registry = setup();
        expect(registry.hasKey('foo')).to.be.true;
        registry.deregister('foo');
        expect(registry.hasKey('foo')).to.be.false;
    });
});
