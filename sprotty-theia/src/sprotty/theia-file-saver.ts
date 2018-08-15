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

import { inject, injectable } from 'inversify'
import { ExportSvgAction } from 'sprotty/lib'
import { FileSystem } from '@theia/filesystem/lib/common'
import { MessageService } from '@theia/core/lib/common'

@injectable()
export class TheiaFileSaver {
    constructor(@inject(FileSystem) protected readonly fileSystem: FileSystem,
                @inject(MessageService) protected readonly messageService: MessageService) {
    }

    save(sourceUri: string, action: ExportSvgAction) {
        this.getNextFileName(sourceUri).then(fileName =>
            this.fileSystem.createFile(fileName, { content: action.svg })
                .then(() =>
                    this.messageService.info(`Diagram exported to '${fileName}'`)
                )
                .catch((error) =>
                    this.messageService.error(`Error exporting diagram '${error}`)
                )
        )
    }

    getNextFileName(sourceUri: string): Promise<string> {
        return new Promise<string>(resolve => this.tryNextFileName(sourceUri, 0, resolve))
    }

    tryNextFileName(sourceURI: string, count: number, resolve: (fileName: string) => void) {
        const currentName = sourceURI + (count === 0 ? '' : count) + '.svg'
        this.fileSystem.exists(currentName).then(exists => {
            if (!exists)
                resolve(currentName)
            else
                this.tryNextFileName(sourceURI, ++count, resolve)
        })
    }
}