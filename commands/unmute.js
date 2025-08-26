const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unmute',
    aliases: ['hder'],
    description: 'Unmute a user in voice channels',
    async execute(message, args) {
        // Check if bot has mute permissions
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return message.reply('❌ I don\'t have permission to unmute members!');
        }
        
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('❌ Please mention a user to unmute!');
        }
        
        try {
            const member = await message.guild.members.fetch(target.id);
            
            // Check if user is in a voice channel
            if (!member.voice.channel) {
                return message.reply('❌ This user is not in a voice channel!');
            }
            
            // Check if user is actually muted
            if (!member.voice.mute) {
                return message.reply('❌ This user is not muted!');
            }
            
            // Unmute the user
            await member.voice.setMute(false, `Unmuted by ${message.author.tag}`);
            
            const embed = new EmbedBuilder()
                .setTitle('🔊 User Unmuted')
                .setDescription(`**${target.tag}** has been unmuted in voice channels.`)
                .addFields(
                    { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: '👮 Moderator', value: message.author.tag, inline: true },
                    { name: '🎵 Voice Channel', value: member.voice.channel.name, inline: true }
                )
                .setColor('#00ff00')
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'WisdomJebril V3 By APollo <3' })
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error unmuting user:', error);
            if (error.code === 10007) {
                message.reply('❌ User not found in this server!');
            } else {
                message.reply('❌ An error occurred while trying to unmute the user.');
            }
        }
    },
};