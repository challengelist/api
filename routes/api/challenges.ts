import { Router } from "express";
import { RecordStatus, RecordType } from "@prisma/client";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";
import { Util } from "../../src/util/Util";
import { Permissions } from "../../src/util/Permissions";
import { Database } from "../../prisma";

const router = Router();

router.get("/", async (req: ApiRequest, res: ApiResponse) => {
    // Get accepted sort parameters.
    const acceptedSort = ["id", "name", "position", "created_at", "updated_at", "deleted_at"];
    const acceptedFilter = ["id", "name", "position", "video"]
    
    // Assert the pagination parameters.
    if (req.pagination?.sort && !acceptedSort.includes(req.pagination.sort)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid sort parameter."
        });
    }

    // Create the where clause.
    const where = Util.generateWhereClause(req.pagination?.filters ?? {}, acceptedFilter);

    // Get every challenge in the database.
    const challenges = await Database.challenge.findMany({
        where,
        take: req.pagination?.limit,
        skip: req.pagination?.after,
        orderBy: {
            [req.pagination?.sort || "id"]: req.pagination?.order ?? "desc"
        }
    });

    // Set Link header.
    res.set("Link", Util.generateLinkHeader("/api/challenges", req.pagination?.limit ?? 50, req.pagination?.after ?? 0, req.pagination?.before ?? 0, challenges.length));
    
    // Return the challenges.
    return res.status(200).json({
        code: 200,
        data: challenges,
    });
});

router.post("/", async(req: ApiRequest, res: ApiResponse) => {
    if (!req.account?.has(Permissions.MANAGE_CHALLENGES)) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    if (!Util.assertObject(req.body, [
        "name",
        "position",
        "verifier",
        "creators",
        "publisher",
        "video"
    ])) {
        return res.status(400).json({
            code: 400,
            message: "Invalid request body."
        });
    }

    // Get all the challenges in the database.
    const challenges = await Database.challenge.findMany();

    if (isNaN(req.body.position)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid position."
        });
    }

    if (req.body.position < 1) {
        return res.status(400).json({
            code: 400,
            message: "Position must be greater than or equal to 1."
        });
    }

    if (req.body.position > challenges.length + 1) {
        return res.status(400).json({
            code: 400,
            message: "Position must be less than or equal to the number of challenges + 1.",
            data: {
                max_position: challenges.length + 1
            }
        });
    }

    // Assert types where needed.
    if (!Array.isArray(req.body.creators)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid request body."
        });
    }

    // Get the current players in the database.
    const players = await Database.player.findMany();
    const creatorsArray: string[] = req.body.creators;
    
    // Get the verifier, if it exists.
    let verifier = players.find(player => player.name === req.body.verifier);

    if (!verifier) {
        // Create the verifier.
        verifier = await Database.player.create({
            data: {
                name: req.body.verifier
            }
        });
    }

    // Get the creators, if they exist.
    const creators = await Promise.all(creatorsArray.map(async creator => {
        const player = players.find(player => player.name === creator);

        if (!player) {
            // Create the player.
            await Database.player.create({
                data: {
                    name: creator
                }
            });
        }

        return player;
    }));

    // Get the publisher, if it exists.
    let publisher = players.find(player => player.name === req.body.publisher);

    if (!publisher) {
        // Create the publisher.
        publisher = await Database.player.create({
            data: {
                name: req.body.publisher
            }
        });
    }

    // Create the challenge.
    const challenge = await Database.challenge.create({
        data: {
            name: req.body.name,
            position: req.body.position,
            verifier_id: verifier.id,
            publisher_id: publisher.id,
            video: req.body.video,
            
            // Map the creators to their IDs.
            creators: {
                connect: creators.map(creator => ({
                    id: creator?.id
                }))
            },
        },
        include: {
            creators: true,
        }
    });

    // Sort the challenges by position.
    challenges.sort((a, b) => a.position - b.position);

    // Push the new challenge to the array at the correct position.
    challenges.splice(challenge.position - 1, 0, challenge);

    // Reposition the challenges. This is done to ensure that the challenges are in the correct order.
    await Promise.all(challenges.map(async (challenge, index) => {
        await Database.challenge.update({
            where: {
                id: challenge.id
            },
            data: {
                position: index + 1
            }
        });
    }));

    // Create a record for the challenge.
    await Database.record.create({
        data: {
            challenge_id: challenge.id,
            player_id: verifier.id,
            submitter_id: req.account.data.id,
            status: RecordStatus.APPROVED,
            type: RecordType.VERIFICATION,
            video: req.body.video,
        }
    });

    // Get the challenge again, this time with the creators and publisher.
    const challengeWithData = await Database.challenge.findFirst({
        where: {
            id: challenge.id
        },
        include: {
            creators: true,
            publisher: true,
            records: true,
            verifier: true
        }
    });

    return res.status(200).json({
        code: 200,
        message: "Successfully created challenge.",
        data: challengeWithData
    });
});

export {
    router
};