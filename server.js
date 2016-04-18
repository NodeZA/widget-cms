"use strict";

module.exports = function (config, middleware) {

  let express = require('express');
  let morgan = require('morgan');
  let flash = require('express-flash');
  let errorHandler = require('errorhandler');
  let hbs = require('hbs');
  let path = require('path');
  let fs = require('fs');
  let hbsHelpers = require('./lib/helpers');
  let middleware = require('./lib/middleware');


  /**
   * Create Express server.
   */
  let server = express();


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


  if (config.session) {
    let cookieParser = require('cookie-parser');
    let session = require('express-session');
    let passport = require('passport');
    let MongoStore = require('connect-mongo')({session: session});

    // parse cookies
    server.use(cookieParser());

    // session management
    server.use(session({
      secret: config.secret,
      store: new MongoStore({
        url: config.mongodb.url,
        autoReconnect: true
      }),
      proxy: true,
      resave: true,
      saveUninitialized: true
    }));

    // login management
    server.use(passport.initialize());
    server.use(passport.session());
  }


  if (config.forms) {
    let bodyParser = require('body-parser');
    let expressValidator = require('express-validator');

    // for forms
    server.use(bodyParser.urlencoded({ extended: false }));
    server.use(bodyParser.json());

    // input validation
    server.use(expressValidator());

    if (config.csrf) {
      // CSRF protection.
      server.use(middleware.csrf({whitelist: config.csrfWhitelist || []}));
    }
  }

  // message display
  server.use(flash());

  // serve static files
  server.use(express.static(path.join(config.rootDir, 'public'), {
    maxAge: config.maxAge || ((1000 * 60 * 60) * 24)
  }));

  server.use(middleware.returnTo());


  if (middlewareMethods) {
    middlewareMethods.forEach(function (middlewareMethod) {
      server.use(middlewareMethod);
    });
  }

  if (config.log) {

    let FileStreamRotator = require('file-stream-rotator')

    var logDirectory = path.join(config.rootDir, 'log');

    // ensure log directory exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    // create a rotating write stream
    var accessLogStream = FileStreamRotator.getStream({
      date_format: 'YYYYMMDD',
      filename: path.join(logDirectory, 'access-%DATE%.log'),
      frequency: 'daily',
      verbose: false
    });

    // setup the logger
    server.use(morgan('combined', {stream: accessLogStream}));
  }
  else {
    server.use(logger('dev'));
  }


  // error handling
  if (server.get('env') === 'development') {
    // only use in development
    server.use(errorHandler());
  }

  return server;
};
