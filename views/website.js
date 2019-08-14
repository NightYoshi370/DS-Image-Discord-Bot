const config = require("../config.js");
const List = require("list-array");

const morgan = require('morgan');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const routes = require('./routes.js');
const http = require('http');
const { Strategy } = require("passport-discord");

module.exports = (client) => {
    let website = {};
    website.URL = config.url;

    website.passport = require("passport");
    website.passport.serializeUser((user, done) => {
        done(null, user);
    });
    website.passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    website.passport.use(new Strategy({
        clientID: client.user.id,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: `${website.URL}/login`,
        scope: ["identify", "guilds"]
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }));

    website.express = express()
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({extended : true}))
        .engine("html", require("ejs").renderFile)
        .use(express.static(process.cwd() + '/public'))
        .set("view engine", "ejs")
        .set("views", path.join(__dirname, "pages"))
        .use(session({
            secret: 'Yamamura Dashboard',
            resave: false,
            saveUninitialized: false
        }))
        .use(website.passport.initialize())
        .use(website.passport.session())
        .use((err, req, res, next) => {
            switch (err.message) {
                case 'NoCodeProvided':
                    return res.status(400).send({
                        status: 'ERROR',
                        error: err.message,
                    });
                default:
                    return res.status(500).send({
                        status: 'ERROR',
                        error: err.message,
                    });
            }
        })
        .set('port', process.env.PORT || 3000)
        .use(morgan('dev'));

    website.express = routes(website.express, client);

    // ===================
    // set up modules
    // ===================
    website.express.locals.client = client;
    website.express.locals.isEmpty = isEmpty;
    website.express.locals.util = require("util");
    website.express.locals.getParams = query => {
        return query
            ? (/^[?#]/.test(query) ? query.slice(1) : query)
                .split('&')
                .reduce((params, param) => {
                    let [key, value] = param.split('=');
                    params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                    return params;
                }, {})
            : {};
    };
    website.express.locals.List = List;
    website.express.locals.require = require;

    website.server = http.createServer(this.website.express);
    website.server.listen(this.website.express.get('port'), () => {
        console.log("Express server listening on port " + this.website.express.get('port'));
    });

    return website
}