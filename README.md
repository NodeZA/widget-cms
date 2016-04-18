# WigGet-CMS
> A highly modular Node.js content management system

### Getting started
WigGet CMS is made of the following components - `Models`, `Collections`, `Controllers`, `Routes`, `Plugins`, and `Widgets`. Under the hood it uses Bookshelf.js to connect to your SQL database of choice. It also comes with a special kind of view modules `widgets`.

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

  log: true,  // write application logs to files

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

  mongodb: {  // required - mongodb url string
    url: 'mongodb://localhost:27017/widget_cms'
  },

  cache: true, // optional - defaults to false

  redis: {}, // optional - assumes localhost, port 6379

  rootDir: process.cwd(), // required

  viewsDir: path.join(process.cwd(), 'views'), // optional - defaults to ./views

  modelsDir: path.join(process.cwd(), 'views'), // optional - defaults to ./models

  collectionsDir: path.join(process.cwd(), 'views'), // optional - defaults to ./collections

  controllersDir: path.join(process.cwd(), 'views'), // optional - defaults to ./controllers

  widgetsDir: path.join(process.cwd(), 'views'), // optional - defaults to ./widgets

  pluginsDir: path.join(process.cwd(), 'views'), // optional - defaults ./plugins

  middleware: {
    forms: true,
    csrf: true,
    sessions: true
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

### How it works
Todo..

### Models
Todo..

### Collections
Todo..

### Controllers
Todo..

### Routes
Todo..

### Plugins
Todo..

### Middleware
Todo..

### Widgets
Todo..

### License

(MIT License)

Copyright (C) 2016 Qawelesizwe Mlilo <qawemlilo@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
