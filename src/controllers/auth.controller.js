import User from '../model/user.model.js'
import { generateTokens, verifyRefreshToken } from '../utils/jwt.utils.js'
import { redis } from '../config/redis.config.js'
import { publishEvent } from '../workers/email.produser.js'

export const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        // const user = new User({ name, email, password, role });
        // await user.save(); 
        const user = await User.create({ name, email, password, role })
        const userObj = user.toObject();
        delete userObj.password;

        await publishEvent("user.created", {
            email,
            subject: "Welcome to SIS!",
            body: `Hello ${name}, your account has been created successfully!`,
        });

        res.status(201).json({ message: "User registered successfully", user: userObj });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message || error });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
        const isMatch = await user.comparePassword(password)
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        await sendTokenResponse(res, user)
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message || error });
    }
}

export const refresh = async (req, res) => {
    const oldToken = req.cookies?.refreshToken || req.body.refreshToken
    if (!oldToken) return res.status(400).json({ message: "Refresh token not found" });
    try {
        const payload = verifyRefreshToken(oldToken)
        const stored = await redis.get(`refresh:${payload.id}`)
        if (stored !== oldToken) return res.status(403).json({ message: 'Invalid refresh token' })
        await sendTokenResponse(res, payload)
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message || error });
    }
}

export const logout = async (req, res) => {
    const headers = req.headers.authorization;
    const accessToken = headers?.split(' ')[1];
    const { id } = req.body
    if (accessToken) {
        await redis.set(`blacklist:${accessToken}`, true, 'EX', 15 * 60)
    }
    await redis.del(`refresh:${id}`)
    res.json({ message: "Logged out successfully" });
}

export const profile = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id, { password: 0 })
        res.status(200).json({ user })
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message || error });
    }
}

export const allProfiles = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users)
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message || error });
    }
}


const sendTokenResponse = async (res, payload) => {
    const { accessToken, refreshToken } = generateTokens(payload)

    await redis.set(`refresh:${payload.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60)

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
        accessToken,
    })
}
