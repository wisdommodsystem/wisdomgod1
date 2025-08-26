const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Simple JSON-based reject system
const rejectsFile = path.join(__dirname, '..', 'data', 'rejects.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load rejects from file
function loadRejects() {
    try {
        if (fs.existsSync(rejectsFile)) {
            return JSON.parse(fs.readFileSync(rejectsFile, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading rejects:', error);
    }
    return {};
}

// Save rejects to file
function saveRejects(rejects) {
    try {
        fs.writeFileSync(rejectsFile, JSON.stringify(rejects, null, 2));
    } catch (error) {
        console.error('Error saving rejects:', error);
    }
}

module.exports = {
    name: 'reject',
    description: 'Reject a user and log it to the reject channel',
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('❌ Please mention a user to reject!');
        }
        
        const channelId = process.env.reject_channel_id;
        if (!channelId) {
            return message.reply('❌ Reject channel ID is not configured in environment variables!');
        }
        
        try {
            const rejectChannel = await message.client.channels.fetch(channelId);
            if (!rejectChannel) {
                return message.reply('❌ Reject channel not found!');
            }
            
            // Load current rejects
            const rejects = loadRejects();
            const guildId = message.guild.id;
            const userId = target.id;
            
            // Initialize guild rejects if they don't exist
            if (!rejects[guildId]) rejects[guildId] = {};
            
            // Get target member
            const targetMember = message.guild.members.cache.get(userId);
            if (!targetMember) {
                return message.reply('❌ User is not in this server!');
            }

            // Add reject entry with original channel info
            rejects[guildId][userId] = {
                username: target.tag,
                rejectedBy: message.author.tag,
                rejectedAt: new Date().toISOString(),
                reason: args.slice(1).join(' ') || 'No reason provided',
                originalChannelId: message.channel.id,
                originalChannelName: message.channel.name
            };
            
            // Save rejects
            saveRejects(rejects);
            
            // Send to reject channel
            const rejectEmbed = new EmbedBuilder()
                .setTitle('❌ User Rejected')
                .setDescription(`**${target.tag}** has been rejected.`)
                .addFields(
                    { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: '👮 Rejected by', value: message.author.tag, inline: true },
                    { name: '📝 Reason', value: rejects[guildId][userId].reason, inline: false },
                    { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setColor('#ff4757')
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'WisdomJebril V3 By APollo <3' })
                .setTimestamp();
            
            await rejectChannel.send({ embeds: [rejectEmbed] });
            
            // Move user to reject channel
            try {
                // Remove user from current voice channel if they're in one
                if (targetMember.voice.channel) {
                    await targetMember.voice.disconnect('User rejected');
                }
                
                // Deny access to the original channel
                await message.channel.permissionOverwrites.create(targetMember, {
                    ViewChannel: false,
                    SendMessages: false,
                    Connect: false
                }, {
                    reason: `User rejected by ${message.author.tag}`
                });
                
                // Allow access to reject channel
                await rejectChannel.permissionOverwrites.create(targetMember, {
                    ViewChannel: true,
                    SendMessages: true,
                    Connect: true
                }, {
                    reason: `User rejected - moved to reject channel`
                });
                
                // Move user to reject channel if it's a voice channel
                if (rejectChannel.type === 2) { // Voice channel
                    try {
                        await targetMember.voice.setChannel(rejectChannel, 'User rejected - moved to reject channel');
                    } catch (voiceError) {
                        console.error('Error moving user to voice channel:', voiceError);
                    }
                }
                
                // Send notification to user in reject channel
                const userNotification = new EmbedBuilder()
                    .setTitle('🚫 You have been rejected')
                    .setDescription(`You have been rejected from **#${message.channel.name}** and moved here.`)
                    .addFields(
                        { name: '📝 Reason', value: rejects[guildId][userId].reason, inline: false },
                        { name: '👮 Rejected by', value: message.author.tag, inline: true },
                        { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: '🔄 To return', value: `A moderator must use \`!unreject @${target.tag}\` in **#${message.channel.name}**`, inline: false }
                    )
                    .setColor('#ff4757')
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();
                
                await rejectChannel.send({ content: `${target}`, embeds: [userNotification] });
                
                // Send DM to user with instructions
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🚫 You have been rejected')
                        .setDescription(`You have been rejected from **#${message.channel.name}** in **${message.guild.name}**.`)
                        .addFields(
                            { name: '📝 Reason', value: rejects[guildId][userId].reason, inline: false },
                            { name: '👮 Rejected by', value: message.author.tag, inline: true },
                            { name: '📺 Go to', value: `Please go to **#${rejectChannel.name}** channel`, inline: false },
                            { name: '🔄 To return', value: `A moderator must use \`!unreject @${target.tag}\` in **#${message.channel.name}**`, inline: false }
                        )
                        .setColor('#ff4757')
                        .setThumbnail(message.guild.iconURL({ dynamic: true }))
                        .setTimestamp();
                    
                    await target.send({ embeds: [dmEmbed] });
                } catch (dmError) {
                    console.log('Could not send DM to rejected user:', dmError.message);
                }
                
            } catch (permError) {
                console.error('Error setting channel permissions:', permError);
                message.reply('⚠️ User rejected but there was an issue with channel permissions.');
            }
            
            // Confirmation message
            const confirmEmbed = new EmbedBuilder()
                .setTitle('✅ User Rejected')
                .setDescription(`**${target.tag}** has been rejected and logged.`)
                .addFields(
                    { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: '👮 Moderator', value: message.author.tag, inline: true }
                )
                .setColor('#ff4757')
                .setFooter({ text: 'WisdomJebril V3 By APollo <3' })
                .setTimestamp();
            
            message.reply({ embeds: [confirmEmbed] });
            
        } catch (error) {
            console.error('Error rejecting user:', error);
            message.reply('❌ An error occurred while rejecting the user.');
        }
    },
};