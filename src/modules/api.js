const index = require('./../index');
const utils = require('./../utils');

const RateLimit = require("express-rate-limit");
const regex = new RegExp('^[0-9]+$');

exports.init = function (app) {

    app.use('/api/', new RateLimit({
        windowMs: 3600000,	// 150 requests/per hr
        max: 150,
        delayMs: 0
    }));

    app.get('/api/submit', (req, res) => {

        if (!req.isAuthenticated() || !utils.isUserInSSL(req.user.id)) {
            res.status(401).send('Session not authenticated or you are not in SSL with a verified account!');
            return;
        }

        try {

            let number = req.query.number;
            let comment = req.query.comment.substring(0, 1024);
            let countryCode = req.query.countryCode;
            let countryName = req.query.countryName;
            let type = req.query.type;
            let freePhone = req.query.free;

            if (!isNumberS(number)) return res.send('Please supply a valid number!');

            if (!comment) comment = 'No comment supplied';

            if (number, comment, countryCode, countryName, type, freePhone) {

                utils.isUserBanned(req.user.id).then(isBanned => {
                    if (isBanned) return res.status(401).send(`Sorry but you have been banned from posting numbers! Contact @XeliteXirish if you feel this was a mistake!`);

                    utils.submitNumber(req.user.username, req.user.id, number, comment, countryCode, countryName, type, freePhone).then((added) => {
                        if (added) {
                            res.status(200).send(`Successfully added number ${number} to the database!`);
                            utils.notifyNewNumber(req.user.username, countryCode, number, comment, type, countryName).catch(err => {
                                console.error(`Error notifying new number, Error: ${err.stack}`)
                            });
                        }
                        else res.status(400).send(`Either the number ${number} already exists or it is a legit phone number!`);

                    }).catch(err => {
                        console.error(`Unable to submit number ${number}, Error: ${err.stack}`);
                        res.status(400).send(`Unable to submit number ${number}, please try again later or contact @XeliteXirish!`);
                    });
                });
            } else {
                res.status(400).send('Please supply a number, scam type, if it was a free phone number and country name and county code!');
            }

        } catch (err) {
            console.error(`Unable to submit number, Error: ${err.stack}`);
            res.status(500).send('Unable to submit number, please try again later or contact @XeliteXirish!');
        }
    });

    app.get('/api/remove', (req, res) => {
        if (!req.isAuthenticated() || !utils.isUserInSSL(req.user.id)) {
            res.status(401).send('Session not authenticated or you are not in SSL with a verified account!');
            return;
        }

        utils.userHasPerms(req.user.id).then(isModerator => {
            if (!isModerator) return res.status(401).send(`Sorry but you do not have permission to preform this action!`);

            let number = req.query.number;
            if (!number) return res.send(`You need to supply a number to remove!`);

            utils.removeScammerNumber(req.user.id, number).then(deleted => {

                if (deleted) {
                    return res.status(200).send(`Deleted the number ${number} successfully!`);
                } else {
                    res.status(400).send(`Sorry but the number ${number} was unable to be deleted!`)
                }
            }).catch(err => {
                return res.status(500).send(`Unable to delete the number ${number}!, Error: ${err.stack}`);
            })
        }).catch(err => {
            return res.status(500).send(`Unable to delete the number ${number}!, Error: ${err.stack}`);
        });
    });

    app.get('/api/vote', (req, res) => {
        if (!req.isAuthenticated() || !utils.isUserInSSL(req.user.id)) {
            res.status(401).send('Session not authenticated or you are not in SSL with a verified account!');
            return;
        }

        let vote = req.query.vote.toLowerCase();
        let number = req.query.number;

        if (!vote || !number) {
            return res.send('Sorry you need to supply a vote and a number as parameters!')
        }
        if (vote !== 'up' && vote !== 'down') return res.send(`Please either vote up or down!`);

        if (vote === 'up') {
            utils.submitVote(req.user.id, number, 'up').then((voted) => {
                if (voted) {
                    res.status(200).send(`Successfully submitted your vote for the number ${number}!`);
                } else {
                    res.status(400).send(`Sorry but we were unable to submit your vote, maybe you have already voted?`);
                }
            }).catch(err => {
                return res.status(500).send(`Unable to submit a vote for the number ${number}!, Error: ${err.stack}`);
            })
        } else if (vote === 'down') {
            utils.submitVote(req.user.id, number, 'down').then((voted) => {
                if (voted) {
                    res.status(200).send(`Successfully submitted your vote for the number ${number}!`);
                } else {
                    res.status(400).send(`Sorry but we were unable to submit your vote, maybe you have already voted?`);
                }
            }).catch(err => {
                return res.status(500).send(`Unable to submit a vote for the number ${number}!, Error: ${err.stack}`);
            })
        }
    });
};

function isNumberS(number) {
    return regex.test(number);
}