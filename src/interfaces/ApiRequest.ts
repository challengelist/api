import { Account, Badge, Group, Player } from "@prisma/client";
import { Request } from "express";
import { UserAccount } from "../structures/UserAccount";

/**
 * Represents an API request with additional parameter.
 */
export interface ApiRequest extends Request {
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