import argon2 from "argon2";
import { Router } from "express";
import jsonwebtoken from "jsonwebtoken";
import { Database } from "../../prisma/";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";
import { DisplayAccount } from "../../src/structures/DisplayAccount";
import { TokenType } from "../../src/structures/enums/TokenType";
import { GlobalSingleton } from "../../src/util/GlobalSingleton";
import { Util } from "../../src/util/Util";

const router = Router();

// Account endpoints
router.post("/register", async (req: ApiRequest, res: ApiResponse) => {
    // Assert the body.
    if (!Util.assertObject(req.body, ["username", "password"])) {
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

    // Create the account.
    const data = await Database.account.create({
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

router.post("/login", async (req: ApiRequest, res: ApiResponse) => {
    // Assert the body.
    if (!Util.assertObject(req.body, ["username", "password"])) {
        return res.status(400).json({
            code: 400,
            message: "Missing username or password!"
        });
    }

    // Assert body types.
    if (typeof req.body.username !== "string" || typeof req.body.password !== "string") {
        return res.status(400).json({
            code: 400,
            message: "Invalid username or password!"
        });
    }

    // Check if the username is taken.
    const account = await Database.account.findFirst({
        where: {
            username: req.body.username
        },
        include: {
            badges: true,
            groups: true,
            profile: true
        }
    });

    if (!account) {
        return res.status(400).json({
            code: 400,
            message: "Invalid username or password!"
        });
    }

    // Check if the password is correct.
    if (!await argon2.verify(account.password_hash, req.body.password)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid username or password!"
        });
    }

    // Create a session token.
    let token;
    if (process.env.CL_USE_RSA256_JWT === "true") {
        token = jsonwebtoken.sign({
            id: account.id,
            username: account.username,
            token_type: TokenType.SESSION,
        }, GlobalSingleton.rsaKey ?? "", {
            algorithm: "RS256",
            expiresIn: "7d"
        });
    } else {
        token = jsonwebtoken.sign({
            id: account.id,
            username: account.username,
            token_type: TokenType.SESSION,
        }, GlobalSingleton.jwtToken, {
            expiresIn: "7d"
        });
    }

    // Insert the token into the database.
    await Database.session.create({
        data: {
            account_id: account.id,
            session_token: token,
        }
    });

    // Return the response.
    return res.status(200).json({
        code: 200,
        message: "Logged in!",
        data: {
            account: new DisplayAccount(account),
            token
        }
    });
});

export {
    router
};