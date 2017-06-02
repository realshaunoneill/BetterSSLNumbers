const index = require('./../../index');
const utils = require('./../../utils');

exports.info = {
    name: 'blacklist',
    usage: 'blacklist [number]',
    description: 'Adds a number to the blacklist database!'
};

exports.run = function (bot, msg, args) {

    utils.userHasPerms(msg.author.id).then(isModerator => {
        if (!isModerator) return msg.reply('Sorry but you dont have permission to use this command!');

        if (args.length > 0) {
            let number = args[0];

            utils.addNumberToBlacklist(msg.author, number).then((added) => {
                if (added) {
                    msg.reply(`Successfully added ${number} to the blacklist!`).then(m => {
                        m.delete(10000)
                    })
                } else {
                    msg.reply(`That number has already been added to the blacklist!`).then(m => {
                        m.delete(10000)
                    })
                }
            }).catch(err => {
                msg.reply('Sorry but there appears to be an error submitting that number!').then(m => {
                    m.delete(10000)
                });
            })
        } else {
            msg.reply(`You must specify a number to blacklist using the format <blacklist number>`).then(m => {
                m.delete(10000)
            });
        }
    }).catch(err => {
        console.error(`Error while checking if a user has perms, Error: ${err.stack}`);
        msg.reply(`Unable to check if you have enough perms to do this, aborting!`);
    });
};