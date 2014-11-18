var Firebase               = require('firebase');
var emailData              = require('./cmAPI');
var dataRef                = new Firebase('https://email-stats.firebaseio.com/stats');
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator         = new FirebaseTokenGenerator(process.env.FB_SECRET);
var token                  = tokenGenerator.createToken({uid: "1"});

dataRef.authWithCustomToken(token, function(error, authData) {

  if(error) return console.log("Login Failed!", error);

  console.log('Login successful, getting data...');

  emailData('Genentech')
    .then(function(data){
      console.log('Adding data...');
      dataRef.set(data)
    })
    .catch(function(err){
      console.log('There was an error:', err);
    })
    .done(function(){
      console.log('Exiting');
      process.exit();
    });
    
});