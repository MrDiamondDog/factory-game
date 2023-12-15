import { Object, ObjectOptions, Vec2 } from "@type/canvas";
import { clone } from "@util/object";

export const objects: Object[] = [];
export const registeredObjects: ObjectOptions[] = [];

export const defineObject = <T extends ObjectOptions>(options: T) => {
    registeredObjects.push(options);
    if (options.init) options.init(options);

    return options;
};

export const createObject = <T extends Object>(name: string, pos: Vec2 = Vec2.zero): T => {
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
