import { model, Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
};

const gamblingSchema = new Schema({
    guildID: reqString,
    userID: reqString,
    points: {
        type: Number,
        required: true
    }
});

export default model("points", gamblingSchema);
