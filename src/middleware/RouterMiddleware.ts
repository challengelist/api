import { Application, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { ErrorObject, ApiRequest } from "../interfaces/ApiRequest";
import { ApiResponse } from "../interfaces/ApiResponse";

const BASE_PATH = path.join(__dirname, "../", "../", "routes");

export class RouterMiddleware {
    static async _readRoutes(app: Application, routesPath: string) {
        fs.readdirSync(routesPath).forEach(async(file) => {
            // Assert whether the file is a .js file, or a directory.
            if (fs.lstatSync(path.join(routesPath, file)).isDirectory()) {
                // Reiterate through the directory.
                this._readRoutes(app, path.join(routesPath, file));
            } else {
                // Assert whether the file is a .ts file.
                if (file.slice(-3) === ".ts") {
                    // Import the route file.
                    const route = await import(path.join(routesPath, file));

                    // Create a route path.
                    const routePath = path.join(routesPath, file).replace(BASE_PATH, "").replace(".ts", "").replace(/\\/g, "/");

                    // Get all the keys of the route object.
                    const keys = Object.keys(route);
                    for (const key of keys) {
                        // Import the router.
                        const router = route[key];
                        if (router.stack) {
                            // Lowest-level error handler.
                            router.use((error: ErrorObject, req: ApiRequest, res: ApiResponse, _: NextFunction) => {
                                if (error) {
                                    return res.status(error.status).json(error);
                                }
                            });

                            app.use(routePath, router);
                        }
                    }
                }
            }
        });
    }

    static handle(app: Application) {
        // Read all the files in the routes directory.
        const routesPath = path.join(BASE_PATH);
        this._readRoutes(app, routesPath);
    }
}