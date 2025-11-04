import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "teacher", "admin"],
        default: "student",
    },
})

userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt)
    } catch (error) {
        next(error);
    }
})

userSchema.methods.comparePassword = async function (enterpassword) {
    return await bcrypt.compare(enterpassword, this.password);
}

export default mongoose.model('user', userSchema);