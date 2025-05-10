const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2' ).Strategy;

<<<<<<< HEAD
console.log('id google: ',  process.env.GOOGLE_CLIENT_ID);
passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/admin/google/callback",
=======
//console.log('id google: ',  process.env.GOOGLE_CLIENT_ID);
passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.CHESSMY_BACK}/api/admin/google/callback`,
   // callbackURL: `http://localhost:8080/api/admin/google/callback`,
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser(function (user, done){
done(null, user);
});

passport.deserializeUser(function (user, done){
  done(null, user);
});


