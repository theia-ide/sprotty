import { RenderingContext, IView } from "../../../src/base/view/views"
import { VNode } from "snabbdom/vnode"
import { AllocatedTask, Channel, Core, Crossbar, Processor } from './chipmodel';
import { Direction } from "../../../src/utils/geometry"
import { ColorMap, RGBColor, toSVG, rgb } from '../../../src/utils';
import * as snabbdom from "snabbdom-jsx"
import { ThunkView } from "../../../src/base/view/thunk-view"

const JSX = {createElement: snabbdom.svg}

export class ProcessorView implements IView {
    render(model: Processor, context: RenderingContext): VNode {
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`
        return <svg key={model.id} id={model.id}>
                <g transform={transform}>
                    {context.renderChildren(model, context)}
                </g>
            </svg>
    }
}

export const CORE_WIDTH = 50
export const CORE_DISTANCE = 15

export class CoreView implements IView {

    render(model: Core, context: RenderingContext): VNode {
        const nodeName = parseInt(model.id.substr(5))
        const fillColor = model.children.length > 0 
            ? KernelColor.getSVG((model.children[0] as AllocatedTask).kernelNr)
            : toSVG({red: 150, green:150, blue: 150})
        return <g class-core={true}
                  id={model.id}
                  key={model.id}>
                <rect width={model.size.width}
                      height={model.size.height}
                      rx={4}
                      ry={4}
                      fill={fillColor}/>
                <text class-text={true} x={CORE_WIDTH / 2} y={CORE_WIDTH / 2}>{this.padLeft(nodeName)}</text>
            </g>
    }

    private padLeft(n: number): string {
        if (n < 10)
            return '000' + n
        if (n < 100)
            return '00' + n
        if (n < 1000)
            return '0' + n
        else
            return '' + n
    }
}

export class CrossbarView implements IView {
    render(model: Crossbar, context: RenderingContext): VNode {
        const rows = (model.parent as Processor).rows
        const columns = (model.parent as Processor).rows
        let x: number
        let y: number
        let width: number
        let height: number
        switch (model.direction) {
            case Direction.up:
                width = rows * (CORE_WIDTH + CORE_DISTANCE) - CORE_DISTANCE
                height = CORE_DISTANCE
                x = 0
                y = -2 * CORE_DISTANCE
                break;
            case Direction.down:
                width = rows * (CORE_WIDTH + CORE_DISTANCE) - CORE_DISTANCE
                height = CORE_DISTANCE
                x = 0
                y = rows * (CORE_WIDTH + CORE_DISTANCE)
                break;
            case Direction.left:
                x = -2 * CORE_DISTANCE
                y = 0
                width = CORE_DISTANCE
                height = columns * (CORE_WIDTH + CORE_DISTANCE) - CORE_DISTANCE
                break;
            case Direction.right:
            default:
                x = rows * (CORE_WIDTH + CORE_DISTANCE)
                y = 0
                width = CORE_DISTANCE
                height = columns * (CORE_WIDTH + CORE_DISTANCE) - CORE_DISTANCE
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

class KernelColor {
    static colorMap: RGBColor[] = [
        rgb(141,211,199), rgb(255,255,179), rgb(190,186,218), rgb(251,128,114), 
        rgb(128,177,211), rgb(253,180,98), rgb(179,222,105), rgb(252,205,229), 
        rgb(217,217,217), rgb(188,128,189), rgb(204,235,197), rgb(255,237,111)
    ]

    static getSVG(index: number): string {
        return toSVG(KernelColor.colorMap[index % KernelColor.colorMap.length])
    }
}

const CHANNEL_WIDTH = 2

export class ChannelView extends ThunkView {

    watchedArgs(model: Channel): any[] {
        return [model.load, this.isVisible(model)]
    }

    selector(model: Channel): string {
        return 'polygon'
    }

    isVisible(model: Channel): boolean {
        return (model.root as Processor).zoom * CHANNEL_WIDTH > 3
    }

    doRender(model: Channel, context: RenderingContext): VNode {
        if (!this.isVisible(model))
            return <g id={model.id} key={model.id} />
        let points: number[]
        switch (model.direction) {
            case Direction.up:
                points = [
                    0.75 * CORE_WIDTH - CHANNEL_WIDTH,
                    0,
                    0.75 * CORE_WIDTH + CHANNEL_WIDTH,
                    0,
                    0.75 * CORE_WIDTH,
                    -CORE_DISTANCE
                ]
                break;
            case Direction.down:
                points = [
                    0.25 * CORE_WIDTH - CHANNEL_WIDTH,
                    -CORE_DISTANCE,
                    0.25 * CORE_WIDTH + CHANNEL_WIDTH,
                    -CORE_DISTANCE,
                    0.25 * CORE_WIDTH,
                    0
                ]
                break;
            case Direction.left:
                points = [
                    0,
                    0.25 * CORE_WIDTH - CHANNEL_WIDTH,
                    0,
                    0.25 * CORE_WIDTH + CHANNEL_WIDTH,
                    -CORE_DISTANCE,
                    0.25 * CORE_WIDTH
                ]
                break;
            case Direction.right:
            default:
                points = [
                    -CORE_DISTANCE,
                    0.75 * CORE_WIDTH - CHANNEL_WIDTH,
                    -CORE_DISTANCE,
                    0.75 * CORE_WIDTH + CHANNEL_WIDTH,
                    0,
                    0.75 * CORE_WIDTH
                ]
        }
        const position = {
            x: model.column * (CORE_WIDTH + CORE_DISTANCE),
            y: model.row * (CORE_WIDTH + CORE_DISTANCE),
        }

        const transform = 'translate(' + position.x + ',' + position.y + ')'
        return <polygon class-channel={true}
                        id={model.id}
                        key={model.id}
                        points={points}
                        transform={transform}
                        fill={toSVG({red: 120, green: 180, blue: 220})} />
    }
}