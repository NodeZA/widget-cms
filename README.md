# WigGet-CMS
> A highly modular Node.js application framework

[![Build Status](https://travis-ci.org/NodeZA/widget-cms.svg?branch=master)](https://travis-ci.org/NodeZA/widget-cms)
![Depencies](https://david-dm.org/nodeza/widget-cms.svg)
![NPM](https://img.shields.io/npm/v/widget-cms.svg)

### What is Widget-CMS?

`Widget-CMS` is a framework for building Node.js applications that use SQL databases. Under the hood it uses Bookshelf.js to connect to the database and supports the following databases: Postgres, MySQL, MariaDB, and SQLite. `Widget-CMS` follows a MVC-like architecture and is built around the following concepts - `Models`, `Collections`, `Controllers`, `Routes`, `Plugins`, and `Widgets`.


Table of Contents
-----------------

- [How it works](#how-it-works)
- [Software Requirements](#software-requirements)
- [Getting started](#getting-started)
- [Models](#models)
- [Collections](#collections)
- [Controllers](#controllers)
- [API](#api)
- [Change log](#change-log)
- [Testing](#testing)

### How it works
When a `Widget-CMS` application is initialised it runs the following steps:

 1. Sets application configuration
 2. Creates a database connection through Bookshelf.js
 3. Loads all models created inside your models directory
 4. Loads all collections inside your collections directory
 5. Loads all plugins inside your plugins directory
 6. Loads all controllers inside your controllers directory
 7. Loads all widgets inside your widgets directory
 8. Sets up the express server and loads all middleware
 9. Loads all routes inside your routes directory
 10. Creates a `multer` instance that will be used for handling multipart forms
 11. Finally, the express server is initialised.


### Software Requirements

 - SQL database (MySQL, Postgres, MariaDB, or SQLite)
 - Redis - session management
 - Node.js 14.x or greater


### Getting started
 1. Install `widget-cms` inside your root directory: `npm install widget-cms --save`
 2. Create the required directories: `mkdir models collections controllers widgets plugins routes`
 3. Create your application entry file:

```javascript
"use strict";

const app = require('widget-cms');
const path = require('path');


app.config({
  port: 3000, // default 3000

  secret: 'your_app_secret_here',

  saveLogs: true,  // write application logs to files

  db: {              // required
    client: 'mysql', // options - mysql, pg, mariasql, sqlite3
    connection: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'widget_cms',
      charset: 'utf8'
    }
  },

  redis: {}, // optional - assumes {host: localhost, port: 6379}

  rootDir: process.cwd(), // required

  /**** optional

  viewsDir: path.join(process.cwd(), 'views'), // optional - defaults to ./views

  modelsDir: path.join(process.cwd(), 'views'), // optional - defaults to ./models

  collectionsDir: path.join(process.cwd(), 'views'), // optional - defaults to ./collections

  controllersDir: path.join(process.cwd(), 'views'), // optional - defaults to ./controllers

  widgetsDir: path.join(process.cwd(), 'views'), // optional - defaults to ./widgets

  pluginsDir: path.join(process.cwd(), 'views'), // optional - defaults ./plugins

  *****/

  middleware: {
    enableForms: true,
    enableCSRF: true,
    enableSessions: true
  }
});

app.registerMiddleware(function (req, res, next) {
  // pass user object to templates
  res.locals.user = {
    name: 'Que',
    email: 'que@widget-cms.com'
  };

  next();
});

app.start();
```



### Models
All models should be located in the models directory. Models are created by extending the widget-cms Model object.

```javascript
const App = require('widget-cms');

const User = App.Model.extend({

  tableName: 'users'

});

module.exports = App.addModel('User', User);
```

Widget-CMS Models have 5 special methods that you can use to handle certain events when your model is initialized:

```javascript
const App = require('widget-cms');

const User = App.Model.extend({

  tableName: 'users',

  // called before an insert or update query
  // throw error to cancel operation
  // should return a promise for async operations
  saving: function (model, attributes, options) {
    // do validations and data transformations
  },

  // called before an insert query
  // throw error to cancel operation
  // should return a promise for async operations
  creating: function (model, attributes, options) {
    // do validations and data transformations
  },

  // called before a delete query
  // throw error to cancel operation
  // should return a promise for async operations
  destroying: function (model, attributes, options) {
    // do validations
  },


  // called after an insert or update query.
  saved: function (model, attributes, options) {

  },

  // called after an update query
  updated: function (model, attributes, options) {

  }

});

module.exports = App.addModel('User', User);
```



### Collections
All collections should be located in the collections directory. Collections are created by extending the widget-cms Collection object.

```javascript
const App = require('widget-cms');
const User = App.getModel('User');

const Users = App.Collection.extend({

  model: User

});

module.exports = App.addCollection('Users', Users);
```

### Controllers
All controllers should be located in the controllers directory. Controllers are created by extending the widget-cms Controller object.

```javascript
const App = require('widget-cms');

const UsersController = App.Controller.extend({
  getUsers: function (req, res, next) {
    let Users = App.getCollection('Users');

    Users.forge()
    .then(function (collection) {
      res.json(collection.toJSON());
    })
    .catch(function (error) {
      next(error);
    });
  }
});

module.exports = App.addController('Users', getUsers);
```

### Routes
All routes should be located in the routes directory. Routes can be created by calling the `get` or `post` methods directly from the widget-cms object.

```javascript
const App = require('widget-cms');
const UsersController = App.getController('Users');

App.get('/users', UsersController.getUsers);
```


### API

The Widget-CMS API is intentionally kept  small, please send open an issue for any bugs.

#### Methods

 - **config** - sets application configuration
   - @param - {Object} config - object containing configuration keys and values
   - @returns - {Object} - returns widget-cms application object

 - **registerMiddleware** - registers express server middleware. registered at the bottom of the middleware stack
   - @param - {Function} middleware - express server middleware function that accepts 3 params
   - @returns - {Object} - widget-cms application object

 - **registerHelper** - registers handlebars helpers
   - @params - {Function} fn - helper function that accepts 1 argument - a handlebars object
   - @returns - {Object} - returns widget-cms object

 - **start** - initializes the application and starts the server
   - @param - {Function} done - optional callback function
   - @returns - widget-cms application object

 - **addCollection** - add a collection to application
   - @param - {Function} middleware - express server middleware function that accepts 3 params
   - @returns - {Object} - created Bookshelf collection object

 - **addModel** - adds a model to application
   - @returns - {Object} - created Bookshelf model object

 - **addController** - adds a controller to application
   - @param - {String} name - controller name
   - @param - {Object} val - controller object
   - @returns - {Object} - the created controller object

 - **hasController** - checks is a controller method exists
   - @param - {String} name - controller name
   - @param - {String} method - controller method
   - @returns - {Boolean}

 - **getPlugin** - get a registered plugin
   - @param - {String} name - plugin name
   - @returns - {Object} - plugin object or null if not found

 - **getController** - gets a created controller
   - @param - {String} name - controller name
   - @param - {Object} val - controller object
   - @returns - {Object} - stored controller object

 - **getControllers** - gets a all stored controllers and their methods
   - @returns - {Array}

 - **getModel** - gets an application model
   - @param - {String} name - model name
   - @returns - {Object} - requested Model

 - **getCollection** - gets an application collection
   - @param - {String} name - collection name
   - @returns - {Object} - returns requested collection

 - **getConfig** - gets application configuration
   - @param - {String} name - config name

 - **get** - creates application get routes. It's syntactic sugar on top of express' get method
   - @returns - {Void}

 - **post** - creates application post routes. It's syntactic sugar on top express' post method
   - @returns - {Void}

 - **passport** - passport authentication
   - @returns - {Object} - passport object


#### Objects

Below is a list of application objects that are extendable.

 - **Model** - creates a model
 - **Collection** - creates a collection
 - **Controller** - creates a controller


### Change log

[Checkout changelog.md starting from v0.3.6](https://github.com/NodeZA/widget-cms/blob/master/changelog.md)


### Testing
```
npm test
```

### License

(MIT License)

Copyright (C) 2016 Qawelesizwe Mlilo <qawemlilo@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
