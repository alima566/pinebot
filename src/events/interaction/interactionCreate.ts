import Discord, { GuildMember, Interaction, MessageEmbed, Snowflake } from "discord.js";
import { Client } from "../../Client";
import { devs } from "../../config/config.json";
import { msToTime, missingPermissions, getCooldown, getGuildInfo } from "../../utils/utils";

export default async (client: Client, interaction: Interaction) => {
    try {
        const msgEmbed = new MessageEmbed();
        if (!interaction.isCommand() || !interaction.inGuild()) return;

        await getGuildInfo(client, interaction.guild!.id);

        const slash = client.slashCommands.get(interaction.commandName);

        if (!slash) return;

        if (slash.devOnly && !devs.includes(interaction.user.id)) return;

        //@ts-ignore
        if (slash.perms && !interaction.member.permissions.has(slash.perms)) {
            msgEmbed
                .setColor("RED")
                .setDescription(
                    `Woah there! Nice try, but you don't have the proper permissions to execute this command. You'll need one of the following permissions: ${missingPermissions(
                        interaction.member as GuildMember,
                        slash.perms
                    )}.`
                );
            return await interaction.reply({ embeds: [msgEmbed], ephemeral: true });
        }

        const cd = getCooldown(client, slash, interaction);
        let cooldowns;
        if (cd) {
            if (typeof slash.globalCooldown === "undefined" || slash.globalCooldown) {
                if (!client.globalCooldowns.has(slash.data.name)) {
                    client.globalCooldowns.set(
                        slash.data.name,
                        new Discord.Collection<Snowflake, number>()
                    );
                }
                cooldowns = client.globalCooldowns;
            } else {
                if (!client.serverCooldowns.has(interaction.guild!.id)) {
                    client.serverCooldowns.set(
                        interaction.guild!.id,
                        new Discord.Collection<Snowflake, Discord.Collection<Snowflake, number>>()
                    );
                }
                cooldowns = client.serverCooldowns.get(interaction.guild!.id);
                if (!cooldowns!.has(slash.data.name)) {
                    cooldowns!.set(slash.data.name, new Discord.Collection<Snowflake, number>());
                }
            }

            const now = Date.now();
            const timestamps = cooldowns!.get(slash.data.name)!;
            const cooldownAmount = cd * 1000;
            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
                if (now < expirationTime) {
                    msgEmbed
                        .setColor("RED")
                        .setDescription(
                            `Command on ${
                                slash.globalCooldown ? "global" : ""
                            } cooldown. Please wait \`${msToTime(
                                expirationTime - now
                            )}\` before using this command again.`
                        );
                    return await interaction.reply({
                        embeds: [msgEmbed],
                        ephemeral: true
                    });
                }
            }
        }
        return slash.execute({ client, interaction });
    } catch (e) {
        console.log(e);
    }
};
