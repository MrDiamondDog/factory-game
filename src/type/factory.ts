import { Storage } from "@/economy/storage";

import { CanvasObject, ObjectOptions, Vec2 } from "./canvas";

export enum MaterialType {
    Any = "Any",
    Watts = "Watts",
    IronOre = "Iron Ore",
    CopperOre = "Copper Ore",
    CopperIngot = "Copper Ingot",
    Coal = "Coal",
    Sand = "Sand",
    SiliconIngot = "Silicon Ingot",
    SiliconSheet = "Silicon Sheet",
}

export const Materials: Record<keyof typeof MaterialType, number> = {
    Any: 0,
    Watts: 0,
    IronOre: 0,
    CopperOre: 10,
    CopperIngot: 25,
    Coal: 5,
    Sand: 2,
    SiliconSheet: 25,
    SiliconIngot: 50,
};

export type FactoryDefinition = {
    name: string,
    description: string,
    type: string,
    inputs?: MaterialType[],
    outputs?: MaterialType[],
    specs: string[],
    cost?: number,
    produces?: {
        materials: (RecipeMaterial & { limit: number })[],
        time?: {
            seconds?: number,
            ticks?: number
        },
        requires?: RecipeMaterial[],
    }[]
};

export type MaterialIO = {
    material?: MaterialType;
    any?: boolean;
    stored: number;
};

export type RecipeMaterial = {
    material: MaterialType;
    amount: number;
};

export type NodeOptions = {
    description: string;
    inputs?: MaterialIO[];
    outputs?: MaterialIO[];
    hidden?: boolean;
    specs?: string[];
    type: string;
    cost?: number;
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
    inputs?: MaterialIO[];
    outputs?: MaterialIO[];
    pos: Vec2;
}

export type ExportedData = {
    objects: ExportedFactory[];
    storage: Storage;
    DEBUG?: boolean;
    TRANS?: boolean;
};
