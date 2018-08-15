/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import "reflect-metadata"
import "mocha"
import { expect } from "chai"
import { Container, ContainerModule, injectable, inject } from "inversify"

@injectable()
class Connector {
    static counter: number = 0
    c: number

    constructor() {
        this.c = Connector.counter++
    }

}

@injectable()
abstract class AbstractManager {
    @inject(Connector) connector: Connector
}

@injectable()
class Manager0 extends AbstractManager {
}

@injectable()
class Manager1 extends AbstractManager {
}

const m0 = Symbol('Manager0')
const m1 = Symbol('Manager1')

describe('inversify', () => {
    it('error', () => {
        const module = new ContainerModule(bind => {
            bind(Connector).to(Connector).inSingletonScope()
            bind(Manager0).to(Manager0).inSingletonScope()
            bind(Manager1).to(Manager1).inSingletonScope()
            bind(m0).toDynamicValue(c => c.container.get(Manager0))
            bind(m1).toDynamicValue(c => c.container.get(Manager1))
        })

        const container = new Container()
        container.load(module)
        const manager0 = container.get(Manager0)
        const manager1 = container.get(Manager1)
        expect(manager0.connector.c).to.be.equal(manager1.connector.c)
        const m0inst = container.get<Manager0>(m0)
        const m1inst = container.get<Manager1>(m1)
        expect(m0inst.connector.c).to.be.equal(m1inst.connector.c)

    })
})