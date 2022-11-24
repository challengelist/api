import { Account, Challenge, Player, Record, RecordStatus } from "@prisma/client";
import { Router } from "express";
import { Database } from "../../prisma";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";
import { Permissions } from "../../src/util/Permissions";
import { Util } from "../../src/util/Util";

const router = Router();

type FullRecord = Record & {
    player: Player;
    challenge: Challenge;
    submitter: Account | null;
}

router.get("/", async(req: ApiRequest, res: ApiResponse) => {
    const acceptedSort = ["id", "updated_at", "deleted_at"];
    const acceptedFilter = ["id", "name", "status", "challenge"];

    // Show only approved records for anyone without MANAGE_RECORDS
    let records: FullRecord[];
    
    // Assert the pagination parameters.
    if (req.pagination?.sort && !acceptedSort.includes(req.pagination.sort)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid sort parameter."
        });
    }
    
    // Create the where clause.
    const where = Util.generateWhereClause(req.pagination?.filters ?? {}, acceptedFilter, {
        special: ["challenge"],
        handle: (filter, value) => {
            if (filter === "challenge") {
                const num = parseInt(value);

                if (!isNaN(num)) {
                    return {
                        id: num
                    };
                } else {
                    return {
                        name: value
                    };
                }
            }
        }
    });

    if (req.account?.has(Permissions.MANAGE_RECORDS)) {
        records = await Database.record.findMany({
            where,
            take: req.pagination?.limit,
            skip: req.pagination?.after,
            orderBy: {
                [req.pagination?.sort || "id"]: req.pagination?.order ?? "desc",
            },
            include: {
                player: true,
                challenge: true,
                submitter: req.account?.has(Permissions.MANAGE_SUBMITTERS) ?? false
            }
        });
    } else {
        if (where.status && where.status !== "APPROVED") {
            return res.status(401).json({
                code: 401,
                message: "You are not allowed to view un-approved records."
            });
        }

        where.status = RecordStatus.APPROVED;

        records = await Database.record.findMany({
            where,
            take: req.pagination?.limit,
            skip: req.pagination?.after,
            orderBy: {
                [req.pagination?.sort || "id"]: req.pagination?.order ?? "desc"
            },
            include: {
                player: true,
                challenge: true,
                submitter: req.account?.has(Permissions.MANAGE_SUBMITTERS) ?? false
            }
        });
    }

    // Set Link header.
    res.set("Link", Util.generateLinkHeader("/api/records", req.pagination?.limit ?? 50, req.pagination?.after ?? 0, req.pagination?.before ?? 0, records.length));

    // Return the records.
    return res.status(200).json({
        code: 200,
        data: Util.exclude(records, [
            "challenge_id",
            "player_id",
            "submitter_id"
        ]),
    });
});

router.post("/", async (req: ApiRequest, res: ApiResponse) => {
    // Assert the body.
    if (!Util.assertObject(req.body, [
        "video",
        "player",
        "challenge"
    ])) {
        return res.status(400).json({
            code: 400,
            message: "Invalid request body."
        });
    }

    // Assert body types.
    if (!Util.assertObjectTypes(req.body, {
        video: "string",
        player: "string",
        status: "string",
        challenge: "string"
    })) {
        return res.status(400).json({
            code: 400,
            message: "Invalid body types."
        });
    }

    // Assert status is valid, if it's there.
    if (req.body.status && !Object.values(RecordStatus).includes(req.body.status)) {
        return res.status(400).json({
            code: 400,
            message: "The status provided was invalid."
        });
    }

    // Anyone without Manage Records cannot use statuses other than SUBMTITED.
    if (req.body.status !== RecordStatus.SUBMITTED && !req.account?.has(Permissions.MANAGE_RECORDS)) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    // Check whether the challenge exists or not.
    const challenge = await Database.challenge.findFirst({
        where: {
            name: req.body.challenge
        }
    });

    if (!challenge) {
        return res.status(409).json({
            code: 409,
            message: "This challenge does not exist."
        })
    }

    // Validate the video.
    if (!await Util.assertAcceptableVideoLink(req.body.video)) {
        return res.status(422).json({
            code: 422,
            message: "An invalid video was provided."
        });
    }

    // Check whether the player exists or not.
    let player = await Database.player.findFirst({
        where: {
            name: req.body.player
        }
    });

    if (!player) {
        // Create a player in it's place.
        player = await Database.player.create({
            data: {
                name: req.body.verifier
            }
        });
    }
    // Create the record.
    const record = await Database.record.create({
        data: {
            challenge_id: challenge.id,
            submitter_id: req.account?.data.id,
            player_id: player.id,
            video: req.body.video
        }
    });

    // Return the new record.
    return res.status(200).json({
        code: 200,
        message: "Record successfully created.",
        data: {
            record: Util.exclude(record, [
                "challenge_id",
                "player_id",
                "submitter_id"
            ])
        }
    })
});

export {
    router
};