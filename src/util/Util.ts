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

    static assertObjectTypes(obj: any, types: Record<string, string>) {
        for (const [key, type] of Object.entries(types)) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            if (typeof obj[key] !== type) {
                return false;
            }
        }

        return true;
    }

    static generateWhereClause(filters: Record<string, string>, acceptedKeys: string[] = []) {
        const where: Record<string, string | number> = {};

        for (const [key, value] of Object.entries(filters)) {
            if (acceptedKeys.length > 0 && !acceptedKeys.includes(key)) {
                continue;
            }

            let num = parseInt(value);

            if (!isNaN(num)) {
                where[key] = num;
            } else {
                where[key] = value;
            }
        }

        return where;
    }

    static generateLinkHeader(url: string, limit: number, after: number, before: number, total: number) {
        const links: string[] = [];

        if (after > 0) {
            links.push(`<${url}?limit=${limit}&after=${after - limit}>; rel="prev"`);
        }

        if (before < total) {
            links.push(`<${url}?limit=${limit}&after=${after + limit}>; rel="next"`);
        }

        return links.join(", ");
    }
}