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

    createGuildConfigs();
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

function createGuildConfigs() {
    client.guilds.array().forEach(guild => {
        let checkQuery = `SELECT * FROM Config WHERE GuildId=${index.db.escape(guild.id)}`;
        index.db.query(checkQuery, function (err, rows, fields) {
            if (rows.length > 0) return;

            let query = `INSERT INTO Config (GuildName, GuildId, EnableNotification) VALUES (${index.db.escape(guild.name)}, ${index.db.escape(guild.id)}, 0);`;
            index.db.query(query, function (err, rows, fields) {
                if (err) {
                    console.error(`Error while creating guild config, Error: ${err.stack}`);
                    console.error(`Error Query: ${query}`);
                    return;
                }
                console.log(`Successfully created a config for ${guild.name}`);
            })
        })
    })
}