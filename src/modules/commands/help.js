const index = require('./../../index');
const utils = require('./../../utils');

exports.info = {
    name: 'help',
    usage: 'help [command]',
    description: 'Shows you help for all commands or just a single command'
};

const getHelp = function (bot, command) {
    return {
        name: `\`${command.info.name}\``,
        value: `Usage: \`${bot.config.prefix}${command.info.usage}\`\nDescription: ${command.info.description}`
    };
};

exports.run = function (bot, msg, args) {
    if (!args.length > 0) {
        const embed = utils.getSimpleEmbed("Help", "All available commands for BetterSSLNumbers", utils.getColour('red'));

        for (const cmd in bot.commands) {
            embed.addField(getHelp(bot, bot.commands[cmd]).name, getHelp(bot, bot.commands[cmd]).value);
        }

        msg.channel.send({embed});

    } else {
        let command = bot.commands[args[0]];
        if (!command) {
            msg.reply(`:no_entry_sign: The command '${args[0]}' does not exist!`).then(m => m.delete(2000));
        } else {
            msg.channel.sendEmbed(utils.getSimpleEmbed('Help: ' + args[0], 'BetterSSLNumbers help!', utils.getColour('red')).addField(getHelp(bot, args[0])));
        }
    }
};