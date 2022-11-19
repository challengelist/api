import chalk from "chalk";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import multer from "multer";
import cors from "cors";

import { AccountMiddleware } from "./src/middleware/AccountMiddleware";
import { RouterMiddleware } from "./src/middleware/RouterMiddleware";
import { PaginationMiddleware } from "./src/middleware/PaginationMiddleware";

// Add environment variables.
dotenv.config();

// Create a new express application instance.
const app = express();

// Add any actual middleware here.
app.use(cors());
app.use(express.json());
app.use(multer().any());
let latestResponse;
app.use(morgan((tokens, req, res) => {
    let method = tokens.method(req, res);

    switch (method) {
        case "GET":
            method = chalk.bgHex("#00ffaa").black(` ${method} `);
            break;
        case "POST":
            method = chalk.bgHex("#ffc800").black(` ${method} `);
            break;
        case "PUT":
            method = chalk.bgHex("#00aaff").black(` ${method} `);
            break;
        case "DELETE":
            method = chalk.bgHex("#ff0040").black(` ${method} `);
            break;
        case "PATCH":
            method = chalk.bgHex("#4000ff").black(` ${method} `);
            break;
    }

    const status = parseInt(tokens.status(req, res) ?? "500");
    let statusString = "";
    let statusHeader;

    if (status >= 200 && status < 400) {
        statusString = chalk.bgHex("#00ffaa").black(` ${status} `);
        statusHeader = chalk.hex("#00ffaa")(" SUCCESS");
    } else if (status >= 400 && status < 500) {
        statusString = chalk.bgHex("#ff0040").black(` ${status} `);
        statusHeader = chalk.hex("#ff0040")(" FAILURE");
    } else if (status >= 500 && status < 600) {
        statusString = chalk.bgHex("#4000ff").black(` ${status} `);
        statusHeader = chalk.hex("#4000ff")("   ERROR");
    }

    const url = tokens.url(req, res);
    statusString = statusString.padStart(Math.max(1, 15 - (url?.length ?? 0)), "E");

    let now = new Date();
    let format = new Intl.DateTimeFormat();

    return [`[${chalk.gray(format.format(now))}]`, statusHeader, method, tokens.url(req, res), statusString, "-", tokens["response-time"](req, res), "ms"].join(" ");
}));

// Our own middleware next.
app.use(AccountMiddleware.handle);
app.use(PaginationMiddleware.handle)

// Handle our own lower router-esque middleware.
RouterMiddleware.handle(app);


// Create a listener.
app.listen(process.env.CL_PORT, () => {
    let now = new Date();
    let format = new Intl.DateTimeFormat();
    console.log(`[${chalk.gray(format.format(now))}]  ${chalk.gray(`Challenge List API: `)}`)
    console.log(`[${chalk.gray(format.format(now))}]  Server started on port ${process.env.CL_PORT}!`);   
    console.log("");   
});