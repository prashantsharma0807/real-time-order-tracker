import { verifyAccessToken } from '../utils/jwt.utils.js';
import { redis } from '../config/redis.config.js'

export const authenticate = async (req, res, next) => {

    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Token not found" });
    const token = header.split(" ")[1];
    try {
        const isBlacklisted = await redis.get(`blacklist:${token}`)
        if (isBlacklisted) return res.status(401).json({ message: "Token revoked" });
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

export const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    }
}
