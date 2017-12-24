"use strict";

module.exports = function (App) {

  const config = App._config;
  const middlewareMethods = App._middleware;
  const express = require('express');
  const _ = require('lodash');
  const morgan = require('morgan');
  const errorHandler = require('errorhandler');
  const hbs = require('hbs');
  const path = require('path');
  const fs = require('fs');
  const middleware = require('./lib/middleware');
  const applicationHelpers = App._helpers;
  const frameworkHelpers = require('./lib/helpers');
  const handlebarsHelpers = require('handlebars-helpers');


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

  // generic handlebars helpers
  handlebarsHelpers({
    handlebars: hbs
  });

  // framework specific helpers
  frameworkHelpers.setup(hbs);

  // application defined handlebars helpers
  if (applicationHelpers.length) {
    applicationHelpers.forEach(function (helper) {
      if (_.isFunction(helper)) {
        helper(hbs);
      }
    })
  }

  if (config.middleware.enableSessions) {
    let flash = require('express-flash');
    let cookieParser = require('cookie-parser');
    let session = require('express-session');
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
    server.use(App.passport.initialize());
    server.use(App.passport.session());
    server.use(flash());
  }

  // application caching
  /* disable cache
  if (config.cache) {
    let redisCache = require('express-redis-cache');
    let redisConfig = _.defaults(config.redis || {}, {expire: 60 * 60})

    server.set('cache', redisCache(redisConfig));
  }*/

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

  server.use(morgan('combined'));

  // error handling
  if (server.get('env') === 'development') {
    // only use in development
    server.use(errorHandler());
  }
  else {
    server.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message);
    });
  }

  return server;
};
