export enum Permissions {
    // SITE OWNER PERMISSIONS
    MANAGE_WEBSITE = 1 << 0,
    DELETE_ACCOUNTS = 1 << 1, // This is mine, and mine alone.

    // SITE ADMINISTRATOR PERMISSIONS
    MANAGE_ACCOUNTS = 1 << 2,

    // SITE MODERATOR PERMISSIONS
    MANAGE_GROUPS = 1 << 3,
    BAN_ACCOUNTS = 1 << 4,

    // LIST OWNER PERMISSIONS
    DELETE_CHALLENGES = 1 << 5, // Dangerous permissions are reserved for the most trusted people.

    // LIST MODERATOR PERMISSIONS
    MANAGE_CHALLENGES = 1 << 6,
    MANAGE_PLAYERS = 1 << 7,
    MANAGE_USER_GROUPS = 1 << 8, // Shared with Site Moderator and above, but limited to roles lower in priority.
    TIMEOUT_ACCOUNTS = 1 << 9, // Shared with Site Moderator

    // LIST HELPER PERMISSIONS
    MANAGE_RECORDS = 1 << 10,
    MANAGE_SUBMITTERS = 1 << 11, 
};
