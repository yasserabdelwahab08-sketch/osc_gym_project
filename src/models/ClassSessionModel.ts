import { model, Schema, InferSchemaType } from "mongoose"

const classSessionSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    trainer: {
        type: String,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { strict: false });

export type IClassSession = InferSchemaType<typeof classSessionSchema>;
export const ClassSession = model("ClassSession", classSessionSchema);
