import { money, setMoney } from "@economy/money";
import { ContextMenuOption, Vec2 } from "@type/canvas";
import { CanvasNode, Connection } from "@type/factory";
import { Log } from "@util/logger";

import { Mouse } from "./input";
import { deleteObject } from "./object";

export const ctxMenu: ContextMenuOption[] = [
    {
        name: "Sell Node",
        action() {
            const hovering = Mouse.hovering as CanvasNode;
            hovering.backConnections.forEach(connection => {
                connection.from.node.connections.splice(connection.from.index, 1);
            });
            hovering.connections.forEach(connection => {
                if (connection.to.node.inputs[connection.to.index].any) {
                    connection.to.node.inputs[connection.to.index].material = "Any";
                    connection.to.node.inputs[connection.to.index].stored = 0;
                }
            });
            setMoney(money + Math.round(hovering.cost / 2));
            deleteObject(hovering);
            Mouse.hovering = undefined;
        },
        condition() {
            return Mouse.hovering !== undefined && (Mouse.hovering as CanvasNode).connections !== undefined;
        }
    },
    {
        name: "Delete Connection",
        action() {
            const connection = Mouse.hovering as Connection;

            Log("deleting connection", connection.to.node.backConnections.length);
            if (
                connection.to.node.inputs[connection.to.index].any &&
                connection.to.node.backConnections.filter(bConn => bConn.to.index === connection.to.index).length === 1
            ) {
                connection.to.node.inputs[connection.to.index].material = "Any";
                connection.to.node.inputs[connection.to.index].stored = 0;
            }

            connection.from.node.connections.splice(connection.from.index, 1);
            connection.to.node.backConnections =
                connection.to.node.backConnections.filter(bConn => bConn.to.index !== connection.to.index);

            Mouse.hovering = undefined;
        },
        condition() {
            return Mouse.hovering !== undefined && (Mouse.hovering as Connection).to !== undefined;
        }
    }
];

export let ctxMenuOpen = false;

export function openCtxMenu(pos: Vec2) {
    if (ctxMenuOpen) return;

    const menu = document.createElement("div");
    menu.classList.add("ctx-menu");
    menu.style.left = `${pos.x}px`;
    menu.style.top = `${pos.y}px`;

    let passed = 0;
    for (const option of ctxMenu) {
        if (!option.condition?.()) continue;

        const button = document.createElement("button");
        button.innerText = option.name;
        button.onclick = option.action;
        menu.appendChild(button);
        passed++;
    }
    if (passed === 0) return;

    document.body.appendChild(menu);

    function close() {
        document.body.removeChild(menu);
        document.removeEventListener("click", close);
        document.removeEventListener("contextmenu", move);
        ctxMenuOpen = false;
    }

    function move(e: MouseEvent) {
        close();
        openCtxMenu({
            x: e.clientX,
            y: e.clientY
        });
    }

    document.addEventListener("click", close);
    document.addEventListener("contextmenu", move);

    ctxMenuOpen = true;
}
