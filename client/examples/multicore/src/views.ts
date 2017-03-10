import {View, RenderingContext} from "../../../src/base/view/views"
import {h} from "snabbdom"
import {VNode} from "snabbdom/vnode"
import {GChip, GCore, GChannel, GCrossbar} from "./gmodel"
import {Direction} from "../../../src/utils/geometry"

export class GChipView implements View {
    render(model: GChip, context: RenderingContext): VNode {
        const vNode = h('svg', {
                key: model.id,
                attrs: {
                    id: model.id
                }
            }, [
                h('g', {
                    attrs: {
                        transform: 'translate(100,100)'
                    }
                }, context.viewer.renderChildren(model, context))]
        );
        return vNode
    }
}

export class GCoreView implements View {
    static readonly width = 50
    static readonly dist = 20

    render(model: GCore, context: RenderingContext): VNode {
        const position = {
            x: model.column * (GCoreView.width + GCoreView.dist),
            y: model.row * (GCoreView.width + GCoreView.dist),
        }
        const nodeName = this.padLeft(model.row) + this.padLeft(model.column)
        return h('g', {
            class: {
                node: true
            },
            attrs: {
                id: model.id,
                key: model.id,
                transform: 'translate(' + position.x + ',' + position.y + ')'
            }
        }, [
            h('rect', {
                attrs: {
                    width: GCoreView.width,
                    height: GCoreView.width,
                    rx: 4,
                    ry: 4,
                }
            }),
            h('text', {
                class: {
                    text: true
                },
                attrs: {
                    'text-anchor': 'middle',
                    x: GCoreView.width / 2,
                    y: GCoreView.width / 2
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

export class GCrossbarView implements View {
    render(model: GCrossbar, context: RenderingContext): VNode {
        const rows = (model.parent as GChip).rows
        const columns = (model.parent as GChip).rows
        let x: number
        let y: number
        let width: number
        let height: number
        switch (model.direction) {
            case Direction.up:
                width = rows * (GCoreView.width + GCoreView.dist) - GCoreView.dist
                height = GCoreView.dist
                x = 0
                y = -2 * GCoreView.dist
                break;
            case Direction.down:
                width = rows * (GCoreView.width + GCoreView.dist) - GCoreView.dist
                height = GCoreView.dist
                x = 0
                y = rows * (GCoreView.width + GCoreView.dist)
                break;
            case Direction.left:
                x = -2 * GCoreView.dist
                y = 0
                width = GCoreView.dist
                height = columns * (GCoreView.width + GCoreView.dist) - GCoreView.dist
                break;
            case Direction.right:
                x = rows * (GCoreView.width + GCoreView.dist)
                y = 0
                width = GCoreView.dist
                height = columns * (GCoreView.width + GCoreView.dist) - GCoreView.dist
                break;
        }
        return h('rect', {
            class: {
                node: true
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

export class GChannelView implements View {
    static readonly width = 2

    render(model: GChannel, context: RenderingContext): VNode {
        let points: number[]
        switch (model.direction) {
            case Direction.up:
                points = [
                    0.75 * GCoreView.width - GChannelView.width,
                    0,
                    0.75 * GCoreView.width + GChannelView.width,
                    0,
                    0.75 * GCoreView.width,
                    -GCoreView.dist
                ]
                break;
            case Direction.down:
                points = [
                    0.25 * GCoreView.width - GChannelView.width,
                    -GCoreView.dist,
                    0.25 * GCoreView.width + GChannelView.width,
                    -GCoreView.dist,
                    0.25 * GCoreView.width,
                    0
                ]
                break;
            case Direction.left:
                points = [
                    0,
                    0.25 * GCoreView.width - GChannelView.width,
                    0,
                    0.25 * GCoreView.width + GChannelView.width,
                    -GCoreView.dist,
                    0.25 * GCoreView.width
                ]
                break;
            case Direction.right:
                points = [
                    -GCoreView.dist,
                    0.75 * GCoreView.width - GChannelView.width,
                    -GCoreView.dist,
                    0.75 * GCoreView.width + GChannelView.width,
                    0,
                    0.75 * GCoreView.width
                ]
        }
        const position = {
            x: model.column * (GCoreView.width + GCoreView.dist),
            y: model.row * (GCoreView.width + GCoreView.dist),
        }
        return h('polygon', {
            class: {
                edge: true,
            },
            attrs: {
                id: model.id,
                key: model.id,
                points: points,
                transform: 'translate(' + position.x + ',' + position.y + ')'
            }
        })
    }
}