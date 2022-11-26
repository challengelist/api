import fetch from "node-fetch";

export const YOUTUBE_REGEX = /https?:\/\/((www|m)\.?)?youtu(\.be|be\.com)\/(watch\?v=|w\/)?(\w{11})$/g;

type WhereOptions = {
    special: string[];
    handle: (filter: string, value: string) => string | number | object | undefined;
}

/**
 * A class full of utilities to use in the API.
 */
export class Util {
    constructor() {
        throw new Error("This class may not be instantiated!");
    }

    // EXCLUSIONS
    static exclude<T, K extends keyof T>(obj: T | T[], keys: K[]): Omit<T, K> | Omit<T, K>[] { // meow
        if (Array.isArray(obj)) {
            return obj.map((val) => {
                return Util.exclude(val, keys) as T;
            });
        } else {
            for (const key of keys) {
                delete obj[key];
            }
        }

        return obj;
    }

    // ASSERTIONS
    static resolveVideoType(video: string) {
        let validVideo = false;
        let type = "unknown";

        if (video.match(YOUTUBE_REGEX)) {
            validVideo = true;
            type = "youtube";
        }

        if (!validVideo) {
            return null;
        }

        return type;
    }
    
    static assertAcceptableVideoLink(video: string) {
        return new Promise((resolve) => {
            const type = Util.resolveVideoType(video);

            if (type === "youtube") {
                const id = (video.match(YOUTUBE_REGEX) ?? [])[6] ?? "";
                const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
                fetch(url).then((res) => {
                    if (res.status === 200) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch(() => {
                    resolve(false);
                });
            } else {
                resolve(false);
            }
        });
    }

    static normalizeVideoLink(video: string) {
        const type = Util.resolveVideoType(video);

        if (type === "youtube") {
            const id = (video.match(YOUTUBE_REGEX) ?? [])[6] ?? "";

            return `https://www.youtube.com/watch?v=${id}`;
        } else {
            return null;
        }
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

    static assertObjectTypes(obj: any, types: object) {
        for (const [key, type] of Object.entries(types)) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            if (typeof type === "string" && type.endsWith("[]")) {
                // Handle arrays.
                if (!Array.isArray(obj[key])) {
                    console.log("not array");
                    return false;
                }

                const trueType = type.slice(0, -2);

                if (trueType === "any") {
                    continue;
                }

                for (const item of obj[key]) {
                    if (typeof item !== trueType) {
                        return false;
                    }
                }
            } else if (typeof type === "object") {
                // Handle objects.
                if (typeof obj[key] !== "object") {
                    return false;
                }

                if (!this.assertObjectTypes(obj[key], type)) {
                    return false;
                }
            } else {
                // Handle normal types.
                if (typeof obj[key] !== type) {
                    return false;
                }
            }

        }

        return true;
    }

    // GENERATORS
    static generateWhereClause(filters: Record<string, string>, acceptedKeys: string[] = [], options?: WhereOptions) {
        const where: Record<string, string | number | object> = {};

        for (const [key, value] of Object.entries(filters)) {
            if (acceptedKeys.length > 0 && !acceptedKeys.includes(key)) {
                continue;
            }

            if (options?.special.includes(key)) {
                where[key] = options.handle(key, value) ?? value;

                continue;
            }

            const num = parseInt(value);

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