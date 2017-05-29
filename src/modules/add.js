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
            let comment = req.query.comment;
            let countryCode = req.query.countryCode;
            let countryName = req.query.countryName;
            let type = req.query.type;

            if (!isNumberS(number)) return res.send('Please supply a valid number!');

            if (!comment) comment = 'No comment supplied';

            if (number, comment, countryCode, countryName, type) {

                utils.submitNumber(req.user.username, req.user.id, number, comment, countryCode, countryName, type).then((added) => {
                    if (added) res.status(200).send('Successfully added number to the database!');
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
};

function isNumberS(number) {
    return regex.test(number);
}