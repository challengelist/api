import { Request } from "express";
import { UserAccount } from "../structures/UserAccount";

export type ErrorObject = {
    status: number;
    error: number;
    data: Record<string, any>;
}

/**
 * Represents an API request with additional parameter.
 */
export interface ApiRequest extends Request {
    id?: number;
    account?: UserAccount;
    pagination?: {
        limit?: number;
        after?: number;
        before?: number;
        sort?: string;
        order?: "asc" | "desc";
        filters?: Record<string, string>;
    };
        
}