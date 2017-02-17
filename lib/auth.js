
"use strict";

const LocalStrategy = require('passport-local').Strategy;


module.exports = function (App) {

  const User = App.getModel('User');
  const passport = App.passport;

  passport.deserializeUser(function(id, done) {
    User.where('id', id)
    .fetch({withRelated: ['role']})
    .then(function(user) {
      done(false, user);
    })
    .catch(function (error) {
      done(error);
    });
  });

  passport.serializeUser(function(user, done) {
    if(user) {
      done(null, user.get('id'));
    }
    else {
      done(new Error('User account not found'));
    }
  });

  passport.use(new LocalStrategy({ usernameField: 'email' },
    function(email, password, done) {
      return User.where('email', email)
      .fetch({require:true})
      .then(function(user) {
        return user.comparePassword(password)
        .then(function(isMatch) {
          if (isMatch) {
            return done(null, user);
          }

          done(null, false, { message: 'Invalid password.' });
        })
        .catch(function (error) {
          done(null, false, { message: 'Invalid credentials' });
        });
      })
      .catch(function (error) {
        done(null, false, { message: 'Email not found' });
      });
  }));


  let Auth = {
    // Login Required middleware.

    isLoggedIn: function (opts) {
      return function (req, res, next) {
        opts = opts || {};

        if (req.isAuthenticated()) {
          return next();
        }

        res.redirect(opts.redirect || '/login');
      }
    },


    isNotLoggedIn: function (opts) {
      return function (req, res, next) {
        opts = opts || {};

        if (!req.isAuthenticated()) {
          return next();
        }

        res.redirect(opts.redirect || '/');
      }
    },

    is: function (rolename, opts) {
      return function (req, res, next) {
        opts = opts || {};

        if (req.user && req.user.related('role').get('name') === rolename) {
          next();
        }
        else {
          if (opts.onFail) {
            opts.onFail(req, res, next);
          }
          else {
            res.redirect(opts.redirect || 'back');
          }
        }
      }
    }
  }

  return Auth;
};
