import { NextFunction } from "express";
import { ApiRequest } from "../interfaces/ApiRequest";
import { ApiResponse } from "../interfaces/ApiResponse";

export class PaginationMiddleware {
    static handle(req: ApiRequest, res: ApiResponse, next: NextFunction) {

        // Set the base limit.
        req.pagination = {
            limit: 50,
            after: undefined,
            before: undefined,
            sort: undefined,
            order: undefined,
            filters: {}
        };

        if (req.query.limit) {
            // Parse the limit parameter
            const limit = parseInt(req.query.limit as string);

            if (limit < 1) {
                return res.status(400).json({
                    code: 400,
                    message: "Pagination limit must be greater than or equal to 1."
                });
            }
    
            if (limit > 100) {
                return res.status(400).json({
                    code: 400,
                    message: "Pagination limit must be less than or equal to 100."
                });
            }
    
            // Set the limit parameter.
            req.pagination.limit = limit;
        }

        if (req.query.after) {
            // Parse the after parameter.
            const after = parseInt(req.query.after as string);
    
            if (!isNaN(after)) {
                req.pagination.after = after;
            }
        }

        if (req.query.before) {
            // Parse the before parameter.
            const before = parseInt(req.query.before as string);
    
            if (!isNaN(before)) {
                req.pagination.before = before;
            }
        }

        if (req.query.sort) {
            // Parse the sort parameter.
            const sort = req.query.sort as string;

            req.pagination.sort = sort;
        }

        if (req.query.order) {
            // Parse the order parameter.
            const order = req.query.order as string;

            if (order !== "asc" && order !== "desc") {
                return res.status(400).json({
                    code: 400,
                    message: "Invalid order parameter."
                });
            }

            req.pagination.order = order;
        }

        // Parse filters.
        const filters = req.query.filter as Record<string, string>;

        if (filters) {
            req.pagination.filters = filters;
        }

        next();
    }
}