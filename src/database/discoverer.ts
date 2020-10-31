import { ClassRegistry } from './registry';
import * as requiredir from 'requiredir';
import { Logger } from 'utils/Logger';

export class Discoverer {
    constructor(private _logger: Logger) {
    }

    loadFile(path: string): ClassRegistry {
        // ClassRegistry.initialize();

        this._logger.info(`Load file : ${path}`);

        require(path);
        return ClassRegistry.current;
    }

    loadDirectory(path: string): ClassRegistry {
        // ClassRegistry.initialize();

        this._logger.info(`Load directory : ${path}`);

        requiredir(path);
        return ClassRegistry.current;
    }
}
