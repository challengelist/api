import { Router } from "express";
import { Database } from "../../prisma";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";
import { DisplayAccount } from "../../src/structures/DisplayAccount";

const router = Router();

// Self endpoints
router.get("/@me", async(req: ApiRequest, res: ApiResponse) => {
    if (!req.account) {
        return res.status(401).json({
            code: 401,
            message: "Unauthorized!"
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

router.get("/@me/key", async(req: ApiRequest, res: ApiResponse) => {
    if (!req.account) {
        return res.status(401).json({
            code: 401,
            message: "Unauthorized!"
        });
    }

    let token = req.account.data.api_key
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
        })
    }

    return res.status(200).json({
        code: 200,
        data: {
            key: token
        }
    });
});

router.delete("/@me/key", async(req: ApiRequest, res: ApiResponse) => {
    if (!req.account) {
        return res.status(401).json({
            code: 401,
            message: "Unauthorized!"
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
    })

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