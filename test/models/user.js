
"use strict";


const App = require('../../');
const Promise  = require('bluebird');
const bcrypt   = Promise.promisifyAll(require('bcrypt-nodejs'));

const User = App.Model.extend({

  tableName: 'users',


  generatePasswordHash: function (password) {
    return new Promise(function(resolve, reject) {
      bcrypt.genSalt(5, function(err, salt) {
        if (err) {
          return reject(err);
        }

        bcrypt.hash(password, salt, null, function(err, hash) {
          if (err) {
            return reject(err);
          }

          resolve(hash);
        });
      });
    });
  },


  comparePassword: function(candidatePassword) {
    let password = this.get('password');

    return new Promise(function(resolve, reject) {
      bcrypt.compare(candidatePassword, password, function(err, isMatch) {
        if (err) {
          reject(err);
        }
        else {
          resolve(isMatch);
        }
      });
    });
  },


  saving: function (newObj, attr, options) {
    let self = this;
    return this.generatePasswordHash(this.get('password'))
    .then((hash) => {
      if (self.hasChanged('password')) {
        self.set({password: hash});
      }
    })
    .then(function () {
      if (self.isNew() || self.hasChanged('name')) {
        return self.generateSlug(self.get('first_name'))
        .then((slug) => {
          self.set({slug: slug});
        });
      }
    });
  },


  deleteAccount: function(userId) {
    return User.where('id', userId)
    .fetch()
    .then(function (model) {
      return model.destroy();
    });
  }

}, {

  login: Promise.method(function(email, password) {
    if (!email || !password) throw new Error('Email and password are both required');

    return new this({email: email.toLowerCase().trim()})
      .fetch({require: true}).tap(function(customer) {
        return bcrypt.compareAsync(password, customer.get('password'))
        .then(function(res) {
          if (!res) throw new Error('Invalid password');
        });
      });
  })

});


module.exports = App.addModel('User', User);
