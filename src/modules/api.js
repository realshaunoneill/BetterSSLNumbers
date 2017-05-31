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

            if (!isNumberS(number)) return res.send('Please supply a valid number!');

            if (!comment) comment = 'No comment supplied';

            if (number, comment, countryCode, countryName, type) {

                utils.submitNumber(req.user.username, req.user.id, number, comment, countryCode, countryName, type).then((added) => {
                    if (added) {
                        res.status(200).send('Successfully added number to the database!');
                        utils.notifyNewNumber(req.user.username, countryCode, number, comment, type, countryName);
                    }
                    else res.send('Either the number already exists or it is a legit phone number!');

                }).catch(err => {
                    console.error(`Unable to submit number, Error: ${err.stack}`);
                    res.status(505).send('Unable to submit number, please try again later or contact @XeliteXirish!');
                });
            } else {
                res.send('Please supply a number, scam type, country name and county code!');
            }

        } catch (err) {
            console.error(`Unable to submit number, Error: ${err.stack}`);
            res.status(505).send('Unable to submit number, please try again later or contact @XeliteXirish!');
        }
    });

    app.get('/api/remove', (req, res) => {
        if (!req.isAuthenticated() || !utils.isUserInSSL(req.user.id)) {
            res.status(401).send('Session not authenticated or you are not in SSL with a verified account!');
            return;
        }

        if (!utils.userHasPerms(req.user.id)) return res.status(401).send(`Sorry but you do not have permission to preform this action!`);

        let number = req.query.number;
        if (!number) return res.send(`You need to supply a number to remove!`);

        utils.removeScammerNumber(req.user.id, number).then(deleted => {
            return res.status(200).send(`Deleted the number successfully!`);
        }).catch(err => {
            return res.status(500).send(`Unable to delete that number!`);
        })
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
                    res.status(200).send(`Successfully submitted your vote for that number!`);
                } else {
                    res.send(`Sorry but we were unable to submit your vote, maybe you have already voted?`);
                }
            }).catch(err => {
                return res.status(500).send(`Unable to submit a vote for that number!`);
            })
        } else if (vote === 'down') {
            utils.submitVote(req.user.id, number, 'down').then((voted) => {
                if (voted) {
                    res.status(200).send(`Successfully submitted your vote for that number!`);
                } else {
                    res.send(`Sorry but we were unable to submit your vote, maybe you have already voted?`);
                }
            }).catch(err => {
                return res.status(500).send(`Unable to submit a vote for that number!`);
            })
        }
    });
};

function isNumberS(number) {
    return regex.test(number);
}