export const StatusCodes = {
    // 200s
    // 200: Success
    200: {
        20000: "Your account has successfully been created.",
        20001: "You have successfully logged in.",
    },

    // 400s
    /// 400: Bad Request
    400: {
        40000: "The provided content body is not valid.",
        40001: "The provided content body's value types are not valid.",
        40002: "The provided ID was not a valid numerical value."
    },

    /// 401: Unauthorized
    401: {
        40100: "You are not authorized to perform this request.",
        40101: "The username or password combination is invalid."
    },

    /// 403: Forbidden
    403: {
        40300: "You do not have the permissions required to perform this request.",
        40301: "You do not have any of the permissions required to modify accounts.",
        40302: "The account you are trying to edit has a similar or higher priority group as yours.",
        40304: "You do not have the permissions required to ban this account from submitting records.",
    },

    /// 404: Not Found
    404: {
        40400: "The account you are trying to edit does not exist.",
    },

    // 409: Conflict
    409: {
        40900: "The username chosen is currently in use."
    },

    // 500s
    /// 500: Internal Server Error
    500: {
        50000: "The server has encountered an unexpected error, and is unable to recover this request.",
        50001: "The server has recieved an unexpected response from the database, and is unable to access the data requires to perform this request."
    },


}

export function createError<
    K extends keyof typeof StatusCodes,
    K2 extends keyof typeof StatusCodes[K]
>(status: K, code: K2, extra?: object) {
    let data: Record<string, any> = {
        status,
        code,
        message: StatusCodes[status][code],
        data: undefined
    };

    if (extra) {
        data.data = extra;
    }

    return data;
}

export function createResponse<
    K extends keyof typeof StatusCodes,
    K2 extends keyof typeof StatusCodes[K]
>(status: K, code: K2, extra?: object) {
    let data: Record<string, any> = {
        status,
        code,
        message: StatusCodes[status][code],
        data: undefined
    };

    if (extra) {
        data.data = extra;
    }

    return data;
}