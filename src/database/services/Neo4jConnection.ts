import 'reflect-metadata';
const uuid = require('uuid');
import { injectable } from 'inversify';
import { Vertex, Edge, GraphItemBase } from '../model';
import { GraphItemKey, PropertiesKey, PropertiesMeta, GraphClassMeta, PropertyMetadata } from '../decorators';
import { v1 as neo4j } from 'neo4j-driver';

export interface GraphItemDefinition {
    definition: string;
    properties: any;
}
export interface QueryResult extends neo4j.StatementResult {

}

export interface FirstResult {
    record: neo4j.Record;
    summary: neo4j.ResultSummary;
}

@injectable()
export class Neo4jConnection {
    protected _driver: neo4j.Driver;

    constructor(driver: neo4j.Driver);
    constructor(uri: string, user: string, password: string);
    constructor(uriOrDriver: string | neo4j.Driver, user?: string, password?: string) {
        if (typeof uriOrDriver === 'string') {
            this._driver = neo4j.driver(uriOrDriver as string, neo4j.auth.basic(user as string, password));
        } else {
            this._driver = uriOrDriver;
        }
    }

    definition<TItem extends GraphItemBase>(graphItem: TItem, withValues = false, variablePrefix = ""): GraphItemDefinition {
        const { classMeta, propsMeta } = this.readMetadata(graphItem);
        graphItem.id = graphItem.id || uuid.v4().toString();
        graphItem.creationTime = graphItem.creationTime || new Date().getTime();

        const properties = this.getItemProperties(graphItem, classMeta, propsMeta);
        const definition = `${this.getLabels(classMeta)} ${serializeGraphProperty(properties, withValues, variablePrefix)}`;
        return {
            definition,
            properties
        };
    }

    getLabels(metadata: GraphClassMeta, definition = []) {
        definition.push(':' + metadata.name);
        if (metadata.parent) {
            return this.getLabels(metadata.parent, definition);
        }

        return definition.join('');
    }

    query(query: string, params?: any): Promise<neo4j.StatementResult> {
        const session = this._driver.session();
        return session
            .run(query, params)
            .then((result: any) => {
                session.close();
                return result;
            })
            .catch(e => {
                session.close();
                throw e;
            });
    }


    first(query: string, params?: any) {
        return this.query(query, params).then(result => {
            return {
                record: result.records[0],
                summary: result.summary
            };
        });
    }

    dispose() {
        if (this._driver) {
            this._driver.close();
        }
    }

    readMetadata(graphItem: any) {
        const classMeta: GraphClassMeta = Reflect.getMetadata(GraphItemKey, graphItem.constructor);
        const propsMeta: PropertiesMeta = Reflect.getMetadata(PropertiesKey, graphItem.constructor);
        if (!classMeta || !propsMeta) {
            throw new Error('GraphItem error: Missing graph item metadata. Ensure your item extends the Vertex class or the Edge class and has the GraphItem decorator');
        }

        return { classMeta, propsMeta };
    }
    getDriver() {
        return this._driver;
    }
    private getItemProperties(graphItem: any, classMeta: GraphClassMeta, propertiesMeta: PropertiesMeta, variablePrefix = "") {
        const graphItemProperties = {};
        for (let key in propertiesMeta.properties) {
            let pMeta = propertiesMeta.properties[key];

            ensurePropertyValidity(graphItem, classMeta, pMeta, key);
            const propName = variablePrefix ? `${variablePrefix}_${key}` : key;
            if (typeof graphItem[key] === 'string') {
                graphItemProperties[propName] = graphItem[key].trim();
            }
            else if (graphItem[key] !== undefined) {
                graphItemProperties[propName] = graphItem[key];
            }
        }

        return graphItemProperties;
    }
}
function ensurePropertyValidity(graphItem: any, classMeta: GraphClassMeta, propertyMeta: PropertyMetadata, propertyName: string) {
    const value = graphItem[propertyName];
    if (propertyMeta.mandatory && (value === undefined || value === null)) {
        throw new Error(`Property ${propertyName} of vertice ${classMeta.name} is required`);
    }
    if (value !== undefined && value !== null) {
        let typeValid =
            propertyMeta.type === String && typeof value === 'string'
            ||
            propertyMeta.type === Number && typeof value === 'number'
            ||
            propertyMeta.type === Boolean && typeof value === 'boolean'
            ||
            value instanceof propertyMeta.type;
        if (!typeValid) {
            throw new Error(`Property ${propertyName} of vertice ${classMeta.name} must be a ${propertyMeta.type.name}. Given : ${typeof value}`);
        }
    }
}

export function buildSetQuery(graphItem: GraphItemBase, classMeta: GraphClassMeta, propertiesMeta: PropertiesMeta, variablePrefix = "", merge = false, i?:number) {
    let builder: string[] = [];
    for (let propName in propertiesMeta.properties) {
        if (merge && graphItem[propName] === undefined) {
            continue;
        } else if (graphItem[propName] === undefined) {
            graphItem[propName] = null;
        }
        const propertyMeta = propertiesMeta.properties[propName];

        if (!propertyMeta.readonly && graphItem[propName] !== undefined) {
            ensurePropertyValidity(graphItem, classMeta, propertyMeta, propName);

            builder.push(`v${i}.${propName} = {${variablePrefix}_${propName}}`);
            builder.push(', ');
        }
    }

    builder.pop();
    return builder.join('');
}

export function serializeGraphProperty(obj: any, serializeValues = false, variablePrefix = ""): string {
    let builder = ['{'];
    for (let key in obj) {
        if (obj[key] !== undefined && typeof obj[key] !== 'object' && typeof obj[key] !== 'function') {
            if (serializeValues) {
                let value;
                if (typeof obj[key] === 'string') {
                    // tslint:disable-next-line:quotemark
                    value = `'${obj[key].replace(/'/gi, "\\'")}'`;
                } else {
                    value = obj[key];
                }
                builder.push(`${key}: ${value}`);
            } else {
                builder.push(`${key}: {${variablePrefix ? `${variablePrefix}_` : ''}${key}}`);
            }
            builder.push(',');
        }
    }

    builder.pop(); // the last ,
    builder.push('}');
    return builder.join('');
}

export function parseResult(result: neo4j.StatementResult) {
    return result.records.map(rec => {

    });
}
