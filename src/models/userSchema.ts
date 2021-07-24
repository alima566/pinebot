import { model, Schema } from "mongoose";
import colors from "../config/colors.json";

const userSchema = new Schema({
    _id: String,
    language: {
        default: "english",
        type: String
    },
    embedColor: {
        //@ts-ignore
        default: colors.DEFAULT,
        type: String
    }
});

export default model("userSchema", userSchema);
