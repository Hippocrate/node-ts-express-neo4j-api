import { Vertex, Edge } from "../model";
import { Neo4jConnection, serializeGraphProperty, buildSetQuery } from "./Neo4jConnection";
import { GraphClassMeta, PropertiesMeta } from "../decorators";
import { ResultSummary, Integer } from "neo4j-driver/types/v1";
export declare type KeysOf<T> = keyof T;
export declare type ExcludeProps<T, TProps extends keyof T> = {
    [K in Exclude<keyof T, TProps>]: T[K];
};
export declare type ExcludePropsOf<TFrom extends TProps, TProps> = ExcludeProps<TFrom, KeysOf<TProps>>;

export type EdgeToBuilder<TTo extends Vertex> = {
    /**
     * Specify the vertex to link to
     */
    to(): CommandBuilder<TTo>;
}

export type EdgeBuilder<TFrom extends Vertex> = {
    /**
     * Creates an edge between two vertices
     * @param edge The correct edge to use
     */
    edge<TTo extends Vertex>(edge: Edge<TFrom, TTo>): EdgeToBuilder<TTo>;
}

export type UpdatableCommand = {
    /**
     * Update a vertex properties
     * @param vertex The vertex to update
     * @param merge Set to true when you want to merge the given properties with the values stored in the database
     */
    update<TVertex extends Vertex>(vertex: TVertex, merge?: boolean, keys?:string[]): ChainableCommand & SaveableCommand;
}

export type ArrayOfProps<T> = Array<KeysOf<ExcludePropsOf<T, Object>>>;
export type CommandBuilder<TVertex extends Vertex> = {
    /**
     * Creates a new vertex
     * @param vertex The vertex to create
     */
    create<TTVertex extends TVertex>(vertex: TTVertex): EdgeBuilder<TTVertex> & SaveableCommand & ChainableCommand;
    /**
     * Select an existing vertex
     * @param vertex The vertex to select
     * @param matchOnProperties The key used to match the vertex default is ["id"]
     */
    match<TTVertex extends TVertex>(vertex: TTVertex, matchOnProperties?: ArrayOfProps<TTVertex>): EdgeBuilder<TTVertex> & SaveableCommand & ChainableCommand;
    /**
     * Append a custom cypher query
     * @param query The custom query string
     * @param params The variable values
     */
    execute(query: string, params?: any): CommandBuilder<TVertex> & SaveableCommand;
} & UpdatableCommand;



export type SaveableCommand = {
    /**
     * 
     * @param cnx The neo4j connection used for making the query 
     */
    save(cnx: Neo4jConnection): Promise<ResultSummary<Integer>>;
}

export type ChainableCommand = {
    /**
     * This method act as a separator between operations
     */
    with(): CommandBuilder<any>;
}

export type VertexCreation<T extends Vertex = Vertex> = {
    commandType: CommandType,
    vertex: T
}

export function chainableBuilder(graph: CreationGraph): ChainableCommand {
    return {
        with() {
            return commandBuilder(graph);
        }
    }
}


class VirtualVertex extends Vertex {
    constructor(public query: string, public params?: any) {
        super();
    }
}


export function commandBuilder<TFom extends Vertex, TTo extends Vertex>(graph: CreationGraph = new CreationGraph(), fromEdge?: Edge<TFom, TTo>): CommandBuilder<TTo> & UpdatableCommand {
    const builder = {
        create<TVertex extends TTo>(vertex: TVertex) {
            if (fromEdge) {
                fromEdge.to = vertex;
            }
            graph.addVertex(vertex, "create");
            return {
                ...edgeBuilder<TVertex>(graph, { commandType: "create", vertex }),
                ...pendingCommandBuilder(graph),
                ...chainableBuilder(graph)
            };
        },
        match<TVertex extends TTo>(vertex: TVertex, params: ArrayOfProps<TVertex> = [<any>"id"]) {
            if (fromEdge) {
                fromEdge.to = vertex;
            }
            if (!graph.has(vertex)) {
                graph.addVertex(vertex, "match", params as string[]);
            }
            return {
                ...edgeBuilder<TVertex>(graph, { commandType: "match", vertex }),
                ...pendingCommandBuilder(graph),
                ...chainableBuilder(graph)
            }
        },
        execute(query: string, params: any) {
            const vertex = new VirtualVertex(query, params);
            graph.addVertex(vertex, "execute");
            return {
                ...builder,
                ...pendingCommandBuilder(graph)
            }
        },
        ...updateCommandBuilder(graph)
    };

    return builder;
}

function updateCommandBuilder(graph: CreationGraph): UpdatableCommand {
    return {
        update<TVertex extends Vertex>(vertex: TVertex, merge = false, keys:string[]=[<any>"id"]) {
            graph.addVertex(vertex, merge ? "merge" : "update", keys);
            return {
                ...saveableCommand(graph),
                ...chainableBuilder(graph)
            }
        }
    }
}

function pendingCommandBuilder(graph: CreationGraph): SaveableCommand {
    return {
        ...commandBuilder(graph),
        ...saveableCommand(graph)
    }
}

