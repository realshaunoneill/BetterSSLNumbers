const utils = require('./../utils');
const fs = require('fs');

module.exports = function (app, config) {

    app.use(function (req, res, next) {
        req.session.redirect = req.path || '/';
        next();
    });

    app.get('/', (req, res) => {
        try {

            res.render('index', {
                loggedInStatus: req.isAuthenticated(),
                userRequest: req.user || false
            })

        }catch (err){
            console.error(err.stack)
            //renderErrorPage(req, res, err);
        }
    });

    app.get('/list', checkAuth, checkUserInSSL, (req, res) => {
        try {
            utils.getSavedNumbers().then(numberData => {
                res.render('list', {

                    loggedInStatus: req.isAuthenticated(),
                    userRequest: req.user || false,
                    numberData: numberData
                })
            }).catch(err => {console.error(`Unable to render saved numbers, Error: ${err.stack}`); renderErrorPage(req, res, err)});

        }catch (err){
            renderErrorPage(req, res, err);
        }
    });

    app.get('/submit', checkAuth, checkUserInSSL, (req, res) => {
       try {

           res.render('submit', {
               loggedInStatus: req.isAuthenticated(),
               userRequest: req.user || false,
               serverHost: config.host
           })

       } catch (err){
           renderErrorPage(req, res, err);
       }
    });

    app.get('/add', (req, res) => {
        res.redirect('https://discordapp.com/oauth2/authorize?client_id=318801505865957376&scope=bot&permissions=3072');
    });


    //404 Error page (Must be the last route!)
    app.use(function (req, res, next) {
        try {
            res.render('error', {
                loggedInStatus: req.isAuthenticated(),
                userRequest: req.user || false,
                error_code: 404,
                error_text: "The page you requested could not be found or rendered. Please check your request URL for spelling errors and try again. If you believe this error is faulty, please contact a system administrator.",
            })
        } catch (err) {
            console.error(`An error has occurred trying to load the 404 page, Error: ${err.stack}`);
            renderErrorPage(req, res, err);
        }
    })

};

function checkAuth(req, res, next) {
    try {

        if (req.isAuthenticated()) return next();

        req.session.redirect = req.path;
        res.status(403);
        res.render('badLogin', {

            loggedInStatus: req.isAuthenticated(),
            userRequest: req.user || false,
        });
    } catch (err) {
        console.error(`An error has occurred trying to check auth, Error: ${err.stack}`);
        renderErrorPage(req, res, err);
    }
}

function checkUserInSSL(req, res, next) {
    try {

        if (utils.isUserInSSL(req.user.id)) return next();

        req.session.redirect = req.path;
        res.status(403);
        res.render('invalidGuilds', {

            loggedInStatus: req.isAuthenticated(),
            userRequest: req.user || false,
        });

    } catch (err) {
        console.error(`An error has occurred trying to check if the user is in SSL, Error: ${err.stack}`);
        renderErrorPage(req, res, err);
    }
}

function renderErrorPage(req, res, err, errorText) {

    if (err) {
        console.error(`An error has occurred in Web.js, Error: ${err.stack}`);
        res.render('error', {
            loggedInStatus: req.isAuthenticated(),
            userRequest: req.user || false,
            error_code: 500,
            error_text: err
        })
    } else {
        res.render('error', {
            loggedInStatus: req.isAuthenticated(),
            userRequest: req.user || false,
            error_code: 500,
            error_text: errorText
        })
    }
}