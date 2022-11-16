// @ts-check
const chalk = require("chalk");
const inquirer = require("inquirer");
const { PrismaClient } = require("@prisma/client");

// All current permissions.
const Permissions = {
    // SITE OWNER PERMISSIONS
    ADMINISTRATOR: 1 << 0,
    MANAGE_WEBSITE: 1 << 1,
    DELETE_ACCOUNTS: 1 << 2, // This is mine, and mine alone.

    // SITE ADMINISTRATOR PERMISSIONS
    MANAGE_ACCOUNTS: 1 << 3,

    // SITE MODERATOR PERMISSIONS
    MANAGE_GROUPS: 1 << 4,
    BAN_ACCOUNTS: 1 << 5,

    // LIST OWNER PERMISSIONS
    DELETE_CHALLENGES: 1 << 6, // Dangerous permissions are reserved for the most trusted people.

    // LIST MODERATOR PERMISSIONS
    MANAGE_CHALLENGES: 1 << 7,
    MANAGE_PLAYERS: 1 << 8,
    MANAGE_USER_GROUPS: 1 << 9, // Shared with Site Moderator and above, but limited to roles lower in priority.
    TIMEOUT_ACCOUNTS: 1 << 10, // Shared with Site Moderator

    // LIST HELPER PERMISSIONS
    MANAGE_RECORDS: 1 << 11,
    MANAGE_SUBMITTERS: 1 << 12
}


let client = new PrismaClient();
module.exports = {
    name: "Check group permisisons",
    execute: async() => {
        // Get all the groups.
        const groups = await client.group.findMany({
            orderBy: {
                priority: "desc"
            }
        })

        for (let group of groups) {
            console.log(`${chalk.hex("#9c9c9c")`Group ${group.id}: ${chalk.hex(group.color).bgHex(group.background_color)` ${group.name.toUpperCase()} `}'s permissions:`}`)

            for (let perm of Object.keys(Permissions)) {
                if (group.permissions_grant & Permissions[perm]) {
                    console.log(`${chalk.hex("#9c9c9c")`Grant: ${chalk.hex("#8bd68e")`${perm}`}`}`)
                }

                if (group.permissions_revoke & Permissions[perm]) {
                    console.log(`${chalk.hex("#9c9c9c")`Revoke: ${chalk.hex("#d68b8b")`${perm}`}`}`)
                }
            }

            console.log("");
        }
    }
}