import { RecordStatus, RecordType } from "@prisma/client";
import { Router } from "express";
import { isEqual } from "lodash";
import { Database } from "../../prisma";
import { ApiRequest } from "../../src/interfaces/ApiRequest";
import { ApiResponse } from "../../src/interfaces/ApiResponse";
import { Permissions } from "../../src/util/Permissions";
import { Util } from "../../src/util/Util";

const router = Router();

router.get("/", async (req: ApiRequest, res: ApiResponse) => {
    // Get accepted sort parameters.
    const acceptedSort = ["id", "name", "position", "created_at", "updated_at", "deleted_at"];
    const acceptedFilter = ["id", "name", "position", "video"];

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


router.get("/list", async (req: ApiRequest, res: ApiResponse) => {
    const allowedTypes = ["legacy", "main"];

    const type = req.query.type as string ?? "main";

    // Assert the type parameter.
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid type parameter."
        });
    }

    let after = 0;
    if (type === "legacy") {
        after = parseInt(process.env.CL_MAX_CHALLENGES ?? "100");
    }

    // Get the challenges.
    const challenges = await Database.challenge.findMany({
        skip: after,
        take: parseInt(process.env.CL_MAX_CHALLENGES ?? "100"),
        orderBy: {
            position: "asc"
        }
    });

    // Return the challenges.
    return res.status(200).json({
        code: 200,
        data: challenges
    });
});

router.get("/:id", async (req: ApiRequest, res: ApiResponse) => {
    // Parse the ID.
    const id = parseInt(req.params.id as string);

    // Assert the ID is a number.
    if (isNaN(id)) {
        return res.status(400).json({
            code: 400,
            message: "An invalid id was provided."
        });
    }

    // Get the challenge.
    const challenge = await Database.challenge.findFirst({
        where: {
            id
        }
    });

    // Check if the challenge exists.
    if (!challenge) {
        return res.status(404).json({
            code: 404,
            message: "This chhallenge was not found."
        });
    }

    // Return the challenge.
    return res.status(200).json({
        code: 200,
        data: {
            challenge
        }
    });
});

router.get("/:id/creators", async (req: ApiRequest, res: ApiResponse) => {
    // Parse the ID.
    const id = parseInt(req.params.id as string);

    // Assert the ID is a number.
    if (isNaN(id)) {
        return res.status(400).json({
            code: 400,
            message: "An invalid id was provided."
        });
    }

    // Get the challenge.
    const challenge = await Database.challenge.findFirst({
        where: {
            id
        },
        include: {
            creators: true
        }
    });

    // Check if the challenge exists.
    if (!challenge) {
        return res.status(404).json({
            code: 404,
            message: "This challenge was not found."
        });
    }

    // Return the challenge creators..
    return res.status(200).json({
        code: 200,
        data: {
            creators: challenge.creators
        }
    });
});

