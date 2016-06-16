"use strict";

module.exports = function (App) {

  const config = App._config;
  const middlewareMethods = App._middleware;
  const handlebarsHelpers = App._helpers;
  const express = require('express');
  const _ = require('lodash');
  const morgan = require('morgan');
  const errorHandler = require('errorhandler');
  const hbs = require('hbs');
  const path = require('path');
  const fs = require('fs');
  const hbsHelpers = require('./lib/helpers');
  const middleware = require('./lib/middleware');


  /**
   * Create Express server.
   */
  const server = express();


  // server port
  server.set('port', process.env.PORT || config.port);

  // define views folder
  server.set('views', config.viewsDir || path.join(config.rootDir, 'views'));

  // Handlebars settings
  server.set('view engine', 'hbs');
  server.engine('hbs', hbs.__express);
  server.disable('view cache');
  server.disable('x-powered-by');

  hbs.localsAsTemplateData(server);
  hbs.registerPartials(path.join(config.rootDir,'views', 'partials'));

  // setup and register handlebars helpers
  hbsHelpers.setup(hbs);

  if (handlebarsHelpers.length) {
    handlebarsHelpers.forEach(function (helper) {
      if (_.isFunction(helper)) {
        helper(hbs);
      }
    })
  }


  if (config.middleware.enableSessions) {
    let flash = require('express-flash');
    let cookieParser = require('cookie-parser');
    let session = require('express-session');
    let passport = require('passport');
    let RedisStore = require('connect-redis')(session);


    // parse cookies
    server.use(cookieParser());

    // session management
    server.use(session({
      secret: config.secret,
      store: new RedisStore(config.redis),
      proxy: true,
      resave: true,
      saveUninitialized: true
    }));

    // login management
    server.use(passport.initialize());
    server.use(passport.session());
    server.use(flash());

    // want passport to be accessible throughout the application
    server.set('passport', passport);
  }

  // application caching
  if (config.cache) {
    let redisCache = require('express-redis-cache');
    let redisConfig = _.defaults(config.redis || {}, {expire: 60 * 60})

    server.set('cache', redisCache(redisConfig));
  }

  // ensure user is available in templates
  server.use(function (req, res, next) {
    if (req.user) {
      res.locals.user = req.user.toJSON();
    }
    next();
  });

  if (config.middleware.enableForms) {
    let bodyParser = require('body-parser');

    // for forms
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    // input validation
    if (config.middleware.inputValidation) {
      let expressValidator = require('express-validator');

      server.use(expressValidator());
    }

    if (config.middleware.enableCSRF) {
      // CSRF protection.
      server.use(middleware.csrf({whitelist: config.csrfWhitelist || []}));
    }
  }

  // serve static files
  server.use(express.static(path.join(config.rootDir, 'public'), {
    maxAge: config.maxAge || ((1000 * 60 * 60) * 24)
  }));

  if (middlewareMethods) {
    middlewareMethods.forEach(function (middlewareMethod) {
      server.use(middlewareMethod);
    });
  }

  if (config.saveLogs) {

    let FileStreamRotator = require('file-stream-rotator')
    let logDirectory = path.join(config.rootDir, 'log');

    // ensure log directory exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    // create a rotating write stream
    let accessLogStream = FileStreamRotator.getStream({
      date_format: 'YYYYMMDD',
      filename: path.join(logDirectory, 'access-%DATE%.log'),
      frequency: 'daily',
      verbose: false
    });

    // setup the logger
    server.use(morgan('combined', {stream: accessLogStream}));
  }
  else {
    server.use(morgan('dev'));
  }


  // error handling
  if (server.get('env') === 'development') {
    // only use in development
    server.use(errorHandler());
  }

  return server;
};
