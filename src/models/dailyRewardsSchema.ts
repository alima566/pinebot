import { model, Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
};

const dailyRewardsSchema = new Schema(
    {
        guildID: reqString,
        userID: reqString
    },
    {
        timestamps: true
    }
);

export default model("daily-rewards", dailyRewardsSchema);
