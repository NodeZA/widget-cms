"use strict";

module.exports = {
  users: {
    id: {type: 'increments', nullable: false, primary: true},
    first_name: {type: 'string', maxlength: 150, nullable: false},
    last_name: {type: 'string', maxlength: 150, nullable: true},
    slug: {type: 'string', maxlength: 254, nullable: false, unique: true},
    email: {type: 'string', maxlength: 254, nullable: false, unique: true},
    password: {type: 'string', maxlength: 254, nullable: false},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true}
  }
};
