import { RenderingContext, ThunkView, ModelRenderer } from './';
import "mocha"
import { expect } from "chai"
import { SModelElement } from "../model/smodel"
import * as snabbdom from "snabbdom-jsx"
import { init } from "snabbdom"
import { Viewer } from "./viewer"

const toHTML = require('snabbdom-to-html')
const JSX = {createElement: snabbdom.svg}


describe('Thunk View', () => {

    before(function () {
        this.jsdom = require('jsdom-global')()
    })

    after(function () {
        this.jsdom()
    })

    let renderCount = 0

    class Foo extends SModelElement {
        foo: string
    }

    class FooView extends ThunkView {
        doRender() {
           return  <g id={renderCount++}></g>
        }

        selector() {
            return 'g'
        }

        watchedArgs(foo: Foo) {
            return [foo.foo]
        }
    }

    const context = new ModelRenderer(undefined!, [])

    const patcher = init([])

    it('renders on change', () => {
        const element = new Foo()
        element.foo = 'first'
        const view = new FooView()
        const vnode = view.render(element, context)
        const domElement = document.createElement('div')
        domElement.setAttribute('id', 'sprotty')
        patcher(domElement, vnode)
        expect(toHTML(vnode)).to.be.equal('<g id="0"></g>')

        const vnode1 = view.render(element, context)
        patcher(vnode, vnode1)
        expect(toHTML(vnode1)).to.be.equal('<g id="0"></g>')

        element.foo = 'second'
        const vnode2 = view.render(element, context)
        patcher(vnode1, vnode2)
        expect(toHTML(vnode2)).to.be.equal('<g id="1"></g>')
    })
})