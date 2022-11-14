import { Router } from "express";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";

const router = Router();

router.get("/", async(req: ApiRequest, res: ApiResponse) => {
    return res.status(418).send({
        code: 418,
        message: "I'm a teapot! Also, this is a test route."
    });
});

export {
    router
};