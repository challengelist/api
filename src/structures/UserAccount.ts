import { Account, Badge, Group, Player } from "@prisma/client";
import jsonwebtoken from "jsonwebtoken";
import { GlobalSingleton } from "../util/GlobalSingleton";
import { Permissions } from "../util/Permissions";
import { TokenType } from "./enums/TokenType";

export type DeeperAccount = Account & {
    badges: Badge[];
    groups: Group[];
    profile: Player | null;
}

/**
 * A representation of a user's account.
 */
export class UserAccount {
    data: DeeperAccount;

    constructor(account: DeeperAccount) {
        this.data = account;
    }

    /**
     * Asserts that the account has the specified permission.
     * @param permission The permissions to check for.
     */
    has(permission: number) {
        // Handle permissions.
        const adminGroup = this.data.groups.find(group => group.permissions_grant & Permissions.ADMINISTRATOR);

        if (adminGroup) {
            // Grant all permissions
            console.log("is admin");
            return true;
        } else {
            return (this.data.groups
                .reduce((a, b) => a | b.permissions_grant, 0)
                & this.data.groups.reduce((a, b) => a & ~b.permissions_revoke, 0)) === permission;
        }
    }

    /**
     * Generates an API key based off data from the account.
     */
    generateApiToken() {
        let token;
        if (process.env.CL_USE_RSA256_JWT === "true") {
            token = jsonwebtoken.sign({
                id: this.data.id,
                username: this.data.username,
                token_type: TokenType.API,
            }, GlobalSingleton.rsaKey ?? "", {
                algorithm: "RS256",
                expiresIn: "7d"
            });
        } else {
            token = jsonwebtoken.sign({
                id: this.data.id,
                username: this.data.username,
                token_type: TokenType.API,
            }, GlobalSingleton.jwtToken, {
                expiresIn: "7d"
            });
        }

        return token;
    }
}