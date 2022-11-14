import { Request } from "express";
import { Account, Badge, Group, Player } from "@prisma/client";

/**
 * Represents an API request with additional parameter.
 */
export interface ApiRequest extends Request {
    account?: Account & {
        badges: Badge[];
        groups: Group[];
        profile: Player | null;
    };
};