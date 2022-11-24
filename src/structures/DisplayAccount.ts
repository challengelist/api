import { Account, Badge, Group, Player } from "@prisma/client";
import { Permissions } from "../util/Permissions";
import { UserAccount } from "./UserAccount";

/**
 * A displayable version of the account, without the password hash and other important information.
 */
export class DisplayAccount {
    public id: number;
    public username: string;
    public created_at: Date;
    public updated_at: Date;
    public badges: Badge[];
    public groups: Group[];
    public profile: Player | null;
    public permissions: number;
    public flags: number;

    constructor(account: Account & {
        badges: Badge[];
        groups: Group[];
        profile: Player | null;
    }) {
        this.id = account.id;
        this.username = account.username;
        this.created_at = account.created_at;
        this.updated_at = account.updated_at;
        this.badges = account.badges;
        this.groups = account.groups;
        this.profile = account.profile;
        this.flags = account.flags;

        // Handle permissions.
        const adminGroup = account.groups.find(group => group.permissions_grant & Permissions.ADMINISTRATOR);

        if (adminGroup) {
            // Grant all permissions
            this.permissions = 0;

            for (const key of Object.keys(Permissions)) {
                this.permissions |= Permissions[key as keyof typeof Permissions];
            }
        } else {
            this.permissions = account.groups.reduce((permissions, group) => {
                return permissions |= group.permissions_grant;
            }, 0);
        }
    }

    has(permission: Permissions) {
        return (this.permissions & permission) == permission;
    }

    static fromUserAccount(account: UserAccount) {
        return new DisplayAccount(account.data);
    }
}