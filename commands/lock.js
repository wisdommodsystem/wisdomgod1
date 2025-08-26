const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'lock',
    aliases: ['sed'],
    description: 'Lock the current channel with optional reason',
    async execute(message, args) {
        // Get the reason from arguments
        const reason = args.length > 0 ? args.join(' ') : 'No reason provided';
        // Check if bot has manage channels permission
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('❌ I don\'t have permission to manage channels!');
        }
        
        const channel = message.channel;
        
        try {
            // Get @everyone role
            const everyoneRole = message.guild.roles.everyone;
            
            // Check if channel is already locked
            const permissions = channel.permissionOverwrites.cache.get(everyoneRole.id);
            if (permissions && permissions.deny.has(PermissionFlagsBits.SendMessages)) {
                return message.reply('❌ This channel is already locked!');
            }
            
            // Lock the channel by denying send messages permission
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false
            }, {
                reason: `Channel locked by ${message.author.tag}: ${reason}`
            });
            
            const embed = new EmbedBuilder()
                .setTitle('🔒 Channel Locked')
                .setDescription(`**${channel.name}** has been locked.`)
                .addFields(
                    { name: '📺 Channel', value: channel.toString(), inline: true },
                    { name: '👮 Moderator', value: message.author.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setColor('#ff4757')
                .setFooter({ text: 'WisdomJebril V3 By APollo <3' })
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error locking channel:', error);
            message.reply('❌ An error occurred while trying to lock the channel.');
        }
    },
};