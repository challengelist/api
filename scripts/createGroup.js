const { PrismaClient } = require("@prisma/client");
const inquirer = require("inquirer");

let client = new PrismaClient();
module.exports = {
    name: "Create group script",
    execute: () => {
        // Inquire the user about the group in question.
        inquirer.prompt([
            {
                type: "input",
                name: "name",
                message: "What is the name of the group?"
            },
            {
                type: "input",
                name: "color",
                message: "What is the color of the group?",
                default: "#FFFFFF"
            },
            {
                type: "input",
                name: "background_color",
                message: "What is the background color of the group?",
                default: "#000000"
            },
            {
                type: "input",
                name: "priority",
                message: "What is the priority of the group?",
                default: "0"
            }
        ]).then(answers => {
            // Create the group.
            client.group.create({
                data: {
                    name: answers.name,
                    color: answers.color,
                    background_color: answers.background_color,
                    priority: parseInt(answers.priority)
                }
            }).then(group => {
                // Empty line.
                console.log("");

                // Log the group.
                console.log("Group created:");
                console.log(group);

                // Exit the script.
                process.exit();
            }).catch(error => {
                // Empty line.
                console.log("");

                // Log the error.
                console.log("Error creating group:");
                console.log(error);

                // Exit the script.
                process.exit();
            });
        });
    }
};