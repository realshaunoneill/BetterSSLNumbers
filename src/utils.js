const index = require('./index');
const bot = require('./modules/bot');
const RichEmbed = require('discord.js').RichEmbed;

/**
 * Returns all saved numbers that are confirmed
 * @returns {Promise}
 */
exports.getSavedNumbers = function () {
    return new Promise((resolve, reject) => {

        let query = `SELECT * FROM SavedNumbers WHERE Removed=0 LIMIT ${index.config.hardLimit}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Unable to fetch saved numbers, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            let results = [];
            for (let x = 0; x < rows.length; x++) {
                rows[x].Date = exports.getDateString(rows[x].Date);
                results.push(rows[x])
            }

            resolve(results);
        })
    })
};

/**
 * Submits a scammer number to the database
 * @param username
 * @param userId
 * @param number
 * @param comment
 * @param countryCode
 * @param countryName
 * @param type
 * @returns {Promise}
 */
exports.submitNumber = function (username, userId, number, comment, countryCode, countryName, type) {
    return new Promise((resolve, reject) => {

        exports.checkIfExists(number).then(exists => {
            if (exists) return resolve(false);

            exports.checkIsLegitNumber(number).then(isLegit => {
                if (isLegit) return resolve(false);

                let query = `INSERT INTO SavedNumbers (SubmitAuthorName, SubmitAuthorId, Date, Number, Comment, Country, CountryCode, ScamType) VALUES (${index.db.escape(username)}, ${userId}, ${index.db.escape(new Date())}, ${index.db.escape(number)}, ${index.db.escape(comment)}, ${index.db.escape(countryName)}, ${index.db.escape(countryCode)}, ${index.db.escape(type)});`;
                index.db.query(query, function (err, rows, fields) {
                    if (err) {
                        console.error(`Error submitting number, Error: ${err.stack}`);
                        console.error(`Error Query: ${query}`);
                        return reject(err);
                    }

                    resolve(true);
                })
            }).catch(err => {
                reject(err)
            });
        }).catch(err => {
            reject(err)
        });
    });
};

/**
 * Submits a new user to the database
 * @param userReq
 * @returns {Promise}
 */
exports.submitUsersToDb = function (userReq) {
    return new Promise((resolve, reject) => {

        // Insets new users only
        let checkQuery = `SELECT * FROM Users WHERE UserId=${index.db.escape(userReq.id)}`;
        index.db.query(checkQuery, function (err, rows, fields) {
            if (err) {
                console.error(`Error Query: ${checkQuery}`);
                return reject(err);
            }
            if (rows.length > 0) return resolve();

            let query = `INSERT INTO Users (Username, UserId, Email) VALUES (${index.db.escape(userReq.username)}, ${index.db.escape(userReq.id)}, ${index.db.escape(userReq.email)});`;
            index.db.query(query, function (err, rows, fields) {
                if (err) {
                    console.error(`Error submitting number, Error: ${err.stack}`);
                    console.error(`Error Query: ${query}`);
                    return reject(err);
                }

                resolve();
            })
        });
    });
};

/**
 * Checks to see if a number is in the legit number list
 * @param number
 * @returns {Promise} True if the number is legit
 */
exports.checkIsLegitNumber = function (number) {
    return new Promise((resolve, reject) => {

        let query = `SELECT * FROM NumberBlacklist WHERE Number=${index.db.escape(number)}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Unable to check legit number number, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            resolve(rows.length > 0);
        })
    });
};

/**
 * Check if a number is already in the database
 * @param number
 * @returns {Promise}
 */
