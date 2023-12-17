import { Storage } from "@storage/global";

import { CanvasObject, ObjectOptions, Vec2 } from "./canvas";

export enum Material {
    Watts = "Watts",
    Iron = "Iron",
    IronGear = "Iron Gears",
    Any = "Any",
    Copper = "Copper",
    CopperWire = "Copper Wire",
    Circuit = "Circuit",
    Water = "Water"
}

export type FactoryDefinition = {
    name: string,
    description: string,
    type: string,
    inputs?: Material[],
    outputs?: Material[],
    specs: string[],
    recipe?: RecipeMaterial[],
    produces?: {
        material: Material,
        amount: number,
        ticks?: number,
        requires?: RecipeMaterial[],
        limit?: number
    }[]
};

export type MaterialIO = {
    material?: Material;
    any?: boolean;
    stored: number;
};

export type RecipeMaterial = {
    material: Material;
    amount: number;
};

export type NodeOptions = {
    description: string;
    inputs?: MaterialIO[];
    outputs?: MaterialIO[];
    hidden?: boolean;
    specs?: string[];
    type: string;
    recipe?: RecipeMaterial[];
} & ObjectOptions;

export type ConnectionData = {
    node: CanvasNode;
    type: "input" | "output";
    index: number;
}

export type Connection = {
    from: ConnectionData;
    to: ConnectionData;
};

export type CanvasNode = NodeOptions & CanvasObject & {
    size: Vec2;
    specs: string[];
    connections: Connection[];
    backConnections: Connection[];
};

export type ExportedConnection = {
    from: {
        id: string;
        type: "input" | "output";
        index: number;
    },
    to: {
        id: string;
        type: "input" | "output";
        index: number;
    }
}

export type ExportedFactory = {
    name: string;
    id: string;
    connections: ExportedConnection[];
    pos: Vec2;
}

export type ExportedData = {
    objects: ExportedFactory[];
    storage: Storage;
    DEBUG?: boolean;
};
