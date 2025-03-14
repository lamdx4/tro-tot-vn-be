import crypto from "crypto"

export const generateRandomNumber = (length: number) : String => {
    const characters = "0123436789";

    let result = "";

    for(let i = 0; i < length; i++) {
        result += characters.charAt(crypto.randomInt(0, characters.length));
    }
    return result;
};