exports.checkIfExists = function (number) {
    return new Promise((resolve, reject) => {

        let query = `SELECT * FROM SavedNumbers WHERE Number=${index.db.escape(number)}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Unable to check legit number number, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            resolve(rows.length > 0);
        })
    });
};

/**
 * Creates the numbers list table if needed
 * @returns {Promise}
 */
exports.createNumbersTable = function () {
    return new Promise((resolve, reject) => {

        let query = `CREATE TABLE IF NOT EXISTS ${index.config.sql_db}.SavedNumbers
(
    ID INT PRIMARY KEY AUTO_INCREMENT,
    SubmitAuthorName TEXT,
    SubmitAuthorId VARCHAR(30),
    Date DATETIME,
    Number VARCHAR(30),
    Comment TEXT,
    Country TEXT,
    CountryCode TEXT,
    ScamType TEXT,
    WorkingCount VARCHAR(10) DEFAULT 0,
    NotWorkingCount VARCHAR(10) DEFAULT 0,
    Removed TINYINT(1) DEFAULT 0,
    RemovedBy VARCHAR(30)
);`;

        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Error trying to create database, Error ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }
            resolve();
        })
    });
};

/**
 * Creates the users table if needed
 * @returns {Promise}
 */
exports.createUserTable = function () {
    return new Promise((resolve, reject) => {

        let query = `CREATE TABLE IF NOT EXISTS ${index.config.sql_db}.Users
(
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Username TEXT,
    UserId VARCHAR(30),
    Email TEXT
);`;

        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Error trying to create database, Error ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }
            resolve();
        })
    });
};

/**
 * Creates the table used to blacklist specific numbers
 * @returns {Promise}
 */
exports.createBlacklistTable = function () {
    return new Promise((resolve, reject) => {

        let query = `CREATE TABLE IF NOT EXISTS ${index.config.sql_db}.NumberBlacklist
(
    ID INT PRIMARY KEY AUTO_INCREMENT,
    SubmitterUsername TEXT,
    SubmitterId VARCHAR(30),
    Number TEXT
);`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Unable to create blacklist table, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            resolve();
        })
    });
};

exports.createConfigTable = function () {
    return new Promise((resolve, reject) => {
        let query = `CREATE TABLE IF NOT EXISTS ${index.config.sql_db}.Config
(
    ID INT PRIMARY KEY AUTO_INCREMENT,
    GuildName TEXT,
    GuildId VARCHAR(30),
    NotificationChannelId VARCHAR(30),
    EnableNotification TINYINT(1)
);`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Unable to create config table, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            resolve();
        })
    });
};

/**
 * Returns the phone code for a specific country
 * @returns string country code
 * @param countryCode
 */
exports.fetchCountry = function (countryCode) {
    if (countryCode === '353') return 'Ireland'
};

/**
 * Converts a date into a nice format
 * @param date
 * @returns {string}
 */
exports.getDateString = function (date) {
    return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
};

/**
 * Returns true if the user is in SSL
 * @param userId
 * @returns {boolean}
 */
exports.isUserInSSL = function (userId) {

    let sslGuild = bot.client.guilds.get('194533269180514305');
    if (!sslGuild) return false;
    return sslGuild.members.exists('id', userId);
};

/**
 * Adds a specific number to the blacklist
 * @param submitterUser
 * @param number
 * @returns {Promise}
 */
exports.addNumberToBlacklist = function (submitterUser, number) {
    return new Promise((resolve, reject) => {

        let checkQuery = `SELECT * FROM NumberBlacklist WHERE Number=${index.db.escape(number)}`;
        index.db.query(checkQuery, function (err, rows, fields) {
            if (err) reject(err);
            if (rows.length > 0) return resolve(false);

            let query = `INSERT INTO NumberBlacklist (SubmitterUsername, SubmitterId, Number) VALUES (${index.db.escape(submitterUser.tag)}, ${index.db.escape(submitterUser.id)}, ${index.db.escape(number)});`;
            index.db.query(query, function (err, rows, fields) {
                if (err) {
                    console.error(`Unable to add number to blacklist, Error: ${err.stack}`);
                    console.error(`Error Query: ${query}`);
                    return reject(err);
                }

                resolve(true);
            })
        });
    })
};

exports.removeScammerNumber = function (deleteUser, number) {
    return new Promise((resolve, reject) => {

        let query = `UPDATE SavedNumbers SET Removed=1, RemovedBy=${index.db.escape(deleteUser.id)} WHERE Number=${index.db.escape(numberID)}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Unable to remove number, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            resolve(true);
        })
    });
};

/**
 * Returns a simple embed
 * @param title
 * @param text
 * @param colour
 * @param isBad (displays a warning picture)
 * @returns {RichEmbed}
 */
exports.getSimpleEmbed = function (title, text, colour, isBad = false) {
    let embedMsg = new RichEmbed()
        .setTitle(title)
        .setAuthor("Better SSL Numbers", bot.client.user.avatarURL)
        .setColor(colour || exports.getRandomColor())
        .setURL(index.config.host)
        .setDescription(text);
    if (isBad) embedMsg.setThumbnail("http://www.shaunoneill.com/assets/genericError.png");

    return embedMsg;
};

/**
 * Returns the hex code for common colours
 * @param colourCode
 * @returns {*}
 */
exports.getColour = function (colourCode) {
    if (colourCode.toLowerCase() === 'red') {
        return 0xCC0E0E;
    }
    else if (colourCode.toLowerCase() === 'blue') {
        return 0x0988B3;
    }
    else if (colourCode.toLowerCase() === 'green') {
        return 0x14E01D;
    }
    else if (colourCode.toLowerCase() === 'orange') {
        return 0xFF8C00;
    }
    else if (colourCode.toLowerCase() === 'yellow') {
        return 0xFFFF00;
    } else {
        return exports.getRandomColor();
    }
};

exports.fetchNotificationChannel = function (guild) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM Config WHERE GuildId=${guild.id}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Error fetching notification channel, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            if (rows.length > 0) {
                if (rows[0].EnableNotification === 1) {
                    resolve(rows[0].NotificationChannelId);
                } else {
                    resolve(null);
                }

            } else resolve(null);
        })
    })
};

exports.notifyNewNumber = function (submitterUsername, number, comment, type) {
    return new Promise((resolve, reject) => {

        let guilds = index.bot.client.guilds.array();
        guilds.forEach(guild => {
            exports.fetchNotificationChannel(guild).then(channelId => {

                if (channelId) {
                    let channel = guild.channels.get(channelId);
                    if (channel) {

                        let embed = exports.getSimpleEmbed('Scammer Number!', 'A new scammer number has been submitted!', exports.getColour('blue'));
                        embed.addField('Number', number, true);
                        embed.addField('Category', type);
                        embed.addField('Comment', comment.substring(0, 1024));
                        embed.setFooter(`- Submitted by ${submitterUsername}`);

                        channel.send({embed}).catch(err => {
                            console.error(`Unable to post number in channel ${channel.name}`);
                            reject(err)
                        });
                    }
                }
            })
        })
    })
};

exports.userHasPerms = function (userId) {
    return index.config.moderatorList.indexOf(userId) > -1;
};