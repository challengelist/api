import { Router } from "express";
import { ApiRequest } from "../src/interfaces/ApiRequest";
import { ApiResponse } from "../src/interfaces/ApiResponse";

const router = Router();

router.get("/", async(req: ApiRequest, res: ApiResponse) => {
    return res.send("");
});

export {
    router
};