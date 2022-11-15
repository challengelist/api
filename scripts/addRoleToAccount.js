const inquirer = require("inquirer");
const { PrismaClient } = require("@prisma/client");

let client = new PrismaClient();
module.exports = {
    name: "Add account to group",
    execute: () => {
        // Inquire the user about the group in question.
        inquirer.prompt([
            {
                type: "input",
                name: "id",
                message: "What is the id of the account?"
            },
            {
                type: "input",
                name: "role_id",
                message: "What is the id of the role?"
            },
        ]).then(answers => {
            // Create the group.
            client.account.update({
                where: {
                    id: parseInt(answers.id)
                },
                data: {
                    groups: {
                        connect: {
                            id: parseInt(answers.role_id)
                        }
                    }
                }
            }).catch(error => {
                // Empty line.
                console.log("");

                // Log the error.
                console.log("Error creating assignment:");
                console.log(error);

                // Exit the script.
                process.exit();
            });
        });
    }
}