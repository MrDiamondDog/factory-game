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
    }
};

export type ObjectOptions = {
    name: string;
    description: string;
    inputs?: string[];
    outputs?: string[];
    draw?: (self: Object) => void;
    update?: () => void;
    init?: () => void;
    hidden?: boolean;
};

export type Object = {
    pos: Vec2;
    size: Vec2;
} & ObjectOptions;