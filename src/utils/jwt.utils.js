import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
    const payload = {
        id: user.id,
        role: user.role
    }
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m"
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d"
    })

    return { accessToken, refreshToken }
}

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);