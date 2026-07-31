import { model, Schema, InferSchemaType } from "mongoose"

const bookingSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    session_reference: {
        type: String,
        required: true
    },
    member: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Booked", "Cancelled"],
        default: "Booked"
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { strict: false });
export type IBooking = InferSchemaType<typeof bookingSchema>;
export const Booking = model("Booking", bookingSchema);