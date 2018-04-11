/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "mocha";
import { expect } from "chai";
import { FluentIterable, FluentIterableImpl, DONE_RESULT } from './iterable';

describe('FluentIterableImpl', () => {
    const iterable: FluentIterable<number> = new FluentIterableImpl(() => ({ n: 1 }), state => {
        if (state.n <= 4)
            return { done: false, value: state.n++ };
        else
            return DONE_RESULT;
    });

    it('iterates elements', () => {
        let result = 0;
        iterable.forEach(n => result += n);
        expect(result).to.equal(10);
    });

    it('filters elements', () => {
        let result = 0;
        iterable.filter(n => n % 2 === 0).forEach(n => result += n);
        expect(result).to.equal(6);
    });

    it('maps elements', () => {
        let result = 0;
        iterable.map(n => n + 0.5).forEach(n => result += n);
        expect(result).to.equal(12);
    });

    it('filters and maps elements', () => {
        let result = 0;
        iterable.filter(n => n % 2 === 0).map(n => n + 0.5).forEach(n => result += n);
        expect(result).to.equal(7);
    });
});
