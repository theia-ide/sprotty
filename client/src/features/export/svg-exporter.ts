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
                const svg = this.createSvg(svgElement, root)
                this.actionDispatcher.dispatch(new ExportSvgAction(svg))
            }
        }
    }

    protected createSvg(svgElementOrig: SVGSVGElement, root: SModelRoot): string {
        const stylesFromCSS = this.createStylesFromCSS(document.styleSheets)
        const serializer = new XMLSerializer()
        const svgCopy = serializer.serializeToString(svgElementOrig)
        const parser = new DOMParser()
        const svgDocument = parser.parseFromString(svgCopy, "image/svg+xml")
        const svgElement = svgDocument.rootElement
        const style = this.getChild(svgDocument, svgElement, 'style')
        style.setAttribute('type', 'text/css')
        const stylesCData = svgDocument.createCDATASection(stylesFromCSS)
        style.appendChild(stylesCData)
        const defs = this.getChild(svgDocument, svgElement, 'defs')
        defs.appendChild(style)
        svgElement.setAttribute('version', '1.1')
        svgElement.removeAttribute('opacity')
        if (!svgElement.classList.contains('sprotty'))
            svgElement.classList.add('sprotty')
        const bounds = this.getBounds(root)
        svgElement.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`)
        return serializer.serializeToString(svgElement)
    }

    protected getChild(svgDocument: Document, svgElement: SVGSVGElement, tagName: string): HTMLElement {
        if (svgElement.children) {
            for (let i = 0; i < svgElement.children.length; ++i) {
                const child = svgElement.children.item(i)
                if (child.tagName === tagName)
                    return child as HTMLElement
            }
            const defs = svgDocument.createElement(tagName)
            svgElement.insertBefore(defs, svgElement.firstChild)
            return defs
        } else {
            const defs = svgDocument.createElement(tagName)
            svgElement.appendChild(defs)
            return defs
        }
    }

    protected createStylesFromCSS(styleSheets: StyleSheetList): string {
        let css = ''
        for (let i = 0; i < styleSheets.length; ++i) {
            const styleSheet = styleSheets.item(i) as CSSStyleSheet
            if (this.isExported(styleSheet)) {
                if (styleSheet.cssRules) {
                    for (let j = 0; j < styleSheet.cssRules.length; ++j)
                        css = css + styleSheet.cssRules.item(j).cssText + ' '
                } else {
                    if (isCrossSite(styleSheet.href))
                        this.log.warn(this, styleSheet.href + ' is a cross-site css which cannot be inspected by some browsers. SVG may lack some styles.')
                }
            }
            // IE has its own way of listing imported stylesheets
            const imports = (styleSheet as any)['imports'] as StyleSheetList
            if (imports !== undefined) {
                css += this.createStylesFromCSS(imports)
            }
        }
        return css
    }

    /**
     * By default, only CSS rules from files
     * 1) with a specific comment
     * 2) with standard file names
     * are exported.
     */
    protected isExported(styleSheet: CSSStyleSheet) {
        return this.isStandardSprottyStylesheet(styleSheet) || this.hasExportComment(styleSheet)
    }

    protected isStandardSprottyStylesheet(styleSheet: CSSStyleSheet) {
        return styleSheet.href && (styleSheet.href.endsWith('sprotty.css') || styleSheet.href.endsWith('diagram.css'))
    }

    protected hasExportComment(styleSheet: CSSStyleSheet) {
        return styleSheet.ownerNode
            && (styleSheet.ownerNode as any).innerHTML
            && (styleSheet.ownerNode as any).innerHTML.indexOf('/* sprotty SVG export */') !== -1
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