function saveableCommand(graph: CreationGraph): SaveableCommand {
    return {
        async save(cnx: Neo4jConnection): Promise<ResultSummary> {
            let i = 0;
            const createAdExecuteBuilder: string[] = [];
            const matchBuilder: string[] = [];
            const updateBuilder: string[] = [];

            const params = {};
            const vertexIdMap = new Map<Vertex, number>();
            function fillParams(source: any, varPrefix = "") {
                Object.keys(source).forEach(prop => {
                    const key = `${varPrefix ? `${varPrefix}_` : ""}${prop}`;
                    if (params[key] !== undefined) {
                        if (!varPrefix) {
                            throw new Error(`Error while saving command : The parameter ${prop} is already used by another command instruction`);
                        } else {
                            return;
                        }
                    }
                    params[key] = source[prop];
                });
            }
            // add creation and match definition
            graph.graph.forEach((def, vertex) => {
                vertexIdMap.set(vertex, i);
                const varPrefix = `var${i}`;
                let classMeta: GraphClassMeta;
                let propsMeta: PropertiesMeta;

                if (def.commandType !== "execute") {
                    const metadata = cnx.readMetadata(vertex);
                    classMeta = metadata.classMeta;
                    propsMeta = metadata.propsMeta;
                }
                
                const matchProps = def.keys.reduce((prev, key) => {
                    prev[key] = vertex[key];
                    return prev;
                }, {});

                switch (def.commandType) {
                    case "create":
                        const d = cnx.definition(vertex, false, varPrefix);
                        createAdExecuteBuilder.push(`create (v${i}${d.definition})`);
                        fillParams(vertex, varPrefix);
                        break;

                    case "match":
                        matchBuilder.push(`match (v${i}:${classMeta.name} ${serializeGraphProperty(matchProps, true)})`);
                        break;

                    case "update":
                        updateBuilder.push(`match (v${i}:${classMeta.name} ${serializeGraphProperty(matchProps, true)}) set ${buildSetQuery(vertex, classMeta, propsMeta, varPrefix, false, i)}`);
                        fillParams(vertex, varPrefix);
                        break;

                    case "merge":
                        const setQuery = buildSetQuery(vertex, classMeta, propsMeta, varPrefix, true, i);
                        if (setQuery) {
                            updateBuilder.push(`match (v${i}:${classMeta.name} ${serializeGraphProperty(matchProps, true)}) set ${setQuery}`);
                            fillParams(vertex, varPrefix);
                        }
                        break;

                    case "execute":
                        const virtualVertex = vertex as VirtualVertex;
                        createAdExecuteBuilder.push(virtualVertex.query);
                        if (virtualVertex.params) {
                            fillParams(virtualVertex.params);
                        }
                        break;
                    default:
                        throw new Error(`Unknown build command type ${def.commandType}`);
                }
                i++;
            });
            i = 0;
            graph.graph.forEach((def, vertex) => {
                def.edges.forEach(e => {
                    const fromVertexId = vertexIdMap.get(vertex);
                    const toVertexId = vertexIdMap.get(e.to);
                    const varPrefix = `var${fromVertexId}_${i}`;
                    const d = cnx.definition(e, false, varPrefix);
                    createAdExecuteBuilder.push(`create (v${fromVertexId})-[${d.definition}]->(v${toVertexId})`);
                    fillParams(d.properties, varPrefix);
                });
                i++;
            });
            const query = `
                ${matchBuilder.join(' ')}
                ${createAdExecuteBuilder.join(' ')}
                ${updateBuilder.join(' WITH * ')}
                `.trim();
            if (query) {
                return cnx.first(query, params).then(r => r.summary);
            }
            throw new Error('Can not save an empty query');
        }
    }
}

function edgeBuilder<TFrom extends Vertex>(graph: CreationGraph, from: VertexCreation<TFrom>): EdgeBuilder<TFrom> {
    return {
        edge<TTo extends Vertex>(edge: Edge<TFrom, TTo>): EdgeToBuilder<TTo> {
            edge.from = from.vertex;
            graph.addEdge(edge, from.commandType);
            return edgeToBuilder(graph, edge);
        }
    }
}

function edgeToBuilder<TFrom extends Vertex, TTo extends Vertex>(graph: CreationGraph, edge: Edge<TFrom, TTo>): EdgeToBuilder<TTo> {
    return {
        to() {
            return commandBuilder<TFrom, TTo>(graph, edge);
        }
    }
}
type CommandType = "create" | "match" | "update" | "merge" | "execute";
class CreationGraph {
    graph: Map<Vertex, { keys: string[], commandType: CommandType, edges: Edge[] }> = new Map();

    addVertex(vertex: Vertex, commandType: CommandType, keys = ['id']) {
        if (this.graph.has(vertex)) {
            throw new Error("Can not add vertex: already added");
        }
        this.graph.set(vertex, {
            commandType,
            keys,
            edges: []
        });
    }

    addEdge(edge: Edge, commandType: CommandType = "match") {
        if (!edge.from) {
            throw new Error("Can not add edge: from must be set");
        }
        if (!this.graph.has(edge.from)) {
            this.addVertex(edge.from, commandType);
        }
        this.graph.get(edge.from).edges.push(edge);
    }
    has(vertex: Vertex) {
        return this.graph.has(vertex);
    }
}
