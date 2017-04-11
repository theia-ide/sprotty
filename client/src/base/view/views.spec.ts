import "mocha"
import { expect } from "chai"
import { EMPTY_ROOT } from "../model/smodel-factory"
import { SNode } from "../../graph/model/sgraph"
import { EmptyView, MissingView } from "./views"
import { Viewer, ModelRenderer } from "./viewer"

const toHTML = require('snabbdom-to-html')

describe('base views', () => {

    const context = new ModelRenderer(undefined!, [])

    it('empty view', () => {
        const emptyView = new EmptyView()
        const vnode = emptyView.render(EMPTY_ROOT, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal('<svg id="EMPTY" class="empty"></svg>')
    })

    const missingView = new MissingView

    it('missing view', () => {
        const vnode = missingView.render(EMPTY_ROOT, context)
        expect(toHTML(vnode)).to.be.equal('<text id="EMPTY" class="missing" x="0" y="0">?EMPTY?</text>')
        const model = new SNode()
        model.x = 42
        model.y = 41
        model.id = 'foo'
        model.type = 'type'
        const vnode1 = missingView.render(model, context)
        expect(toHTML(vnode1)).to.be.equal(
            '<text id="foo" class="missing" x="42" y="41">?foo?</text>')
    })
})
