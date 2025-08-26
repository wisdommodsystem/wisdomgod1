const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    aliases: ['a', 'A', 'AV', 'av', 'Av', 'aV'],
    description: 'Shows user avatar',
    execute(message, args) {
        // Get target user (mentioned user or message author)
        const target = message.mentions.users.first() || message.author;
        
        const embed = new EmbedBuilder()
            .setTitle(`🖼️ ${target.username}'s Avatar`)
            .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor('#ff6b6b')
            .addFields(
                {
                    name: '🔗 Links',
                    value: `[PNG](${target.displayAvatarURL({ format: 'png', size: 1024 })}) | [JPG](${target.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [WEBP](${target.displayAvatarURL({ format: 'webp', size: 1024 })})${target.avatar && target.avatar.startsWith('a_') ? ` | [GIF](${target.displayAvatarURL({ format: 'gif', size: 1024 })})` : ''}`,
                    inline: false
                }
            )
            .setFooter({ text: 'WisdomJebril V3 By APollo <3' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};