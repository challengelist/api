import { Router } from "express";
import { ApiRequest } from "../src/interfaces/ApiRequest";
import { ApiResponse } from "../src/interfaces/ApiResponse";
import fs from "fs";
import path from "path";

const router = Router();

router.get("/:video", async(req: ApiRequest, res: ApiResponse) => {
    const video = req.params.video;
    if (fs.existsSync(path.join(__dirname, "../", "data/videos", video))) {
        return res.sendFile(path.join(__dirname, "../", "data/videos", video));
    }

    return res.status(404).send("");
});

router.get("/", async(req: ApiRequest, res: ApiResponse) => {
    return res.json({
        code: 200,
        data: fs.readdirSync(path.join(__dirname, "../", "data/videos")).map((file) => {
            return "/videos/" + file;
        })
    })
})

export {
    router
};