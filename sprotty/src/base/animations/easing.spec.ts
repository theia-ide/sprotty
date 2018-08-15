/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import "mocha";
import { expect } from "chai";
import { easeInOut } from "./easing";

describe('easing', () => {
    it('test in/out', () => {
        let lastValue = 0;
        for (let i = 0; i < 10; ++i) {
            const newValue = easeInOut(0.1 * i);
            expect(newValue).to.be.at.least(0);
            expect(newValue).to.be.at.most(1);
            expect(newValue).to.be.at.least(lastValue);
            lastValue = newValue;
        }
    });
});
