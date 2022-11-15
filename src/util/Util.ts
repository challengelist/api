/**
 * A class full of utilities to use in the API.
 */
export class Util {
    constructor() {
        throw new Error("This class may not be instantiated!");
    }

    static assertObject(obj: any, keys: string[]) {
        if (typeof obj !== "object") {
            return false;
        }

        for (const key of keys) {
            if (!obj.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    }
}