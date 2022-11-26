import argon2 from "argon2";
import { NextFunction, Router } from "express";
import jsonwebtoken from "jsonwebtoken";
import { Database } from "../../prisma/";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";
import { DisplayAccount } from "../../src/structures/DisplayAccount";
import { TokenType } from "../../src/structures/enums/TokenType";
import { GlobalSingleton } from "../../src/util/GlobalSingleton";
import { createError, createResponse } from "../../src/util/StatusCodes";
import { Util } from "../../src/util/Util";

const router = Router();

// Account endpoints
router.post("/register", async (req: ApiRequest, res: ApiResponse, next: NextFunction) => {
    // Assert the body.
    if (!Util.assertObject(req.body, ["username", "password"])) {
        return next(createError(400, 40000));
    }

    // Check if the username is taken.
    const account = await Database.account.findFirst({
        where: {
            username: req.body.username
        }
    });

    if (account) {
        return next(createError(409, 40900))
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
    return res.status(200).json(createResponse(200, 20001, {
        id: data.id,
        username: data.username
    }));
});

router.post("/login", async (req: ApiRequest, res: ApiResponse, next: NextFunction) => {
    // Assert the body.
    let username;
    let password;
    if (req.headers["authorization"]?.startsWith("Basic")) {
        // Basic authorization protocol.
        const header = req.headers["authorization"].slice(6);
        const decoded = Buffer.from(header, "base64").toString("utf-8");
        const split = decoded.split(":");

        username = split[0];
        password = split[1];
    } else {
        // Content body.
        if (!Util.assertObject(req.body, ["username", "password"])) {
            return next(createError(401, 40101))
        }

        // Assert body types.
        if (typeof req.body.username !== "string" || typeof req.body.password !== "string") {
            return next(createError(401, 40101))
        }

        username = req.body.username;
        password = req.body.password;
    }
    // Check if the username is taken.
    const account = await Database.account.findFirst({
        where: {
            username: username
        },
        include: {
            badges: true,
            groups: true,
            profile: true
        }
    });

    if (!account) {
        return next(createError(401, 40101))
    }

    // Check if the password is correct.
    if (!await argon2.verify(account.password_hash, password)) {
        return next(createError(401, 40101))
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
    return res.status(200).json(createResponse(200, 20001, {
        account: new DisplayAccount(account),
        token
    }));
});

export {
    router
};