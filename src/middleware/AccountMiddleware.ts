import { NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";
import { Database } from "../../prisma";
import { ApiRequest } from "../interfaces/ApiRequest";
import { ApiResponse } from "../interfaces/ApiResponse";
import { TokenType } from "../structures/enums/TokenType";
import { UserAccount } from "../structures/UserAccount";
import { GlobalSingleton } from "../util/GlobalSingleton";

interface TokenData {
    id: number;
    username: string;
    token_type: TokenType;
}

export class AccountMiddleware {
    static async assertToken(token: string) {
        return new Promise(async (resolve,) => {
            if (process.env.CL_USE_RSA256_JWT === "true") {
                // Attempt to validate it as a RSA256 token, first.
                await jsonwebtoken.verify(token, GlobalSingleton.rsaPublicKey ?? "", async (err, decoded) => {
                    if (err || decoded === undefined) {
                        // Attempt to validate it as a standard token, next.
                        jsonwebtoken.verify(token, GlobalSingleton.jwtToken, async (err, decoded) => {
                            if (err || decoded === undefined) {
                                resolve(null);
                            }

                            // Return the decoded data.
                            resolve(decoded);
                        });
                    }

                    // Return the decoded data.
                    resolve(decoded);
                });
            } else {
                // Attempt to validate it as a standard token, first.
                await jsonwebtoken.verify(token, GlobalSingleton.jwtToken, async (err, decoded) => {
                    if (err || decoded === undefined) {
                        resolve(null);
                    }

                    // Return the decoded data.
                    resolve(decoded);
                });
            }

            return null;
        });
    }

    static async getAccount(decodedData: TokenData) {
        return await Database.account.findFirst({
            where: {
                id: decodedData.id
            }
        });
    }

    static async handle(req: ApiRequest, res: ApiResponse, next: NextFunction) {
        // Assert authorization header validity.
        if (req.headers.authorization) {
            if (req.headers.authorization.split(" ")[0] !== "Account") {
                return next();
            }
            const token = req.headers.authorization.split(" ")[1];
            if (token) {
                // Assert token validity.
                const decodedData = await AccountMiddleware.assertToken(token);

                if (decodedData === null) {
                    return next();
                }

                // Get the account.
                const account = await Database.account.findFirst({
                    where: {
                        id: (decodedData as TokenData).id
                    },
                    include: {
                        badges: true,
                        groups: true,
                        profile: true,
                        submissions: true
                    }
                });

                // Set the account.
                if (account) {
                    req.account = new UserAccount(account);
                }
            }
        }

        next();
    }
}