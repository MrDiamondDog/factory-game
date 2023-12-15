export type Vec2 = {
    x: number;
    y: number;
};

export const Vec2 = {
    add(a: Vec2, b: Vec2) {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        };
    },
    sub(a: Vec2, b: Vec2) {
        return {
            x: a.x - b.x,
            y: a.y - b.y
        };
    },
    mul(a: Vec2, b: Vec2) {
        return {
            x: a.x * b.x,
            y: a.y * b.y
        };
    },
    div(a: Vec2, b: Vec2) {
        return {
            x: a.x / b.x,
            y: a.y / b.y
        };
    },
    scale(a: Vec2, b: number) {
        return {
            x: a.x * b,
            y: a.y * b
        };
    },
    dot(a: Vec2, b: Vec2) {
        return a.x * b.x + a.y * b.y;
    },
    mag(a: Vec2) {
        return Math.sqrt(a.x ** 2 + a.y ** 2);
    },
    norm(a: Vec2) {
        return Vec2.scale(a, 1 / Vec2.mag(a));
    },
    dist(a: Vec2, b: Vec2) {
        return Vec2.mag(Vec2.sub(a, b));
    },
    neg(a: Vec2) {
        return Vec2.scale(a, -1);
    },
    zero: {
        x: 0,
        y: 0,
    } as Vec2
};

export type Material = "Any" | "Iron" | "Watts" | "Iron Gears";

export type MaterialIO = {
    material?: Material;
    stored: number;
};

export type NodeOptions = {
    description: string;
    inputs?: MaterialIO[];
    outputs?: MaterialIO[];
    hidden?: boolean;
    specs?: string[];
} & ObjectOptions;

export type ConnectionData = {
    node: Node;
    type: "input" | "output";
    index: number;
}

export type Node = NodeOptions & Object & {
    size: Vec2;
    specs: string[];
    connections: {
        from: ConnectionData;
        to: ConnectionData;
    }[]
};

export type ObjectOptions = {
    name: string;
    draw?: (self: Object) => void;
    tick?: (self: Object) => void;
    init?: (self: ObjectOptions) => void;
    createdInit?: (self: Object) => void;
    vars?: Record<string, any>;
};

export type Object = {
    pos: Vec2;
    id: string;
} & ObjectOptions;
