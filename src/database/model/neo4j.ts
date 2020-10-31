import { Prop } from '../decorators';
import { PropertiesKey, PropertiesMeta } from '../decorators';
import { v1 as neo4j } from 'neo4j-driver';
import { ExcludeProps, ExcludePropsOf, KeysOf } from 'database/services';
export declare type OnlyProps<T, TProps extends keyof T> = {
    [K in TProps]: T[K];
};
export declare type OptionalProps<T, TProps extends keyof T> = ExcludeProps<T, TProps> & Partial<OnlyProps<T, TProps>>;
type OptionalPropsOf<T> = OptionalProps<T, KeysOf<T>>;
type OptionalExcluded<T> = OptionalProps<ExcludePropsOf<T, Object>, KeysOf<ExcludePropsOf<T, Object>>>;

export abstract class GraphItemBase<T = any> extends Object {
    static readonly graphItemName: string;
    id: string;
    creationTime: number;

    constructor();
    constructor(id: string);
    constructor(properties: OptionalExcluded<T>);
    constructor(idOrObj?: string | OptionalExcluded<T>) {
        super();
        if (typeof idOrObj === 'string') {
            this.id = idOrObj;
        }/* else if (idOrObj && typeof idOrObj.properties === 'object') {
            for (let propName in idOrObj.properties) {
                let val = idOrObj.properties[propName];
                if (typeof (val) === 'object' && neo4j.integer.inSafeRange(val)) {
                    val = neo4j.integer.toNumber(val);
                }
                this[propName] = val;
            }
        } */else if (typeof idOrObj === 'object') {
            let propsMeta: PropertiesMeta = Reflect.getMetadata(PropertiesKey, this.constructor);
            if (!propsMeta) {
                throw new Error('Cannot resolve metadata for graph item: ' + this.constructor);
            }
            for (let propName in idOrObj) {
                this[propName] = idOrObj[propName];
            }
        }
    }
}

export abstract class Vertex<T extends Vertex<T> = any> extends GraphItemBase<T> {
    @Prop({
        indexed: true,
        unique: true,
        mandatory: true,
        readonly: true
    })
    id: string;

    @Prop({
        indexed: true,
        mandatory: true,
        readonly: true
    })
    creationTime: number;
}

export abstract class EdgeBase<TFrom extends Vertex, TTo extends Vertex> extends GraphItemBase {
    from: TFrom;
    to: TTo;

    constructor();
    constructor(record: any);
    constructor(from: TFrom, to: TTo);
    constructor(fromOrRecord?: any, to?: TTo) {
        if (fromOrRecord && typeof fromOrRecord.properties === 'object') {
            super(fromOrRecord);
        } else {
            super();
            this.from = fromOrRecord as TFrom;
            this.to = to;
        }
    }
}

export abstract class Edge<TFrom extends Vertex = Vertex, TTo extends Vertex = Vertex> extends GraphItemBase {
    from: TFrom;
    to: TTo;

    @Prop({
        indexed: false,
        unique: false,
        mandatory: true,
        readonly: true
    })
    id: string;

    @Prop({
        indexed: false,
        mandatory: true,
        readonly: true
    })
    creationTime: number;

    constructor();
    constructor(record: any);
    constructor(from: TFrom, to: TTo);
    constructor(fromOrRecord?: any, to?: TTo) {
        if (fromOrRecord && typeof fromOrRecord.properties === 'object') {
            super(fromOrRecord);
        } else {
            super();
            this.from = fromOrRecord as TFrom;
            this.to = to;
        }
    }
}

export interface CypherResult<T> {
    _id: number;
    labels: string[];
    properties: T;
}