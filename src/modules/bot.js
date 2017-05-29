const Discord = require('discord.js');
const fs = require('fs');

const index = require('./../index');
const client = exports.client = new Discord.Client();

const config = exports.config = client.config = index.config;
const commands = exports.commands = client.commands = {};

client.on('ready', () => {

    console.log(`SSl Scammer Numbers bot has successfully connected to discord!`);
    console.log(`The bot is in the following servers: ${client.guilds.array()}`);

    client.user.setGame(index.config.host);

    loadCommands();
});

client.on('message', msg => {
    const args = msg.content.split(' ').splice(2);
    let command = msg.content.split(' ')[1];

    if (msg.content.startsWith(config.prefix) && commands[command]) {
        try {
            commands[command].run(client, msg, args);
        } catch (err) {
            console.error(`Error while executing command, Error: ${err.stack}`);
        }
    }
});

exports.connect = function () {
    client.login(index.config.botToken);
};

function loadCommands() {
    fs.readdirSync(__dirname + '/commands/').forEach(file => {
        if (file.startsWith('_') || !file.endsWith('.js')) return;

        let command = require(`./commands/${file}`);
        if (typeof command.run !== 'function' || typeof command.info !== 'object' || typeof command.info.name !== 'string') {
            console.error(`Invalid command file: ${file}`);
            return;
        }
        commands[command.info.name] = command;
    });
}