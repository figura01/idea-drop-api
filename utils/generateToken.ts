import { SignJWT } from "jose";
import { JWT_SECRET } from "./getJwtSecret.js";

/**
 * Generates a JWT token for a given user ID.
 * @param {Object} payload - The ID of the user.
 * @param expiresIn - The expiration time of the token.
 * @returns A promise that resolves to the JWT token string.
 */

export const generateToken = async (payload: any, expiresIn = "15m") => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
};
