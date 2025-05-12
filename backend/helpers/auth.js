const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2' ).Strategy;

//console.log('id google: ',  process.env.GOOGLE_CLIENT_ID);
passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.CHESSMY_BACK}/api/admin/google/callback`,
    //callbackURL: `https://chessmyproduccion.onrender.com/api/admin/google/callback`,
   // callbackURL: `http://localhost:8080/api/admin/google/callback`,
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


