import {SModel} from "../model/smodel"
import {EmptyView, MissingView} from "./views"
import {Viewer} from "./viewer"
import {SNode} from "../../graph/model/sgraph"
const toHTML = require('snabbdom-to-html')

describe('base views', () => {

    const context = {viewer: new Viewer()}

    it('empty view', () => {
        const emptyView = new EmptyView()
        const vnode = emptyView.render(SModel.EMPTY_ROOT, context)
        const html = toHTML(vnode)
        expect(html).toMatchSnapshot()
    })

    const missingView = new MissingView

    it('missing view', () => {
        const vnode = missingView.render(SModel.EMPTY_ROOT, context)
        expect(toHTML(vnode)).toMatchSnapshot()
        const model = new SNode()
        model.x = 42
        model.y = 41
        model.id = 'foo'
        model.type = 'type'
        const vnode1 = missingView.render(model, context)
        expect(toHTML(vnode1)).toMatchSnapshot()
    })
})
