import { ClassRegistry } from './registry';
import { PropertiesMeta, PropertiesKey } from './decorators';
import { Neo4jConnection } from './services';
import { Logger } from 'utils/Logger';

export class DbDeployer {
    constructor(public registry: ClassRegistry, private _db: Neo4jConnection, private _logger: Logger) {
    }

    createUniqueConstraint(vertice: string, property: string) {
        this._logger.info(`create unique contraint for ${vertice} on ${property}`);
        let query = `CREATE CONSTRAINT ON (v:${vertice}) ASSERT v.${property} IS UNIQUE`;

        return this._db.query(query).then(r => {
            this._logger.info(`unique contraint for ${vertice} on ${property} created successfully`);

            return r;
        }, e => {
            this._logger.error('dbsetup error: ', e);
            return e;
        });
    }

    createIndex(vertice: string, property: string): Promise<any> {
        this._logger.info(`create index for ${vertice} on ${property}`);
        let query = `CREATE INDEX ON :${vertice}(${property})`;

        return this._db.query(query).then(r => {
            this._logger.info(`index for ${vertice} on ${property} created successfully`);

            return r;
        }, e => {
            this._logger.error('dbsetup error: ', e);
            return e;
        });
    }

    async launch(): Promise<void> {
        let classes = this.registry.getClasses();
        this._logger.info(`Start dbsetup for ${Object.keys(classes).length} items`);
        try {
            for (let name in classes) {
                let propsMeta: PropertiesMeta = Reflect.getMetadata(PropertiesKey, classes[name]);
                if (propsMeta) {
                    for (let prop of propsMeta.uniques) {
                        await this.createUniqueConstraint(name, prop);
                    }
                    for (let prop of propsMeta.indexes) {
                        await this.createIndex(name, prop);
                    }
                }
            }
            this._logger.info('End dbsetup');
        } catch (e) {
            this._logger.error('dbsetup error: ', e);
        }
    }
}