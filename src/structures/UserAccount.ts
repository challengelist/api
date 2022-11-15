import { Account, Badge, Group, Player } from "@prisma/client";
import { Permissions } from "../util/Permissions";

/**
 * A representation of a user's account.
 */
export class UserAccount {
    data: Account & {
        badges: Badge[];
        groups: Group[];
        profile: Player | null;
    }

    constructor(account: Account & {
        badges: Badge[];
        groups: Group[];
        profile: Player | null;
    }) {
        this.data = account;
    }

    /**
     * Asserts that the account has the specified permission.
     * @param permissions The permissions to check for.
     */
    has(permissions: number) {
        // Handle permissions.
        const adminGroup = this.data.groups.find(group => group.permissions_grant & Permissions.ADMINISTRATOR);

        if (adminGroup) {
            // Grant all permissions
            return true;
        } else {
            return this.data.groups
                .reduce((a, b) => a | b.permissions_grant, 0)
                & this.data.groups.reduce((a, b) => a & ~b.permissions_revoke, 0) & permissions;
        }
    }
}