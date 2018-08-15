/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

 /** @jsx svg */
import { svg } from 'snabbdom-jsx';

import "mocha";
import { expect } from "chai";
import { init } from "snabbdom";
import { SModelElement } from "../model/smodel";
import { ModelRenderer } from './viewer';
import { ThunkView } from './thunk-view';

const toHTML = require('snabbdom-to-html');


describe('ThunkView', () => {

    before(function () {
        // tslint:disable-next-line:no-invalid-this
        this.jsdom = require('jsdom-global')();
    });

    after(function () {
        // tslint:disable-next-line:no-invalid-this
        this.jsdom();
    });

    let renderCount = 0;

    class Foo extends SModelElement {
        foo: string;
    }

    class FooView extends ThunkView {
        doRender() {
           return  <g id={renderCount++}></g>;
        }

        selector() {
            return 'g';
        }

        watchedArgs(foo: Foo) {
            return [foo.foo];
        }
    }

    const context = new ModelRenderer(undefined!, []);

    const patcher = init([]);

    it('renders on change', () => {
        const element = new Foo();
        element.foo = 'first';
        const view = new FooView();
        const vnode = view.render(element, context);
        const domElement = document.createElement('div');
        domElement.setAttribute('id', 'sprotty');
        patcher(domElement, vnode);
        expect(toHTML(vnode)).to.be.equal('<g id="0"></g>');

        const vnode1 = view.render(element, context);
        patcher(vnode, vnode1);
        expect(toHTML(vnode1)).to.be.equal('<g id="0"></g>');

        element.foo = 'second';
        const vnode2 = view.render(element, context);
        patcher(vnode1, vnode2);
        expect(toHTML(vnode2)).to.be.equal('<g id="1"></g>');
    });
});
