const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lmohim',
    description: 'Display all important commands and their aliases',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ المهم - Important Commands')
            .setDescription('قائمة بجميع الأوامر المهمة والاختصارات الخاصة بها\nList of all important commands and their aliases')
            .addFields(
                {
                    name: '👤 Nickname Commands',
                    value: '`!nickname` | `!nick` | `!smiya`\nChange user nickname',
                    inline: false
                },
                {
                    name: '🔇 Mute Commands',
                    value: '`!mute` | `!skot` - Mute user\n`!unmute` | `!hder` - Unmute user\n`!muteall` | `!skto` - Mute all in VC\n`!unmuteall` | `!hdro` - Unmute all in VC',
                    inline: false
                },
                {
                    name: '🔨 Ban Commands',
                    value: '`!ban` | `!qawed` | `!QAWED` | `!tla7`\nBan user from server',
                    inline: false
                },
                {
                    name: '🔒 Channel Lock Commands',
                    value: '`!lock` | `!sed` - Lock channel\n`!unlock` | `!fte7` - Unlock channel',
                    inline: false
                },
                {
                    name: '🧹 Clear Commands',
                    value: '`!clear` | `!mse7`\nDelete multiple messages',
                    inline: false
                },
                {
                    name: '🎂 Birthday Commands',
                    value: '`!setupbirthdays` - Setup birthday system\n`!addbirthday` | `!birthday` | `!bd` - Add your birthday\n`!birthdays` | `!bdays` - View all birthdays\n`!removebirthday` - Remove your birthday',
                    inline: false
                },
                {
                    name: '🎵 Voice Check Commands',
                    value: '`!tsara` - Check if user is in voice channel\nUsage: `!tsara @user`',
                    inline: false
                },
                {
                    name: '📝 Usage Examples',
                    value: '`!smiya @user NewName`\n`!skot @user`\n`!qawed @user reason`\n`!sed`\n`!mse7 10`\n`!addbirthday 15/03`\n`!tsara @user`',
                    inline: false
                }
            )
            .setColor('#5865F2')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ 
                text: 'WisdomJebril V3 By APollo <3', 
                iconURL: message.client.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};