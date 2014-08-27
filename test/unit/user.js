/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../app/models/user'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'facebook-test';

describe('User', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      done();
    });
  });

  describe('constructor', function(){
    it('should create a new User object', function(){
      var u = new User();
      expect(u).to.be.instanceof(User);
    });
  });

  describe('update', function(){
    it('should update a user', function(done){
      User.findById('000000000000000000000001', function(err, user){
        User.update({visible: 'public',
          email: 'bob@aol.com',
          photo: 'photo url',
          tagline: 'bobs stuff',
          facebook: 'facebook url',
          twitter: 'twitter url',
        phone: '888 888 8888'}, user, function(){
          User.findById('000000000000000000000001', function(err, user){
            expect(user.email).to.equal('bob@aol.com');
            expect(user.photo).to.equal('photo url');
            expect(user.tagline).to.equal('bobs stuff');
            expect(user.twitter).to.equal('twitter url');
            expect(user.phone).to.equal('888 888 8888');
            done();
          });
        });
      });
    });
  });

  describe('.all', function(){
    it('should find all users', function(done){
      User.find({isVisible: true}, function(err, users){
        expect(users).to.have.length(2);
        done();
      });
    });
  });
});