router.post("/", async (req: ApiRequest, res: ApiResponse) => {
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

    // Assert body types.
    if (!Util.assertObjectTypes(req.body, {
        name: "string",
        position: "number",
        video: "string",
        creators: "string[]",
        verifier: "string",
        publisher: "string",
        fps: "string",
    })) {
        return res.status(400).json({
            code: 400,
            message: "Invalid body types."
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

    // Assert the video URL.
    if (!(await Util.assertAcceptableVideoLink(req.body.video))) {
        return res.status(400).json({
            code: 400,
            message: "Invalid video URL."
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

        // Add the verifier to the players array.
        players.push(verifier);
    }

    // Get the creators, if they exist.
    const creators = await Promise.all(creatorsArray.map(async creator => {
        let player = players.find(player => player.name === creator);

        if (!player) {
            // Create the player.
            player = await Database.player.create({
                data: {
                    name: creator
                }
            });
        }

        // Add the creator to the players array.
        players.push(player);

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

        // Add the publisher to the players array.
        players.push(publisher);
    }

    // Create the challenge.
    const challenge = await Database.challenge.create({
        data: {
            name: req.body.name,
            position: req.body.position,
            verifier_id: verifier.id,
            publisher_id: publisher.id,
            video: req.body.video,
            fps: req.body.fps ?? "Any",
            points_worth: 0,

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

router.post("/:id/creators", async (req: ApiRequest, res: ApiResponse) => {
    if (!req.account?.has(Permissions.MANAGE_CHALLENGES)) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    // Assert the only required body parameter.
    if (!Util.assertObject(req.body, [
        "creator"
    ])) {
        return res.status(400).json({
            code: 400,
            message: "Invalid request body."
        });
    }

    // Assert body types.
    if (!Util.assertObjectTypes(req.body, {
        creator: "string"
    })) {
        return res.status(400).json({
            code: 400,
            message: "Invalid body types."
        });
    }
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid challenge ID."
        });
    }

    // Get the challenge.
    const challenge = await Database.challenge.findFirst({
        where: {
            id
        },
        include: {
            creators: true
        }
    });

    if (!challenge) {
        return res.status(404).json({
            code: 404,
            message: "Challenge not found."
        });
    }

    // Check if the creator is already in the challenge.
    if (challenge.creators.find(creator => creator.name === req.body.creator)) {
        return res.status(400).json({
            code: 400,
            message: "This player is already a creator for this challenge."
        });
    }

    // Check if the creator exists.
    let creator = await Database.player.findFirst({
        where: {
            name: req.body.creator
        }
    });

    if (!creator) {
        // Create the creator.
        creator = await Database.player.create({
            data: {
                name: req.body.creator
            }
        });
    }

    // Add the creator to the challenge.
    const newChallenge = await Database.challenge.update({
        where: {
            id: challenge.id
        },
        data: {
            creators: {
                connect: {
                    id: creator.id
                }
            }
        },
        include: {
            creators: true
        }
    });

    // Return the creator.
    return res.status(200).json({
        code: 200,
        message: "Successfully added creator.",
        data: {
            creators: newChallenge.creators,
            creator
        }
    });
});

router.patch("/:id/creators", async (req: ApiRequest, res: ApiResponse) => {
    if (!req.account?.has(Permissions.MANAGE_CHALLENGES)) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    // Assert the only required body parameter.
    if (!Util.assertObject(req.body, [
        "creators"
    ])) {
        return res.status(400).json({
            code: 400,
            message: "Invalid request body."
        });
    }

    // Assert body types.
    if (!Util.assertObjectTypes(req.body, {
        creators: "string[]"
    })) {
        return res.status(400).json({
            code: 400,
            message: "Invalid body types."
        });
    }

    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid challenge ID."
        });
    }

    // Get the challenge.
    const challenge = await Database.challenge.findFirst({
        where: {
            id
        },
        include: {
            creators: true
        }
    });

    if (!challenge) {
        return res.status(404).json({
            code: 404,
            message: "Challenge not found."
        });
    }

    // Assert that all the creators exist.
    const creatorsArray = req.body.creators as string[];

    // Check if the creators are the same.
    if (creatorsArray.length !== challenge.creators.length || isEqual(creatorsArray.sort(), challenge.creators.map(creator => creator.name).sort())) {
        // Get all the players.
        const players = await Database.player.findMany({
            where: {
                name: {
                    in: creatorsArray
                }
            }
        });

        // Find the creators that don't exist.
        const creators = creatorsArray.filter(creator => !players.find(player => player.name === creator));

        // Create the creators.
        await Promise.all(creators.map(async creator => {
            const player = await Database.player.create({
                data: {
                    name: creator
                }
            });

            // Add the creator to the players array.
            players.push(player);
        }));

        // Assert that no duplicates exist.
        const alreadyThere: string[] = [];
        const unique = players.filter(player => {
            if (alreadyThere.includes(player.name)) {
                return false;
            } else {
                alreadyThere.push(player.name);
                return true;
            }
        });

        // Get the plaayers in the array.
        const newCreators = unique.filter(player => creatorsArray.includes(player.name));

        // Update the challenge's creators.
        const newChallenge = await Database.challenge.update({
            where: {
                id: challenge.id
            },
            data: {
                creators: {
                    connect: newCreators.map(player => ({
                        id: player.id
                    }))
                }
            },
            include: {
                creators: true
            }
        });

        return res.status(200).json({
            code: 200,
            message: "Successfully updated challenge creators.",
            data: newChallenge.creators
        });
    } else {
        return res.status(400).json({
            code: 400,
            message: "These players are all assigned as creators already."
        });
    }
});

router.patch("/:id", async (req: ApiRequest, res: ApiResponse) => {
    if (!req.account?.has(Permissions.MANAGE_CHALLENGES)) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    // Assert body types.
    if (!Util.assertObjectTypes(req.body, {
        name: "string",
        position: "number",
        video: "string",
        creators: "string[]",
        verifier: "string",
        publisher: "string",
        fps: "string",
    })) {
        return res.status(400).json({
            code: 400,
            message: "Invalid body types."
        });
    }

    // Parse the ID.
    const id = parseInt(req.params.id as string);

    // Assert the ID is a number.
    if (isNaN(id)) {
        return res.status(400).json({
            code: 400,
            message: "An invalid id was provided."
        });
    }

    // Get the current challenge.
    const challenge = await Database.challenge.findFirst({
        where: {
            id
        },
        include: {
            creators: true,
            publisher: true,
            records: true,
            verifier: true
        }
    });

    // Check if the challenge exists.
    if (!challenge) {
        return res.status(404).json({
            code: 404,
            message: "This challenge was not found."
        });
    }

    // Handle possible changes.
    const changes = [];

    if (req.body.name && req.body.name !== challenge.name) {
        changes.push("name");
    }

    const position = parseInt(req.body.position as string);
    if (req.body.position && position !== challenge.position) {
        changes.push("position");

        // Assert the position is a number.
        if (isNaN(position)) {
            return res.status(400).json({
                code: 400,
                message: "Invalid position."
            });
        }

        // Get all the challenges in the database.
        const challenges = await Database.challenge.findMany();

        if (position < 1) {
            return res.status(400).json({
                code: 400,
                message: "Position must be greater than or equal to 1."
            });
        }

        if (position > challenges.length + 1) {
            return res.status(400).json({
                code: 400,
                message: "Position must be less than or equal to the number of challenges + 1.",
                data: {
                    max_position: challenges.length + 1
                }
            });
        }

        // Sort the challenges by position.
        challenges.sort((a, b) => a.position - b.position);

        // Remove the challenge from the array.
        challenges.splice(challenge.position - 1, 1);

        // Push the challenge to the array at the correct position.
        challenges.splice(position - 1, 0, challenge);

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
    }

    let videoValidated = false;
    if (req.body.verifier && req.body.verifier !== challenge.verifier.name) {
        changes.push("verifier");

        // Special case: If the verifier is being changed, we need to modify the current verification record.
        // Additionally, we also need the video to be changed.
        const verificationRecord = challenge.records.find(record => record.type === RecordType.VERIFICATION);

        if (!req.body.video) {
            return res.status(400).json({
                code: 400,
                message: "A video is required when changing the verifier. It can be the same video, however."
            });
        }

        // Assert the video URL.
        if (!(await Util.assertAcceptableVideoLink(req.body.video))) {
            return res.status(422).json({
                code: 422,
                message: "Invalid video URL."
            });
        }

        // Video is valid.
        videoValidated = true;

        // Get the verifier.
        let verifier = await Database.player.findFirst({
            where: {
                name: req.body.verifier
            }
        });

        // Check if the verifier exists.
        if (!verifier) {
            // Create the verifier if it doesn't exist.
            verifier = await Database.player.create({
                data: {
                    name: req.body.verifier
                }
            });
        }

        if (verificationRecord) {
            await Database.record.update({
                where: {
                    id: verificationRecord.id
                },
                data: {
                    player_id: verifier.id,
                    video: req.body.video
                }
            });
        }

        // Update the challenge.
        await Database.challenge.update({
            where: {
                id
            },
            data: {
                verifier_id: verifier.id
            }
        });
    }

    if (req.body.publisher && req.body.publisher !== challenge.publisher.name) {
        changes.push("publisher");

        // Get the publisher.
        let publisher = await Database.player.findFirst({
            where: {
                name: req.body.publisher
            }
        });

        // Check if the publisher exists.
        if (!publisher) {
            // Create the publisher if it doesn't exist.
            publisher = await Database.player.create({
                data: {
                    name: req.body.publisher
                }
            });
        }

        await Database.challenge.update({
            where: {
                id
            },
            data: {
                publisher_id: publisher.id
            }
        });
    }

    if (req.body.video && req.body.video !== challenge.video) {
        changes.push("video");
        // Assert the video URL if necessary.
        if (!videoValidated && !(await Util.assertAcceptableVideoLink(req.body.video))) {
            return res.status(400).json({
                code: 400,
                message: "Invalid video URL."
            });
        }
    }

    if (req.body.creators) {

        // Assert that all the creators exist.
        const creatorsArray = req.body.creators as string[];

        // Check if the creators are the same.
        if (creatorsArray.length !== challenge.creators.length || isEqual(creatorsArray.sort(), challenge.creators.map(creator => creator.name).sort())) {
            changes.push("creators");

            // Get all the players.
            const players = await Database.player.findMany({
                where: {
                    name: {
                        in: creatorsArray
                    }
                }
            });

            // Find the creators that don't exist.
            const creators = creatorsArray.filter(creator => !players.find(player => player.name === creator));

            // Create the creators.
            await Promise.all(creators.map(async creator => {
                const player = await Database.player.create({
                    data: {
                        name: creator
                    }
                });

                // Add the creator to the players array.
                players.push(player);
            }));

            // Get the plaayers in the array.
            const newCreators = players.filter(player => creatorsArray.includes(player.name));

            // Update the challenge's creators.
            await Database.challenge.update({
                where: {
                    id: challenge.id
                },
                data: {
                    creators: {
                        connect: newCreators.map(player => ({
                            id: player.id
                        }))
                    }
                }
            });
        }
    }

    if (req.body.fps && req.body.fps !== challenge.fps) {
        changes.push("fps");
    }

    // Handle the changes.
    if (changes.length > 0) {
        await Database.challenge.update({
            where: {
                id: challenge.id
            },
            data: {
                name: req.body.name || challenge.name,
                position: req.body.position || challenge.position,
                video: req.body.video || challenge.video,
                fps: req.body.fps || challenge.fps
            }
        });

        // Get the updated challenge.
        const updatedChallenge = await Database.challenge.findFirst({
            where: {
                id
            },
            include: {
                creators: true,
                publisher: true,
                records: true,
                verifier: true
            }
        });

        // Send the updated challenge.
        return res.status(200).json({
            code: 200,
            message: "Challenge updated successfully.",
            data: {
                changes,
                challenge: updatedChallenge
            }
        });
    } else {
        return res.status(400).json({
            code: 400,
            message: "No changes were provided."
        });
    }
});

router.delete("/:id", async (req: ApiRequest, res: ApiResponse) => {
    if (!req.account?.has(Permissions.DELETE_CHALLENGES)) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    const id = req.params.id;

    // Assert the id is a number.
    if (isNaN(parseInt(id))) {
        return res.status(400).json({
            code: 400,
            message: "The id must be a number."
        });
    }

    // Get the challenge.
    const challenge = await Database.challenge.findFirst({
        where: {
            id: parseInt(id)
        },
        include: {
            records: true,
            creators: true,
            publisher: true,
            verifier: true
        }
    });

    // Check if the challenge exists.
    if (!challenge) {
        return res.status(404).json({
            code: 404,
            message: "This challenge does not exist."
        });
    }

    // Delete all of the challenge's records.
    await Database.record.deleteMany({
        where: {
            id: {
                in: challenge.records.map(record => record.id)
            }
        }
    });

    // Delete the challenge.
    await Database.challenge.delete({
        where: {
            id: challenge.id
        }
    });

    // Get every challenge.
    const challenges = await Database.challenge.findMany({
        orderBy: {
            position: "asc"
        }
    });

    // Reorder the challenges.
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

    // Send the challenge that was deleted.
    return res.status(200).json({
        code: 200,
        message: "Challenge deleted successfully.",
        data: {
            challenge
        }
    });
});

router.delete("/:id/creators", async (req: ApiRequest, res: ApiResponse) => {
    if (!req.account?.has(Permissions.MANAGE_CHALLENGES)) {
        return res.status(401).json({
            code: 401,
            message: "You are not authorized to use this endpoint!"
        });
    }

    // Assert the only required body parameter.
    if (!Util.assertObject(req.body, [
        "creator"
    ])) {
        return res.status(400).json({
            code: 400,
            message: "Invalid request body."
        });
    }

    // Assert body types.
    if (!Util.assertObjectTypes(req.body, {
        creator: "string"
    })) {
        return res.status(400).json({
            code: 400,
            message: "Invalid body types."
        });
    }
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid challenge ID."
        });
    }

    // Get the challenge.
    const challenge = await Database.challenge.findFirst({
        where: {
            id
        },
        include: {
            creators: true
        }
    });

    if (!challenge) {
        return res.status(404).json({
            code: 404,
            message: "Challenge not found."
        });
    }

    // Check if the creator is missing.
    if (!challenge.creators.find(creator => creator.name === req.body.creator)) {
        return res.status(404).json({
            code: 404,
            message: "Creator not found."
        });
    }

    const creator = challenge.creators.find(creator => creator.name === req.body.creator);

    // Remove the creator.
    await Database.challenge.update({
        where: {
            id: challenge.id
        },
        data: {
            creators: {
                disconnect: {
                    id: creator?.id
                }
            }
        }
    });

    // Return the creator.
    return res.status(200).json({
        code: 200,
        message: "Creator removed successfully.",
        data: {
            creators: challenge.creators.filter(creator => creator.name !== req.body.creator),
            creator
        }
    });
});

export {
    router
};