import {View, RenderingContext} from "../../../src/base/view/views"
import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {Chip, Core, Channel, Crossbar} from "./chipmodel"
import {Direction} from "../../../src/utils/geometry"
import {ColorMap, RGBColor} from "../../../src/utils/color"

export class ChipView implements View {
    render(model: Chip, context: RenderingContext): VNode {
        const vNode = h('svg', {
                key: model.id,
                attrs: {
                    id: model.id,
                    viewBox: "0 0 " + model.columns * (CoreView.width + CoreView.dist) +
                    " " + (model.columns + 1) * (CoreView.width + CoreView.dist)
                }
            }, [
                h('g', {
                    attrs: {
                        transform: 'translate(' + CoreView.width + ',' + CoreView.width + ')'
                    }
                }, context.viewer.renderChildren(model, context))]
        );
        return vNode
    }
}

export class CoreView implements View {
    static readonly width = 45
    static readonly dist = 20

    render(model: Core, context: RenderingContext): VNode {
        const position = {
            x: model.column * (CoreView.width + CoreView.dist),
            y: model.row * (CoreView.width + CoreView.dist),
        }
        const nodeName = this.padLeft(model.row) + this.padLeft(model.column)
        return h('g', {
            class: {
                core: true
            },
            attrs: {
                id: model.id,
                key: model.id,
                transform: 'translate(' + position.x + ',' + position.y + ')'
            }
        }, [
            h('rect', {
                attrs: {
                    width: CoreView.width,
                    height: CoreView.width,
                    rx: 4,
                    ry: 4,
                    fill: LoadColor.getSVG(model.load)
                }
            }),
            h('text', {
                class: {
                    text: true
                },
                attrs: {
                    'text-anchor': 'middle',
                    x: CoreView.width / 2,
                    y: CoreView.width / 2,
                }
            }, nodeName)
        ]);
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
        return h('rect', {
            class: {
                crossbar: true
            },
            attrs: {
                id: model.id,
                key: model.id,
                width: width,
                height: height,
                x: x,
                y: y,
            }
        });
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

export class ChannelView implements View {
    static readonly width = 2

    render(model: Channel, context: RenderingContext): VNode {
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

        return h('polygon', {
            class: {
                channel: true,
            },
            attrs: {
                id: model.id,
                key: model.id,
                points: points,
                transform: 'translate(' + position.x + ',' + position.y + ')',
                fill: LoadColor.getSVG(model.load)
            }
        })
    }
}