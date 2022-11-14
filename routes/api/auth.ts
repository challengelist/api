import { Router } from "express";
import argon2 from "argon2";
import { Database } from "../../prisma/";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";

const router = Router();

// Account endpoints
router.post("/register", async(req: ApiRequest, res: ApiResponse) => {
    // Assert the body.
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            code: 400,
            message: "Missing username or password!"
        });
    }

    // Check if the username is taken.
    const account = await Database.account.findFirst({
        where: {
            username: req.body.username
        }
    });

    if (account) {
        return res.status(400).json({
            code: 400,
            message: "This username is taken!"
        });
    }


    // Hash the password

    // Create the account.
    let data = await Database.account.create({
        data: {
            username: req.body.username as string,
            password_hash: await argon2.hash(req.body.password, {
                type: argon2.argon2id
            })
        }
    });


    // Return the response.
    return res.status(200).json({
        code: 200,
        message: "Account created!",
        data: {
            id: data.id,
            username: data.username
        }
    }); 
});

export {
    router
};