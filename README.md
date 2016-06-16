# WigGet-CMS
> A highly modular Node.js application framework

### What is Widget-CMS?

`Widget-CMS` is a framework for building Node.js applications that use SQL databases. Under the hood it uses Bookshelf.js to connect to the database and supports the following databases: Postgres, MySQL, MARIADB, and SQLite. `Widget-CMS` follows a MVC-like architecture and is built around the following concepts - `Models`, `Collections`, `Controllers`, `Routes`, `Plugins`, and `Widgets`.


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

  cache: true, // optional - defaults to false

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
