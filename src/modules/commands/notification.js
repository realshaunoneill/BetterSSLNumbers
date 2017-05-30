const index = require('./../../index');
const utils = require('./../../utils');

exports.info = {
    name: 'notification',
    usage: 'notification [Channel ID] | [Channel Mention] | disable',
    description: 'Sets the notification channel for new scammer numbers'
};

exports.run = function (bot, msg, args) {

    if (!msg.member.hasPermission('MANAGE_GUILD')) return msg.reply('Sorry but you dont have permission to use this command, you need the **MANAGE_GUILD** permission!');

    if (args[0].toLowerCase() === 'disable') {
        let query = `UPDATE Config SET EnableNotification=0 WHERE GuildId=${index.db.escape(msg.guild.id)}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Unable to set notification channel, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return msg.reply(`Unable to set channel ID`);
            }
            msg.reply(`Successfully disabled scammer number notifications!`)
        });
        return;
    } else if (args[0].toLowerCase() === 'enable') {
        let query = `UPDATE Config SET EnableNotification=1 WHERE GuildId=${index.db.escape(msg.guild.id)}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Unable to set notification channel, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return msg.reply(`Unable to set channel ID`);
            }
            msg.reply(`Successfully enabled scammer number notifications!`)
        });
        return;
    }

    let channelId;
    if (msg.mentions.channels.array().length > 0) {
        channelId = msg.mentions.channels.first().id;

        let query = `UPDATE Config SET NotificationChannelId=${index.db.escape(channelId)}, EnableNotification=1 WHERE GuildId=${index.db.escape(msg.guild.id)}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Unable to set notification channel, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return msg.reply(`Unable to set channel ID`);
            }

            msg.reply(`Successfully changed the notification ID to **${channelId}**`);
        })
    } else {
        if (args.length > 0) {
            let channelId = args[0];

            let query = `UPDATE Config SET NotificationChannelId=${index.db.escape(channelId)}, EnableNotification=1 WHERE GuildId=${index.db.escape(msg.guild.id)}`;
            index.db.query(query, function (err, rows, fields) {
                if (err) {
                    console.error(`Unable to set notification channel, Error: ${err.stack}`);
                    console.error(`Error Query: ${query}`);
                    return msg.reply(`Unable to set channel ID`);
                }

                msg.reply(`Successfully changed the notification ID to **${channelId}**`);
            })
        } else {
            msg.reply(`You must specify a channel to set as the notification channel, Format: <notification channelId>`).then(m => {
                m.delete(10000)
            });
        }
    }
};