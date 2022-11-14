import { Account, Badge, Group, Player } from "@prisma/client";

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
    }
}