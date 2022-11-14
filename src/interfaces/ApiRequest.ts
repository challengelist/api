import { Account, Badge, Group, Player } from "@prisma/client";
import { Request } from "express";

/**
 * Represents an API request with additional parameter.
 */
export interface ApiRequest extends Request {
    account?: Account & {
        badges: Badge[];
        groups: Group[];
        profile: Player | null;
    };
}