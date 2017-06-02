const index = require('./../../index');
const utils = require('./../../utils');

exports.info = {
    name: 'ban',
    usage: 'ban [Mention User]',
    description: 'Bans a user from posting anymore numbers!'
};

exports.run = function (bot, msg, args) {

    utils.userHasPerms(msg.author.id).then(isModerator => {
        if (!isModerator) return msg.reply('Sorry but you dont have permission to use this command!');

        if (msg.mentions.users.array().length > 0) {
            msg.mentions.users.array().forEach(user => {
                utils.banUser(msg.author.id, user.id).then((banned) => {
                    if (banned) {
                        msg.reply(`${user.tag} has successfully been banned!`).then(m => {
                            m.delete(10000)
                        })
                    } else {
                        msg.reply(`${user.tag} was unable to be banned, maybe they dont have an account yet?`).then(m => {
                            m.delete(10000)
                        })
                    }
                });
            })

        } else {
            msg.reply(`Sorry but you need to mention someone to ban them!`).then(m => {
                m.delete(10000)
            })
        }
    }).catch(err => {
        console.error(`Error while checking if a user has perms, Error: ${err.stack}`);
        msg.reply(`Unable to check if you have enough perms to do this, aborting!`);
    });
};