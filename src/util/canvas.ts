import { ctx } from "@/constants";
import { Vec2 } from "@type/canvas";

export function drawCircle(pos: Vec2, radius: number) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

export function measureText(text: string): Vec2 {
    const measure = ctx.measureText(text);
    return {
        x: measure.width,
        y: measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent
    };
}

export function colliding(pos: Vec2, size: Vec2, pos2: Vec2, size2: Vec2) {
    return pos.x < pos2.x + size2.x && pos.x + size.x > pos2.x && pos.y < pos2.y + size2.y && pos.y + size.y > pos2.y;
}

export function inside(pos: Vec2, size: Vec2, pos2: Vec2) {
    return pos.x < pos2.x && pos.x + size.x > pos2.x && pos.y < pos2.y && pos.y + size.y > pos2.y;
}

export function line(from: Vec2, to: Vec2) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}