import { Storage } from "@economy/storage";

import { CanvasObject,
    ObjectOptions,
    Vec2 } from "./canvas";

export const FakeMaterials = ["Any",
    "Watts"];

export const MaterialPrices: Record<string, number> = {
    "Iron Ore": 25,
    "Iron Ingot": 50,
    "Copper Ore": 20,
    "Copper Ingot": 30,
    "Copper Wire": 10,
    "Coal": 15,
    "Sand": 10,
    "Silicon Ingot": 100,
    "Silicon Sheet": 50,
    "Silicon Wafer": 50,
    "Zinc Ore": 75,
    "Zinc Ingot": 100,
    "Gold Ore": 75,
    "Refined Gold": 200,
    "Molten Steel": 100,
    "Steel Ingot": 350,
    "Raw Carbon": 25,
    "Refined Carbon": 150,
    "Battery": 200,
    "Basic Circuit": 250,
    "Electric Motor": 400,
    "Advanced Circuit": 750,
    "Robotic Component": 1000,
    "Uranium Ore": 100,
    "Thorium Ore": 75,
    "Thorium Ingot": 500,
    "Uranium Ingot": 750,
    "Uranium-235": 1200,
    "Uranium-235 Fuel Rod": 1500,
    "Quantum Energy Core": 2000,
    "Raw Earth Core Sample": 300,
    "Refined Earth Mineral Deposit": 500,
    "Rare Earth Mineral": 1000,
    "Unstable Elemental Essence": 1000,
    "Stable Elemental Matrix": 1200,
    "Exotic Element": 1750,
    "Hyper-Advanced Nanomaterial": 2000
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
    version: string;
    objects: ExportedFactory[];
    storage: Storage;
    money: number;
    factoryPrices: Record<string, number>;
    DEBUG?: boolean;
    TRANS?: boolean;
};
