import { Vertice, Edge, GraphItemBase } from "../../database/dbtypes";

export interface IGraphDb {
    createVertice<T extends Vertice>( vertice: T ): Promise<T>;
    createEdge<TFrom extends Vertice, TTo extends Vertice>( edge: Edge<TFrom, TTo>): Promise<Edge<TFrom, TTo>>;
    query<T>( query: string, params?: any): Promise<T[]> ;
    first<T>( query: string, params?: any ): Promise<T>;
    transaction<T>( scope: (db: IGraphDb, commit: (result: T) => void, rollback: (reason?: any) => void) => void ): Promise<T>;
    updateVertice<T extends Vertice>( vertice: T ): Promise<T>;
    deleteEdge<TFrom extends Vertice, TTo extends Vertice>( edge: Edge<TFrom, TTo> ): Promise<Edge<TFrom, TTo>>;
}