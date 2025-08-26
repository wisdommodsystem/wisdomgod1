const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unlock',
    aliases: ['fte7'],
    description: 'Unlock the current channel',
    async execute(message, args) {
        // Check if bot has manage channels permission
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ I don\'t have permission to manage channels!');
        }
        
        const channel = message.channel;
        
        try {
            // Get @everyone role
            const everyoneRole = message.guild.roles.everyone;
            
            // Check if channel is actually locked
            const permissions = channel.permissionOverwrites.cache.get(everyoneRole.id);
            if (!permissions || !permissions.deny.has(PermissionFlagsBits.SendMessages)) {
                return message.reply('❌ This channel is not locked!');
            }
            
            // Unlock the channel by removing the send messages denial
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: null
            }, {
                reason: `Channel unlocked by ${message.author.tag}`
            });
            
            const embed = new EmbedBuilder()
                .setTitle('🔓 Channel Unlocked')
                .setDescription(`**${channel.name}** has been unlocked.`)
                .addFields(
                    { name: '📺 Channel', value: channel.toString(), inline: true },
                    { name: '👮 Moderator', value: message.author.tag, inline: true }
                )
                .setColor('#00ff00')
                .setFooter({ text: 'WisdomJebril V3 By APollo <3' })
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error unlocking channel:', error);
            message.reply('❌ An error occurred while trying to unlock the channel.');
        }
    },
};