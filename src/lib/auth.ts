import jwt from "jsonwebtoken";

const SECRET = "mon_secret_jwt"; // À mettre dans .env

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}
