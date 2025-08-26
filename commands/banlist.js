const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'banlist',
    description: 'Show all banned users in the server',
    async execute(message, args) {
        // Check if bot has ban permissions
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ I don\'t have permission to view bans!');
        }
        
        try {
            // Fetch all bans
            const bans = await message.guild.bans.fetch();
            
            if (bans.size === 0) {
                const embed = new EmbedBuilder()
                    .setTitle('📋 Ban List')
                    .setDescription('✅ No banned users found in this server!')
                    .setColor('#00ff00')
                    .setFooter({ text: 'WisdomJebril V3 By APollo <3' })
                    .setTimestamp();
                
                return message.reply({ embeds: [embed] });
            }
            
            // Create ban list (limit to 25 for embed field limits)
            const banList = bans.first(25).map((ban, index) => {
                const reason = ban.reason || 'No reason provided';
                return `${index + 1}. **${ban.user.tag}** (${ban.user.id})\n   📝 ${reason.length > 50 ? reason.substring(0, 50) + '...' : reason}`;
            }).join('\n\n');
            
            const embed = new EmbedBuilder()
                .setTitle(`🔨 Ban List (${bans.size} total)`)
                .setDescription(banList)
                .setColor('#ff4757')
                .setFooter({ text: 'WisdomJebril V3 By APollo <3' })
                .setTimestamp();
            
            if (bans.size > 25) {
                embed.addFields({
                    name: '📊 Note',
                    value: `Showing first 25 bans out of ${bans.size} total bans.`,
                    inline: false
                });
            }
            
            message.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error fetching ban list:', error);
            message.reply('❌ An error occurred while fetching the ban list.');
        }
    },
};