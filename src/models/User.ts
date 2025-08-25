// models/User.ts
import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // only for credential login
    image?: string;
}

const UserSchema = new Schema<IUser>({
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    image: { type: String },
});

export default models.User || mongoose.model<IUser>("User", UserSchema);
