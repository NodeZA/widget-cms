"use strict";


const _ = require('lodash');
const path = require('path');
const typeIs = require('type-is');
const mimetypes = require('mime-types');
const bootstrap = require('./bootstrap');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const multer  = require('multer');


function App() {
  EventEmitter.call(this);
}

util.inherits(App, EventEmitter);

_.assign(App.prototype, {

  /*
   * We need passport for all the application authantication
  **/
  passport: require('passport'),


  /*
   * Public: stores application configuration
   *
   * @param - (Object) config - object containing configuration keys and values
   *
   * @returns - (Object) - returns widget-cms application object
  **/
  config: function (config) {
    // store configuration
    if (this._config) {
      throw new Error('Application configuration already set');
    }

    this._config = config;
    this._middleware = [];
    this._helpers = [];

    return this;
  },


  /*
   * Public: registers express server middleware. registered at the bottom of the middleware stack
   *
   * @param - (Function) middleware - express server middleware function that accepts 3 params
   *
   * @returns - (Object) - returns widget-cms application object
  **/
  registerMiddleware: function (middleware) {
    this._middleware.push(middleware);

    return this;
  },


  /*
   * Public: initializes the application and starts the server
   *
   * @param - (Function) done - optional callback function
   *
   * @returns - widget-cms application object
  **/
  start: function (done) {
    if (!this._config) {
      throw new Error('Application configuration not set');
    }

    // initialize Bookshelf
    let Bookshelf = bootstrap.initBookshelf(this._config.db);

    // initialize base model
    Bookshelf = require('./core/model')(Bookshelf);

    // initialize base collection
    Bookshelf = require('./core/collection')(Bookshelf);

    this.Bookshelf = Bookshelf;
    this.Model = Bookshelf.Model;
    this.Collection = Bookshelf.Collection;

    bootstrap.loadModels(this._config);
    bootstrap.loadCollections(this._config);

    this.Controller = require('./core/controller')(this);

    this.server = bootstrap.initServer(this);

    this._plugins = bootstrap.loadPlugins(this._config);
    bootstrap.loadControllers(this._config);

    if (!this._config.hasOwnProperty('serverless') || !this._config.serverless) {

      bootstrap.loadRoutes(this._config);

      // file uploads
      let storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, this._config.uploadsDir || path.join(this._config.rootDir, 'public', 'uploads'));
        },
        filename: function (req, file, cb) {
          let filename = `image_${Date.now()}.${mimetypes.extension(file.mimetype)}`;
          cb(null, filename );
        }
      });

      this.uploader = multer({storage: storage}).any();

      // start server
      this.server.listen(this.server.get('port'), this.server.get('ipAddress'), () => {
        console.info("✔ Express server listening on port %d in %s mode", this.server.get('port'), this.server.get('env'));

        if(done) {
          done();
        }
      });
    }


    return this;
  },


  /*
   * Public: add a collection to application
   *
   * @param - (Function) middleware - express server middleware function that accepts 3 params
   *
   * @returns - (Object) - returns created Bookshelf collection object
  **/
  addCollection: function () {
    return this.Bookshelf.collection.apply(this.Bookshelf, _.toArray(arguments));
  },


  /*
   * Public: adds a model to application
   *
   * @returns - (Object) - returns created Bookshelf model object
  **/
  addModel: function () {
    return this.Bookshelf.model.apply(this.Bookshelf, _.toArray(arguments));
  },


  /*
   * Public: get a registered plugin object
   *
   * @param - (String) name - plugin name
   *
   * @returns - (Object) - plugin object or null if not found
  **/
  getPlugin: function (name) {
    if (this._plugins[name]) {
      let plugin = this._plugins[name];

      return plugin;
    }
    else {
      return null;
    }
  },


  /*
   * Public: adds a controller to application
   *
   * @param - (String) name - controller name
   * @param - (Object) val - controller object
   *
   * @returns - (Object) - returns the created controller object
  **/
  addController: function (name, val) {
    this._controllers = this._controllers || Object.create(null);

    if (this._controllers[name]) {
      throw new Error(name + ' is already defined in the registry');
    }

    this._controllers[name] = val;

    return val;
  },


  /*
   * Public: gets a created controller
   *
   * @param - (String) name - controller name
   * @param - (Object) val - controller object
   *
   * @returns - (Object) - returns stored controller object
  **/
  getController: function (name) {
    this._controllers = this._controllers || Object.create(null);

    if (this._controllers[name]) {
      return new this._controllers[name]();
    }
    else {
      return null;
    }
  },


  /*
   * Public: checks is a controller method exists
   *
   * @param - (String) name - controller name
   * @param - (String) method - controller method
   *
   * @returns - (Boolean) - returns a boolean
  **/
  hasController: function (name, method) {
    return !!this._controllers[name] && _.isFunction(this._controllers[name].prototype[method]);
  },


  /*
   * Public: gets a all stored controllers and their methods
   *
   * @returns - (Array)
  **/
  getControllers: function () {
    return _.keys(this._controllers).map((val) => {
      return {
        name: val,
        methods: _.keys(this._controllers[val].prototype)
      };
    });
  },


  /*
   * Public: clears application cache
   *
   * @param - (String) name - cached route name
   * @param - (Function) callback - callback function
   *
   * @returns - (Void)

  clearCache: function (name, callback) {
    let cache = this.server.get('cache');

    if (callback && _.isFunction(callback)) {
      cache.del(name || '*', callback);
    }

    return this
  },**/


  /*
   * Public: gets a created model
   *
   * @param - (String) name - model name
   *
   * @returns - (Object) - returns requested Model
  **/
  getModel: function (name) {
    if (!this.Bookshelf._models[name]) {
      throw new Error(`Model<${name}> not found`);
    }

    return this.Bookshelf._models[name];
  },


  /*
   * Public: gets a created collection
   *
   * @param - (String) name - collection name
   *
   * @returns - (Object) - returns requested collection
  **/
  getCollection: function (name) {
    if (!this.Bookshelf._collections[name]) {
      throw new Error(`Collection<${name}> not found`);
    }

    return this.Bookshelf._collections[name];
  },


  /*
   * Public: creates application get routes. It is syntactic suger on top express get method.
   *
   * @returns - (Void)
  **/
  get: function () {
    let args = _.toArray(arguments);

    /* disable cache
    if (this._config.cache) {

      let cache = this.server.get('cache');

      if (args.length === 2) {
        args.splice(1, 0, cache.route());
      }

      if (args.length === 3) {
        let secondArg = [];

        if (_.isFunction(args[1])) {
          secondArg.push(args[1]);
          secondArg.push(cache.route());
        }
        else if (_.isArray(args[1])) {
          secondArg = args[1];
          secondArg.push(cache.route());
        }

        args.splice(1, 1, secondArg);
      }
    }*/

    this.server.get.apply(this.server, args);
  },


  /*
   * Public: creates application post routes. It is suger on top express post method.
   *
   * @returns - (Void)
  **/
  post: function () {
    let args = _.toArray(arguments);

    // this middleware ensures that forms with
    // enctype multipart are handled correctly
    let middleware = (req, res, next) => {
      if (typeIs(req, ['multipart/*'])) {
        this.uploader(req, req, function (err) {
          if (err) {
            return next(err);
          }
          next();
        });
      }
      else {
        next();
      }
    };

    if (args.length === 2) {
      args.splice(1, 0, middleware);
    }

    if (args.length === 3) {
      let secondArg = [];

      if (_.isFunction(args[1])) {
        secondArg.push(args[1]);
        secondArg.push(middleware);
      }
      else if (_.isArray(args[1])) {
        secondArg = args[1];
        secondArg.push(middleware);
      }

      args.splice(1, 1, secondArg);
    }

    this.server.post.apply(this.server, args);
  },


  /*
   * Public: gets application configuration
   *
   * @param - (String) name - controller name
   * @returns - (Object) - returns application configuration
  **/
  getConfig: function (name) {
    return this._config[name];
  },


  /*
   * Public: updates application configuration
   *
   * @returns - (Object) - returns updated configuration
  **/
  updateConfig: function (name, val) {
    if (this._config[name]) {
      this._config[name] = val;
    }
  },

  /*
   * Public: registers handlebars helpers
   *
   * @params - (Function) fn - helper function that accepts 1 argument, a handlebars object
   *
   * @returns - (Object) - returns widget-cms object
  **/
  registerHelper: function (fn) {
    if (!_.isFunction(fn)) {
      throw new Error('Invalid arguments');
    }

    this._helpers.push(fn);

    return this;
  }
});


module.exports = new App;
