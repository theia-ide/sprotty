import {View, RenderingContext} from "../../../src/base/view/views"
import {VNode} from "snabbdom/vnode"
import {Chip, Core, Channel, Crossbar} from "./chipmodel"
import {Direction} from "../../../src/utils/geometry"
import {ColorMap, RGBColor} from "../../../src/utils/color"
import * as snabbdom from "snabbdom-jsx"
import {ThunkView} from "../../../src/base/view/thunk-view"

const JSX = {createElement: snabbdom.svg}

export class ChipView implements View {
    render(model: Chip, context: RenderingContext): VNode {
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`
        return <svg key={model.id} id={model.id}>
                <g transform={transform}>
                    {context.viewer.renderChildren(model, context)}
                </g>
            </svg>
    }
}

export class CoreView extends ThunkView {
    static readonly width = 45
    static readonly dist = 20

    selector(model: Core) {
        return 'g'
    }

    watchedArgs(model: Core) {
        return [model.load, model.selected]
    }

    doRender(model: Core, context: RenderingContext): VNode {
        const position = {
            x: model.column * (CoreView.width + CoreView.dist),
            y: model.row * (CoreView.width + CoreView.dist),
        }
        const nodeName = this.padLeft(model.row) + this.padLeft(model.column)
        const transform = 'translate(' + position.x + ',' + position.y + ')'
        return <g class-core={true}
                  id={model.id}
                  key={model.id}
                  transform={transform}>
                <rect width={CoreView.width}
                      height={CoreView.width}
                      rx={4}
                      ry={4}
                      fill={LoadColor.getSVG(model.load)}/>
                <text class-text={true} x={CoreView.width / 2} y={CoreView.width / 2}>{nodeName}</text>
            </g>
    }

    private padLeft(n: number): string {
        if (n < 10)
            return '0' + n
        else
            return '' + n
    }
}

export class CrossbarView implements View {
    render(model: Crossbar, context: RenderingContext): VNode {
        const rows = (model.parent as Chip).rows
        const columns = (model.parent as Chip).rows
        let x: number
        let y: number
        let width: number
        let height: number
        switch (model.direction) {
            case Direction.up:
                width = rows * (CoreView.width + CoreView.dist) - CoreView.dist
                height = CoreView.dist
                x = 0
                y = -2 * CoreView.dist
                break;
            case Direction.down:
                width = rows * (CoreView.width + CoreView.dist) - CoreView.dist
                height = CoreView.dist
                x = 0
                y = rows * (CoreView.width + CoreView.dist)
                break;
            case Direction.left:
                x = -2 * CoreView.dist
                y = 0
                width = CoreView.dist
                height = columns * (CoreView.width + CoreView.dist) - CoreView.dist
                break;
            case Direction.right:
            default:
                x = rows * (CoreView.width + CoreView.dist)
                y = 0
                width = CoreView.dist
                height = columns * (CoreView.width + CoreView.dist) - CoreView.dist
                break;
        }
        return <rect class-crossbar={true}
                     id={model.id}
                     key={model.id}
                     width={width}
                     height={height}
                     x={x}
                     y={y} />
    }
}

class LoadColor {
    static colorMap = new ColorMap([
        {red: 0.9, green: 0.9, blue: 0.9},
        {red: 0, green: 1, blue: 0},
        {red: 1, green: 1, blue: 0},
        {red: 1, green: 0, blue: 0}
    ])

    static getSVG(load: number): string {
        return RGBColor.toSVG(LoadColor.colorMap.getColor(load))
    }
}

export class ChannelView extends ThunkView {

    static readonly width = 2

    watchedArgs(model: Channel): any[] {
        return [model.load, this.isVisible(model)]
    }

    selector(model: Channel): string {
        return 'polygon'
    }

    isVisible(model: Channel): boolean {
        return (model.root as Chip).zoom * ChannelView.width > 3
    }

    doRender(model: Channel, context: RenderingContext): VNode {
        if (!this.isVisible(model))
            return <g id={model.id} key={model.id}></g>
        let points: number[]
        switch (model.direction) {
            case Direction.up:
                points = [
                    0.75 * CoreView.width - ChannelView.width,
                    0,
                    0.75 * CoreView.width + ChannelView.width,
                    0,
                    0.75 * CoreView.width,
                    -CoreView.dist
                ]
                break;
            case Direction.down:
                points = [
                    0.25 * CoreView.width - ChannelView.width,
                    -CoreView.dist,
                    0.25 * CoreView.width + ChannelView.width,
                    -CoreView.dist,
                    0.25 * CoreView.width,
                    0
                ]
                break;
            case Direction.left:
                points = [
                    0,
                    0.25 * CoreView.width - ChannelView.width,
                    0,
                    0.25 * CoreView.width + ChannelView.width,
                    -CoreView.dist,
                    0.25 * CoreView.width
                ]
                break;
            case Direction.right:
            default:
                points = [
                    -CoreView.dist,
                    0.75 * CoreView.width - ChannelView.width,
                    -CoreView.dist,
                    0.75 * CoreView.width + ChannelView.width,
                    0,
                    0.75 * CoreView.width
                ]
        }
        const position = {
            x: model.column * (CoreView.width + CoreView.dist),
            y: model.row * (CoreView.width + CoreView.dist),
        }

        const transform = 'translate(' + position.x + ',' + position.y + ')'
        return <polygon class-channel={true}
                        id={model.id}
                        key={model.id}
                        points={points}
                        transform={transform}
                        fill={LoadColor.getSVG(model.load)} />
    }
}