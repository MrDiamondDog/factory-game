import { Storage } from "@economy/storage";

import { CanvasObject, ObjectOptions, Vec2 } from "./canvas";

export const FakeMaterials = ["Any", "Watts"];

export const MaterialPrices: Record<string, number> = {
    "Iron Ore": 10,
    "Iron Ingot": 25,
    "Copper Ore": 10,
    "Copper Ingot": 25,
    "Copper Wire": 2,
    "Coal": 10,
    "Sand": 5,
    "Silicon Ingot": 50,
    "Silicon Sheet": 25,
    "Silicon Wafer": 25,
    "Zinc Ore": 25,
    "Zinc Ingot": 50,
    "Gold Ore": 100,
    "Refined Gold": 150,
    "Molten Steel": 50,
    "Steel Ingot": 150,
    "Raw Carbon": 25,
    "Refined Carbon": 50,
    "Battery": 75,
    "Basic Circuit": 125,
    "Electric Motor": 175,
    "Advanced Circuit": 250,
};

export type FactoryDefinition = {
    name: string,
    description: string,
    type: string,
    inputs?: string[],
    outputs?: string[],
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
    material?: string;
    any?: boolean;
    stored: number;
};

export type RecipeMaterial = {
    material: string;
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
    money: number;
    DEBUG?: boolean;
    TRANS?: boolean;
};
