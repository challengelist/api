import fs from "fs";
import path from "path";

/**
 * A singleton containing everything that needs to be globally accessible.
 */
export const GlobalSingleton = new class GlobalSingleton {
    public rsaKey: Buffer | null = null;
    public rsaPublicKey: Buffer | null = null;
    public jwtToken: string;
    
    constructor() {
        if (process.env.CL_USE_RSA256_JWT == "true") {
            this.rsaKey = fs.readFileSync(path.join(__dirname, "../../", `data/${process.env.CL_RSA256_FILE!}`));
            this.rsaPublicKey = fs.readFileSync(path.join(__dirname, "../../", `data/${process.env.CL_RSA256_PUBLIC_FILE!}`))
        }
        
        this.jwtToken = process.env.CL_JWT_SECRET!;
    }
}