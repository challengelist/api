export enum Permissions {
    // SITE OWNER PERMISSIONS
    ADMINISTRATOR = 1 << 0,
    MANAGE_WEBSITE = 1 << 1,
    DELETE_ACCOUNTS = 1 << 2, // This is mine, and mine alone.

    // SITE ADMINISTRATOR PERMISSIONS
    MANAGE_ACCOUNTS = 1 << 3,

    // SITE MODERATOR PERMISSIONS
    MANAGE_GROUPS = 1 << 4,
    BAN_ACCOUNTS = 1 << 5,

    // LIST OWNER PERMISSIONS
    DELETE_CHALLENGES = 1 << 6, // Dangerous permissions are reserved for the most trusted people.

    // LIST MODERATOR PERMISSIONS
    MANAGE_CHALLENGES = 1 << 7,
    MANAGE_PLAYERS = 1 << 8,
    MANAGE_USER_GROUPS = 1 << 9, // Shared with Site Moderator and above, but limited to roles lower in priority.
    TIMEOUT_ACCOUNTS = 1 << 10, // Shared with Site Moderator

    // LIST HELPER PERMISSIONS
    MANAGE_RECORDS = 1 << 11,
    MANAGE_SUBMITTERS = 1 << 12
}
