const fs = require("fs");
const inquirer = require("inquirer");

// Import all the scripts.
const scripts = [];

for (let file of fs.readdirSync(__dirname)) {
    if (file.endsWith(".js")) {
        if (file === "scriptHandler.js") {
            // Don't import this file.
            continue;
        }

        scripts.push(require(__dirname + "/" + file));
    }
}

// Ask the user which script they want to run.
inquirer.prompt([
    {
        type: "list",
        name: "script",
        message: "Which script do you want to run?",
        choices: scripts.map(script => script.name)
    }
]).then(answers => {
    // Find the script object.
    const script = scripts.find(script => script.name === answers.script);

    // Empty line.
    console.log("");

    // Run the script.
    script.execute();
});