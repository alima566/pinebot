import { setPoints } from "../../utils/gambling";
import { Command } from "../../interfaces/Command";
import { formatNumber, removeCommas, isValidNumber, getGuildInfo } from "../../utils/utils";

export default {
    name: "setpoints",
    aliases: ["set"],
    category: "Gambling",
    perms: ["MANAGE_GUILD"],
    clientPerms: ["SEND_MESSAGES"],
    async execute({ client, message, args }) {
        const guildInfo = await getGuildInfo(client, message.guild!.id);
        const { gamblingChannel } = guildInfo.gambling;
        if (!gamblingChannel) {
            return message.reply({
                content:
                    "Can't set pina coladas to members as no gambling channel has been set yet."
            });
        }

        const mention = args[0].toLowerCase() == "all" ? "all" : message.mentions.members!.first();
        if (!mention) {
            return message.reply({
                content: "Please tag a member or type `all` to set pina coladas to."
            });
        }

        if (!args[1]) {
            return message.reply({ content: "Please provide a valid number of pina coladas." });
        }

        if (!isValidNumber(args[1].trim())) {
            return message.reply({ content: "Please provide a valid number of pina coladas." });
        }

        const points = removeCommas(args[1].trim());
        if (isNaN(+points) || !Number.isInteger(+points)) {
            return message.reply({ content: "Please provide a valid number of pina coladas." });
        }

        if (+points < 0) {
            return message.reply({
                content: "Please enter a positive number greater than 0."
            });
        }

        if (mention == "all") {
            const members = await message.guild!.members.fetch();
            members.forEach(async (mem) => {
                if (!mem.user.bot) {
                    await setPoints(message.guild!.id, mem.id, +points);
                }
            });

            const memberCount = members.filter((mem) => !mem.user.bot).size;
            return message.channel.send({
                content: `You have set **${memberCount}** member${
                    memberCount != 1 ? "s" : ""
                } pina coladas to \`${formatNumber(+points)}\`.`
            });
        }

        if (mention.user.bot) {
            return message.reply({ content: "You can not set bot's pina coladas." });
        }

        const newPoints = await setPoints(message.guild!.id, mention.id, +points);
        return message.channel.send({
            content: `Pina colada's have been set to \`${formatNumber(newPoints)}\` for **${
                mention.user.tag
            }**.`
        });
    }
} as Command;
