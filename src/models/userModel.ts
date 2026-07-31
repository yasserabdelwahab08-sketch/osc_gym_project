import { model, Schema, InferSchemaType } from "mongoose"

const userSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Member", "Trainer"],
        default: "Member"
    },
    date: {
        type: Date,
        default: Date.now,
        required: false

    }
}, { strict: false });
//ClassSession	Title, Trainer, Time Slot, Capacity
export type IUser = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);