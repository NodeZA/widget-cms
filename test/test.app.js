"use scrict";

const request = require('supertest');
const should = require('should');
const createServer = require('./server');
const migrate = require('./migrate');


describe('Create server', function () {
  "use strict";

  let App;

  before(function (done) {
    migrate.start()
    .then(function () {
      App = createServer();

      App.get('/', function (req, res) {
        res.send('Home page');
      });

      App.post('/user', function (req, res) {
        res.send(req.body);
      });

      App.post('/login', function (req, res) {
        res.send(req.body);
      });

      done()
    })
    .catch(function (error) {
      done(error);
    });
  });

  describe('#Model.extend()', function() {
    it('should create a User model and save a record', function(done) {
       let User =  App.getModel('User');

       let test = new User({
         first_name: 'Que',
         last_name: 'Mlilo',
         email: 'que@gmail.com',
         password: 'password'
       });

       test.should.be.an.instanceOf(User).and.have.property('get');
       test.getTableName().should.be.eql('users');

       test.save()
       .then(function (model) {
         model.get('slug').should.be.eql('que');
         done();
       })
       .catch(function (error) {
         done(error);
       });

    });
  });


  describe('#login()', function() {
    it('should fail to login user', function(done) {
      let User =  App.getModel('User');

      User.login('que@gmail.com', 'admin')
        .then(function(user) {
          done(new Error('Should fail login'));
        })
        .catch(function(error) {
          error.should.be.an.instanceOf(Error);
          done();
        });
    });
  });


  describe('#getModel()', function() {
    it('should return a created model', function() {
       let User = App.getModel('User');
       let member = new User();

       member.should.have.property('get');
    });
  });

  describe('#Collection.extend()', function() {
    it('should create a collection', function() {
       let User = App.getModel('User');
       let Users = App.Collection.extend({
         model: User
       });
       let collection = new Users();

       App.addCollection('Users', Users);

       // checkif pagination plugin is working
       collection.should.have.property('fetchPage');

       collection.should.be.an.instanceOf(Users).and.have.property('add');
    });
  });

  describe('#getCollection()', function() {
    it('should return a previously created collection', function() {
       let Users = App.getCollection('Users');
       let collection = new Users();

       collection.should.have.property('add');
    });
  });

  describe('#Controller.extend()', function() {
    it('should create a collection', function() {
       let testController = App.Controller.extend({
         getMyName: function () {
           return 'Que';
         },

         homePage: function (req, res) {
           res.status(200).json({title: 'Home page'});
         }
       });
       let controller = new testController();
       let myname = controller.getMyName();

       App.addController('Test', testController);

       controller.should.be.an.instanceOf(testController).and.have.property('getMyName');
       myname.should.be.eql('Que');
    });
  });

  describe('#getController()', function() {
    it('should return a previously created controller', function() {
       let controller = App.getController('Test');
       let myname = controller.getMyName();

       myname.should.be.eql('Que');
    });
  });

  describe('#get()', function() {
    it('should be created a get route', function(done) {

      request(App.server)
        .get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200)
        .end(function(err, res) {
          if (err)  {
            return done(err);
          }

          res.text.should.be.eql('Home page');

          done();

        });
    });
  });

  describe('#post()', function() {
    it('should be created a post route', function(done) {

      request(App.server)
        .post('/user')
        .expect(200)
        .send({ name: 'Que' })
        .end(function(err, res) {
          if (err)  {
            return done(err);
          }

          res.body.name.should.be.eql('Que');

          done();
        });
    });
  });

  describe('#getConfig()', function() {
    it('should return server port', function() {
       let port = App.getConfig('port');

       port.should.be.eql(3007);
    });
  });


  describe('#login()', function() {
    it('should login user', function(done) {
      let User =  App.getModel('User');

      User.login('que@gmail.com', 'password')
        .then(function(user) {
          user.get('email').should.be.eql('que@gmail.com');
          done();
        })
        .catch(function(error) {
          done(error);
        });
    });
  });
  

  describe('#hasController()', function() {
    it('should return true', function() {
       let hasTest = App.hasController('Test', 'getMyName');

       hasTest.should.be.true();
    });
  });

  after(function (done) {
    migrate.reset()
    .then(function () {
      require('fs').unlinkSync('./test.sqlite');
      console.log(' > Database reset complete');
      done();
    })
    .catch(function (error) {
      require('fs').unlinkSync('./test.sqlite');
      done(error);
    });
  });
});
