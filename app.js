const express = require('express');
const ejs = require('ejs');
const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const path = require('path');
const { json } = require('body-parser');
const { Buffer } = require('buffer');
const app = express();
const fs = require('fs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine','ejs');
// Update aws with object store secret
//  do this with a get request in env file.

//  Store these in the .env 

var access_key_id = 'AKIAQT4HBU7563FD4N6E';
var secret_access_key = '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';


aws.config.update({
    accessKeyId: "AKIAQT4HBU7563FD4N6E",
    secretAccessKey: "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",
    region: 'eu-central-1'
});

// instantiate s3 with the above aws config  
   var s3 = new aws.S3();

   var prefix =  req.body.prefix;
   var myBucket = "hcp-8da2bd2a-eb08-4998-baf0-3ceae565e40d" + "/" + prefix;
   var myKey = 'abcd.txt';


  app.post('/', function(req,res){

//for text file
//fs.readFile('demo.txt', function (err, data) {
//for Video file
//fs.readFile('demo.avi', function (err, data) {
//for image file                
fs.readFile('abcd.txt', function (err, data) {
  if (err) { throw err; }
console.log(data);
     params = {Bucket: myBucket, Key: myKey, Body: data };
     s3.putObject(params, function(err, data) {
         if (err) {
             console.log(err)
         } else {
             console.log("Successfully uploaded data to myBucket/myKey");
         }
      });
  });
});

  app.get('/',function(req,res){
    res.render('home',{bucket: myBucket });
  });
  app.listen(3002,function(req,res){
    console.log('Aws Get and List object app running at port 3002');

  });
