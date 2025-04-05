import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mon_secret_jwt";

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}


