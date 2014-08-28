/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'facebook-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../app/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=bob@aol.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /profile/edit', function(){
    it('should show the edit profile page', function(done){
      request(app)
      .get('/profile/edit')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        done();
      });
    });
  });

  describe('put /profile', function(){
    it('should edit profile page', function(done){
      request(app)
      .post('/profile')
      .send('_method=put&visible=public&email=bob%40aol.com&photo=photo+url&tagline=bobs+stuff&facebook=facebook+url&twitter=twitter+url&phone=888+888+8888')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('get /profile', function(){
    it('should edit profile page', function(done){
      request(app)
      .get('/profile')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        expect(res.text).to.include('Twitter');
        done();
      });
    });
  });

  describe('get /users', function(){
    it('should edit profile page', function(done){
      request(app)
      .get('/users')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        expect(res.text).to.include('tobefrankzine@gmail.com');
        expect(res.text).to.not.include('harry@aol.com');
        expect(res.text).to.not.include('larry@aol.com');
        done();
      });
    });
  });

  describe('get /users/tobefrankzine@aol.com', function(){
    it('should show user page', function(done){
      request(app)
      .get('/users/tobefrankzine@gmail.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('tobefrankzine@gmail.com');
        done();
      });
    });

    it('should redirect when user/:id is private', function(done){
      request(app)
      .get('/users/harry@aol.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users');
        done();
      });
    });
  });

  describe('post /message/000000000000000000000002', function(){
    it('should send a user a text', function(done){
      request(app)
      .post('/message/000000000000000000000002')
      .send('mtype=text&message=yo')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/tobefrankzine@gmail.com');
        done();
      });
    });

    it('should send a user an email', function(done){
      request(app)
      .post('/message/000000000000000000000002')
      .send('mtype=email&message=hello')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/tobefrankzine@gmail.com');
        done();
      });
    });
  });
});

