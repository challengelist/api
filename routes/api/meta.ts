import { Router } from "express";
import { Database } from "../../prisma";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";
import { DisplayAccount } from "../../src/structures/DisplayAccount";
import { Permissions } from "../../src/util/Permissions";

const router = Router();

router.get("/staff", async(req: ApiRequest, res: ApiResponse) => {
    // Get all accounts.
    const accounts = await Database.account.findMany({
        
        include: {
            badges: true,
            groups: true,
            profile: true,
            submissions: true
        }
    });

    // Map the accounts to display accounts.
    const displayAccounts = accounts.map((account) => new DisplayAccount(account));
    console.log(displayAccounts)

    // Filter list staff members.
    const listStaff = displayAccounts.filter(account => {
        // Don't count the site owner.
        if (account.has(Permissions.ADMINISTRATOR)) {
            return false;
        }

        // Check if the account is a list staff member.
        if (account.has(Permissions.MANAGE_RECORDS)) {
            return true;
        }

        return false;
    });


    // Filter site staff members.
    const siteStaff = displayAccounts.filter(account => {
        // Check if the account is a site staff member.
        if (account.has(Permissions.BAN_ACCOUNTS)) {
            return true;
        }

        return false;
    });

    // Sort accounts by group priority.
    listStaff.sort((a, b) => {
        // Sort the groups by priority.
        a.groups.sort((a, b) => b.priority - a.priority);
        b.groups.sort((a, b) => b.priority - a.priority);

        // Sort by group priority.
        if (a.groups[0].priority > b.groups[0].priority) {
            return -1;
        }

        if (a.groups[0].priority < b.groups[0].priority) {
            return 1;
        }

        return 0;
    });

    siteStaff.sort((a, b) => {
        // Sort the groups by priority.
        a.groups.sort((a, b) => b.priority - a.priority);
        b.groups.sort((a, b) => b.priority - a.priority);

        // Sort by group priority.
        if (a.groups[0].priority > b.groups[0].priority) {
            return -1;
        }

        if (a.groups[0].priority < b.groups[0].priority) {
            return 1;
        }

        return 0;
    });


    // Return the staff members.
    return res.status(200).send({
        code: 200,
        message: "Successfully retrieved staff members.",
        data: {
            list: listStaff,
            site: siteStaff
        }
    });
});

export {
    router
};