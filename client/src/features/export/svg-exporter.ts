/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ViewerOptions } from '../../base/views/viewer-options'
import { isBoundsAware } from '../bounds/model'
import { Action } from '../../base/actions/action'
import { ActionDispatcher } from '../../base/actions/action-dispatcher'
import { TYPES } from '../../base/types'
import { SModelRoot } from '../../base/model/smodel'
import { Bounds, combine, EMPTY_BOUNDS } from '../../utils/geometry'
import { ILogger } from '../../utils/logging'
import { isCrossSite } from '../../utils/browser'
import { injectable, inject } from "inversify"

export class ExportSvgAction implements Action {
    static KIND = 'exportSvg'
    kind = ExportSvgAction.KIND

    constructor(public readonly svg: string) {}
}

@injectable()
export class SvgExporter {

    constructor(@inject(TYPES.ViewerOptions) protected options: ViewerOptions,
                @inject(TYPES.IActionDispatcher) protected actionDispatcher: ActionDispatcher,
                @inject(TYPES.ILogger) protected log: ILogger) {
    }

    export(root: SModelRoot): void {
        if (typeof document !== 'undefined') {
            const div = document.getElementById(this.options.hiddenDiv)
            if (div !== null && div.firstElementChild && div.firstElementChild.tagName === 'svg') {
                const svgElement = div.firstElementChild as SVGSVGElement
                this.prepareSvg(svgElement, root)
                const svg = div.innerHTML
                this.actionDispatcher.dispatch(new ExportSvgAction(svg))
            }
        }
    }

    protected prepareSvg(svgElement: SVGSVGElement, root: SModelRoot) {
        const defs = this.getChild(svgElement, 'defs')
        defs.appendChild(this.createStyleFromCSS(svgElement))
        svgElement.setAttribute('version', '1.1')
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        svgElement.removeAttribute('opacity')
        svgElement.setAttribute('class', 'sprotty ' + svgElement.getAttribute('class'))
        const bounds = this.getBounds(root)
        svgElement.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`)
    }

    protected getChild(svgElement: SVGSVGElement, tagName: string): HTMLElement {
        if (svgElement.children) {
            for (let i = 0; i < svgElement.children.length; ++i) {
                const child = svgElement.children.item(i)
                if (child.tagName === tagName)
                    return child as HTMLElement
            }
            const defs = document.createElement(tagName)
            svgElement.insertBefore(defs, svgElement.firstChild)
            return defs
        } else {
            const defs = document.createElement(tagName)
            svgElement.appendChild(defs)
            return defs
        }
    }

    protected createStyleFromCSS(svgElement: SVGSVGElement): Element {
        let css = '<![CDATA['
        for (let i = 0; i < document.styleSheets.length; ++i) {
            const styleSheet = document.styleSheets.item(i) as CSSStyleSheet
            if (styleSheet.cssRules) {
                for (let j = 0; j < styleSheet.cssRules.length; ++j)
                    css = css + styleSheet.cssRules.item(j).cssText + ' '
            } else {
                if (isCrossSite(styleSheet.href))
                    this.log.warn(this, styleSheet.href + ' is a cross-site css which cannot be inspected by some browsers. SVG may lack some styles.')
            }
        }
        css += ']]>'
        const style = this.getChild(svgElement, 'style')
        style.setAttribute('type', 'text/css')
        style.innerText = css
        return style
    }

    protected getBounds(root: SModelRoot) {
        let allBounds: Bounds[] = [ EMPTY_BOUNDS ]
        root.children.forEach(element => {
            if (isBoundsAware(element)) {
                allBounds.push(element.bounds)
            }
        })
        return allBounds.reduce((one, two) => combine(one, two))
    }
}