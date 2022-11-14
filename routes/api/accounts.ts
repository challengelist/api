import { Router } from "express";
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
        data: new DisplayAccount(req.account)
    });
});

export {
    router
};