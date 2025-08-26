const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warningsFile = path.join(__dirname, '..', 'data', 'warnings.json');

// Load warnings from file
function loadWarnings() {
    try {
        if (fs.existsSync(warningsFile)) {
            return JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading warnings:', error);
    }
    return {};
}

// Save warnings to file
function saveWarnings(warnings) {
    try {
        fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
    } catch (error) {
        console.error('Error saving warnings:', error);
    }
}

module.exports = {
    name: 'removewarn',
    description: 'Remove warnings from a user',
    execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('❌ Please mention a user to remove warnings from!');
        }
        
        const count = parseInt(args[1]) || 1;
        if (count < 1) {
            return message.reply('❌ Please provide a valid number of warnings to remove!');
        }
        
        const warnings = loadWarnings();
        const guildId = message.guild.id;
        const userId = target.id;
        
        if (!warnings[guildId]?.[userId] || warnings[guildId][userId].length === 0) {
            return message.reply('❌ This user has no warnings to remove!');
        }
        
        const userWarnings = warnings[guildId][userId];
        const originalCount = userWarnings.length;
        const removeCount = Math.min(count, originalCount);
        
        // Remove the specified number of warnings (from the end)
        warnings[guildId][userId] = userWarnings.slice(0, -removeCount);
        
        // Clean up empty arrays
        if (warnings[guildId][userId].length === 0) {
            delete warnings[guildId][userId];
        }
        
        saveWarnings(warnings);
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Warnings Removed')
            .setDescription(`Removed **${removeCount}** warning(s) from **${target.tag}**`)
            .addFields(
                { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
                { name: '👮 Moderator', value: message.author.tag, inline: true },
                { name: '📊 Warnings', value: `${originalCount - removeCount}/${originalCount} remaining`, inline: true }
            )
            .setColor('#00ff00')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'WisdomJebril V3 By APollo <3' })
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    },
};