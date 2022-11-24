import { Router } from "express";
import { Database } from "../../prisma";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";
import { DisplayAccount } from "../../src/structures/DisplayAccount";
import { Permissions } from "../../src/util/Permissions";
import { UserFlags } from "../../src/util/UserFlags";
import { Util } from "../../src/util/Util";

const router = Router();

// Self endpoints
router.get("/@me", async (req: ApiRequest, res: ApiResponse) => {
    if (!req.account) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    return res.status(200).json({
        code: 200,
        message: "Success!",
        data: {
            account: DisplayAccount.fromUserAccount(req.account)
        }
    });
});

router.get("/@me/key", async (req: ApiRequest, res: ApiResponse) => {
    if (!req.account) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    let token = req.account.data.api_key;
    if (!token) {
        // Generate a new API key.
        token = req.account.generateApiToken();

        // Update the account.
        await Database.account.update({
            where: {
                id: req.account.data.id
            },
            data: {
                api_key: token
            }
        });
    }

    return res.status(200).json({
        code: 200,
        data: {
            key: token
        }
    });
});

router.patch("/:id", async (req: ApiRequest, res: ApiResponse) => {
    // This is a circumstantial endpoint which changes permissions based on the user's roles and percieved permissions.
    if (!req.account) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    // Assert body types.
    if (!Util.assertObjectTypes(req.body, {
        username: "string",

        // Special cases for groups.
        groups: {
            add: "string[]",
            remove: "string[]"
        },

        // Certain flags.
        bans: {
            submissions: "boolean",
        }
    })) {
        return res.status(400).json({
            code: 400,
            message: "Invalid body types."
        });
    }

    // Assert the ID is a number.
    if (isNaN(parseInt(req.params.id))) {
        return res.status(400).json({
            code: 400,
            message: "The ID provided was not a number!"
        });
    }

    // Get the account.
    const account = await Database.account.findFirst({
        where: {
            id: parseInt(req.params.id)
        },
        include: {
            groups: true
        }
    });

    if (!account) {
        return res.status(404).json({
            code: 404,
            message: "The account you are trying to edit does not exist!"
        });
    }

    // Assert that the user doesn't have a higher role than the account they're trying to edit.
    // Sort both groups by priority.
    const ownGroups = req.account.data.groups.sort((a, b) => a.priority - b.priority);
    const accountGroups = account.groups.sort((a, b) => a.priority - b.priority);

    // Assert that the user has a higher role than the account they're trying to edit.
    if (accountGroups.length > 0) {
        if (ownGroups[0].priority <= accountGroups[0].priority && !req.account.has(Permissions.ADMINISTRATOR)) {
            return res.status(403).json({
                code: 403,
                message: "You do not have permission to edit this account!"
            });
        }
    } else {
        if (ownGroups.length === 0 && !req.account.has(Permissions.ADMINISTRATOR)) {
            // It's pretty unlikely that an account with no groups can edit an account with no groups.
            return res.status(403).json({
                code: 403,
                message: "You do not have permission to edit this account!"
            });
        }
    }

    const changes = [];

    if (req.body.groups) {
        // Get the groups.
        const toAddGroups = await Database.group.findMany({
            where: {
                name: {
                    in: req.body.groups.add ?? []
                }
            }
        });

        const toRemoveGroups = await Database.group.findMany({
            where: {
                name: {
                    in: req.body.groups.remove ?? []
                }
            }
        });

        // Merge the groups.
        const newGroups = account.groups.filter(group => {
            if (toRemoveGroups.find(g => g.id === group.id)) {
                return false;
            }

            return true;
        }).concat(toAddGroups);

        // Filter out duplicates.
        const alreadyVisible: number[] = [];
        const filteredGroups = newGroups.filter(group => {
            if (alreadyVisible.includes(group.id)) {
                return false;
            }

            alreadyVisible.push(group.id);

            return true;
        });

        // Check whether the groups have changed.
        if (filteredGroups.length !== account.groups.length) {
            changes.push("groups");
        } else {
            // Sort the groups.
            const sortedGroups = filteredGroups.sort((a, b) => a.priority - b.priority);
            const sortedOldGroups = account.groups.sort((a, b) => a.priority - b.priority);

            // Check whether the groups have changed.
            for (let i = 0; i < sortedGroups.length; i++) {
                if (sortedGroups[i].id !== sortedOldGroups[i].id) {
                    changes.push("groups");
                    break;
                }
            }
        }

        // Update the account if there are changes.
        if (changes.includes("groups")) {
            await Database.account.update({
                where: {
                    id: account.id
                },
                data: {
                    groups: {
                        set: filteredGroups.map(group => ({
                            id: group.id
                        }))
                    }
                },
                include: {
                    groups: true
                }
            });
        }
    }

    if (req.body.bans !== undefined) {
        if (req.body.bans.submissions !== undefined) {
            // Check whether the user has permission to ban submissions.
            if (!req.account.has(Permissions.MANAGE_SUBMITTERS)) {
                return res.status(403).json({
                    code: 403,
                    message: "You do not have permission to ban accounts from submitting records!"
                });
            }


            // Update the account with the new submission ban flag.
            if (req.body.bans.submissions && !(account.flags & UserFlags.SUBMISSION_BANNED)) {
                changes.push("bans[submissions]");

                // Add the flag.
                await Database.account.update({
                    where: {
                        id: account.id
                    },
                    data: {
                        flags: account.flags | UserFlags.SUBMISSION_BANNED
                    }
                });
            } else if (!req.body.bans.submissions && (account.flags & UserFlags.SUBMISSION_BANNED)) {
                changes.push("bans[submissions]");

                // Reverse the flag.
                await Database.account.update({
                    where: {
                        id: account.id
                    },
                    data: {
                        flags: account.flags & ~UserFlags.SUBMISSION_BANNED
                    }
                });
            }
        }
    }

    if (req.body.username !== undefined) {
        // Check whether the user has permission to change usernames.
        if (!req.account.has(Permissions.MANAGE_ACCOUNTS)) {
            return res.status(403).json({
                code: 403,
                message: "You do not have permission to edit this account!"
            });
        }
    }

    if (changes.length > 0) {
        await Database.account.update({
            where: {
                id: account.id
            },
            data: {
                updated_at: new Date()
            }
        });

        // Get the updated account.
        const updatedAccount = await Database.account.findFirst({
            where: {
                id: account.id
            },
            include: {
                badges: true,
                groups: true,
                profile: true,
                submissions: true,
            }
        });

        if (!updatedAccount) {
            return res.status(500).json({
                code: 500,
                message: "An internal server error has occured."
            });
        }

        // Return the updated account.
        return res.status(200).json({
            code: 200,
            message: "Successfully updated the account!",
            data: {
                changes,
                account: new DisplayAccount(updatedAccount)
            }
        });
    } else {
        return res.status(400).json({
            code: 400,
            message: "No changes were provided."
        });
    }
});

router.delete("/@me/key", async (req: ApiRequest, res: ApiResponse) => {
    if (!req.account) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    // Generate a new API key
    const token = req.account.generateApiToken();

    // Update the account.
    await Database.account.update({
        where: {
            id: req.account.data.id
        },
        data: {
            api_key: token
        }
    });

    return res.status(200).json({
        code: 200,
        data: {
            key: token
        }
    });
});

export {
    router
};