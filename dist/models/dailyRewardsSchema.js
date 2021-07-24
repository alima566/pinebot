"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reqString = {
    type: String,
    required: true
};
const dailyRewardsSchema = new mongoose_1.Schema({
    guildID: reqString,
    userID: reqString
}, {
    timestamps: true
});
exports.default = mongoose_1.model("daily-rewards", dailyRewardsSchema);
