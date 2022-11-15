import { Account, Badge, Group, Player } from "@prisma/client";
import { Request } from "express";
import { UserAccount } from "../structures/UserAccount";

/**
 * Represents an API request with additional parameter.
 */
export interface ApiRequest extends Request {
    account?: UserAccount;
}