import { CanvasObject, ObjectOptions, Vec2 } from "@type/canvas";
import { clone } from "@util/object";

export const objects: CanvasObject[] = [];
export const registeredObjects: ObjectOptions[] = [];

export const defineObject = <T extends ObjectOptions>(options: T) => {
    registeredObjects.push(options);
    if (options.init) options.init(options);

    return options;
};

export const createObject = <T extends CanvasObject>(name: string, pos: Vec2 = Vec2.zero): T => {
    const obj = clone(registeredObjects.find(obj => obj.name === name));

    if (!obj) throw new Error(`Object ${name} does not exist`);

    const object: T = {
        ...obj,
        pos,
        id: crypto.randomUUID()
    } as T;

    objects.push(object);

    if (object.createdInit) object.createdInit(object);

    return object;
};

export const deleteObject = (object: CanvasObject) => {
    const index = objects.indexOf(object);
    if (index === -1) throw new Error("Object does not exist");

    objects.splice(index, 1);
};
