"use scrict";

const request = require('supertest');
const should = require('should');
const createServer = require('./server');

describe('Create server', function () {
  "use strict";

  let App;

  before(function () {
    App = createServer();
  });

  describe('#Model.extend()', function() {
    it('should create a model', function() {
       let testModel = App.Model.extend({
         tableName: 'users'
       });

       App.addModel('Test', testModel);

       let test = new testModel();

       test.should.be.an.instanceOf(testModel).and.have.property('get');
    });
  });

  describe('#getModel()', function() {
    it('should return a created model', function() {
       let testModel = App.getModel('Test');
       let test = new testModel();

       test.should.have.property('get');
    });
  });

  describe('#Collection.extend()', function() {
    it('should create a collection', function() {
       let testModel = App.getModel('Test');
       let testCollection = App.Collection.extend({
         model: testModel
       });
       let collection = new testCollection();

       App.addCollection('Tests', testCollection);

       // checkif pagination plugin is working
       collection.should.have.property('fetchPage');

       collection.should.be.an.instanceOf(testCollection).and.have.property('add');
    });
  });

  describe('#getCollection()', function() {
    it('should return a previously created collection', function() {
       let testCollection = App.getCollection('Tests');
       let collection = new testCollection();

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

  describe('#get()', function(done) {
    it('should be created a get route', function() {

      App.get('/', function (req, res) {
        res.send('Home page');
      });

      request(App.server)
        .get('/')
        .expect('Home page', done);
    });
  });

  describe('#post()', function(done) {
    it('should be created a post route', function() {
      let controller = App.getController('Test');

      App.post('/user', function (req, res) {
        res.send(req.body.name);
      });

      request(App.server)
        .post('/user')
        .send({ name: 'Que' })
        .expect('Que', done);
    });
  });

  describe('#getConfig()', function() {
    it('should return server port', function() {
       let port = App.getConfig('port');

       port.should.be.eql(3000);
    });
  });

  describe('#hasController()', function() {
    it('should return true', function() {
       let hasTest = App.hasController('Test', 'getMyName');

       hasTest.should.be.true();
    });
  });
});
