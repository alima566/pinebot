"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const colors_json_1 = __importDefault(require("../config/colors.json"));
const userSchema = new mongoose_1.Schema({
    _id: String,
    language: {
        default: "english",
        type: String
    },
    embedColor: {
        //@ts-ignore
        default: colors_json_1.default.DEFAULT,
        type: String
    }
});
exports.default = mongoose_1.model("userSchema", userSchema);
