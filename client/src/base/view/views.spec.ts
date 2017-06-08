/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import 'mocha'
import { expect } from "chai"
import { EMPTY_ROOT, SModelFactory } from '../model/smodel-factory'
import { SNode } from "../../graph/model/sgraph"
import { EmptyView, MissingView } from "./views"
import { ModelRenderer } from "./viewer"

const toHTML = require('snabbdom-to-html')

describe('base views', () => {

    const emptyRoot = new SModelFactory().createRoot(EMPTY_ROOT)
    const context = new ModelRenderer(undefined!, [])

    it('empty view', () => {
        const emptyView = new EmptyView()
        const vnode = emptyView.render(emptyRoot, context)
        const html = toHTML(vnode)
        expect(html).to.be.equal('<svg class="empty"></svg>')
    })

    const missingView = new MissingView

    it('missing view', () => {
        const vnode = missingView.render(emptyRoot, context)
        expect(toHTML(vnode)).to.be.equal('<text class="missing" x="0" y="0">?EMPTY?</text>')
        const model = new SNode()
        model.bounds = {
            x: 42,
            y: 41,
            width: 0,
            height: 0
        }
        model.id = 'foo'
        model.type = 'type'
        const vnode1 = missingView.render(model, context)
        expect(toHTML(vnode1)).to.be.equal('<text class="missing" x="42" y="41">?foo?</text>')
    })
})
