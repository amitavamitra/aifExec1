// import npm packages
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const https = require('https');
const request = require('request');
require('dotenv').config();
const aws = require('aws-sdk');
const path = require('path');
const { json } = require('body-parser');
const { Buffer } = require('buffer');

const fs = require('fs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine','ejs');

//  define the app on express middleware
//  we set public to be our static resources 
//  folder for the project
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
// we use ejs as rendering engine
// for this package we need a views folder 
// we define all ui/html pages in this folder
app.set('view engine' , 'ejs');
// we define constants for the project
// this file should be part of .env 
// and part of .gitignore
// credential for ai core instance
const service_key = require('./enablement-sk.json');
// credential for s3 object store
const s3_key = require('./objectStore.json');
// const { request } = require('node:http');
const { func } = require('assert-plus');
const { head } = require('request');
const { TIMEOUT } = require('dns');
const { resolve } = require('path');
const { rejects } = require('assert');
const { config } = require('dotenv');
const { ppid } = require('process');
// clientID acts as username in requests 
const clientId = service_key['clientid'];
//  secretkey acts as password
const secretkey = service_key['clientsecret'];
// base_url to ai instance
const base_url = service_key['serviceurls']['ML_API_URL'] + '/v2' ;
// url to be used to fetch the auth token
var url = service_key['url'] + '/oauth/token?grant_type=client_credentials' ;

// s3-bucket name
const s3_bucket = s3_key['bucket'];

// s3 accesskey
const s3_accesskey = s3_key['access_key_id'];

//s3 secretkey
const s3_secretkey = s3_key['secret_access_key'];



// global definition of token variable
var token = "";
//  global definition of serving url for inference
var serving = "";
var alive = "Please log in!";
// get onto the logon page renders the home page
var yourArray = [];
var ent = "";
var val = "";
var text = "";
var entity = [];
var value = [];
var artifactID = "";
var conf_id = "";
var new_artifact = {};
var new_config = {};
var new_exec = {};
var loadmessage ="";
var prefix =""; 


//  Step 1 : Login page takes the input - right now its dummy!
app.get('/', function(req,res){
  res.render('login' ,{
    bucket: s3_bucket,
    access_key_id:s3_accesskey,
    secret_access_key:s3_secretkey,
    loadmessage:loadmessage,
  });
});

//  Step 2 : Login to Ai instance for enablement-sk.json
//  Get JWT for the session.

app.post('/login' , function(req,res){
  // use Basic Auth  with clientID and secretkey to base64.
  // we use this to auth in the header to fetch the token 
  // along with the url prepared earlier.
                var auth = "Basic " + new Buffer(clientId + ":" + secretkey).toString("base64");
                request.get( {
                  url : url,
                  headers : {
                      "Authorization" : auth
                  }
                }, function(error, response, body) {
                    token = JSON.parse(body)['access_token'];
                    console.log(token);
                  //    JWT token 
                  if (token !== '') {
                     alive = 'You are in'
                    console.log(alive)
                  }
                });
                  res.redirect('/load');
                  // Create headers  with AI Resource Group and Bearer token
    });
  
  
// Step 3: Route to Load page...

app.get('/load', function(req,res){
    // res.render('yaml');
  res.render('load',
  {alive:alive ,
    bucket: s3_bucket,
    access_key_id:s3_accesskey,
    secret_access_key:s3_secretkey,
    base_url:base_url,
     new_artifact:new_artifact,
     new_exec:new_exec,
     new_config:new_config,
      entity:entity,
      value:value , 
      text:text});
    // res.render('home')
})
entity =[];
value = [];

// Step 4 :  Load post means files / artifacts uploaded to s3-bucket/prefix.

app.post('/load' , function(req,res){
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
  
     prefix =  req.body.prefix;
     var myBucket = s3_bucket + "/" + prefix;
    //  var myKey = 'abcd.txt';
    var  myKey  = req.body.inputfile;
    
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
              console.log(`Successfully uploaded ${myKey} to ${myBucket}`);
              loadmessage = `Successfully uploaded ${myKey} to ${myBucket}`;
         }
      });
  });  

  res.redirect('/regconstrig'); // Route to Register Configure and Trigger
});

// 4. Route to Register > Cons & Trigger Page

app.get('/regconstrig', function(req,res){
  // res.render('yaml');
res.render('home',
{alive:alive ,
  bucket: s3_bucket,
  access_key_id:s3_accesskey,
  secret_access_key:s3_secretkey,
  loadmessage:loadmessage,
  base_url:base_url,
   new_artifact:new_artifact,
   new_exec:new_exec,
   new_config:new_config,
    entity:entity,
    value:value , 
    text:text});
  // res.render('home')
})

// Register -> Configure -> Execute
//  Function chaining is required here.
// https://medium.com/technofunnel/javascript-function-chaining-8b2fbef76f7f
// https://javascript.info/promise-chaining
app.post('/regconstrig', function(req,res){
  console.log(req.body.scenarioId)
    var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
    // console.log(headers);
           const payload = { 
            'name': req.body.name,
            'kind': 'dataset',
            // 'url': 'ai://default/spacy/',
            'url': 'ai://default/'+ req.body.prefix  + '/',
            'description': req.body.description,
            'scenarioId':  req.body.scenario_id
          }   
  var conf_payload = {
            "name": req.body.name,
            "executableId": req.body.executableId,
            "scenarioId": req.body.scenario_id,
            "parameterBindings": [
              {
                "key": "training-epochs",
                "value": "1"
              }
            ],
            "inputArtifactBindings": [
              {
                "key": "training-data",
                "artifactId": new_artifact.id
              }
            ]
          }

const art = () => {

            return new Promise((resolve,reject) => {
                  
              const artifact  = base_url + '/lm/artifacts';
        var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
        const payload = { 
          'name': req.body.name,
          'kind': 'dataset',
          'url': 'ai://default/spacy/',
          // 'url': 'ai://default/'+ 'spacy/',
          'description': req.body.description,
          'scenarioId': req.body.scenario_id
        }   
        request.post({ url:artifact,
                       headers:headers,
                       json: payload}, function(error, response, artbody){
                                               
        new_artifact = artbody;
        
         resolve(new_artifact);
  
                    });
            })
            res.redirect('/');
}



const conf = () => {

  return new Promise((resolve,reject) => {
        
    const configuration  = base_url + '/lm/configurations';
var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
const conf_payload = {
  "name": req.body.name,
  "executableId": req.body.executableId,
  "scenarioId": req.body.scenario_id,
  "parameterBindings": [
    {
      "key": "training-epochs",
      "value": "1"
    }
  ],
  "inputArtifactBindings": [
    {
      "key": "training-data",
      "artifactId": new_artifact.id
    }
  ]
}

request.post({url:configuration,
  headers:headers,
json: conf_payload},function(error, response, confbody){
  // console.log('***********************Configuration*************************');
  // console.log('Configuration : ', confbody);
new_config = confbody;
resolve(new_config);
});

  })
}
   
//  Life is chain of promise and we keep it till the end.
//  For any rejection we catch it and deal with it..
art().then(new_artifact => {
  console.log('Artifact registered :' ,new_artifact)
  return conf();
}).then(new_config => {
  console.log('Configuration created :' ,new_config)
  return trigger_execution();
 }).then(new_exec => {
  console.log('Execution triggered :' ,new_exec)
 }).catch(err => {
   console.log(err);
 })

    res.redirect('/regconstrig');
})
function create_configuration(){
    const configuration  = base_url + '/lm/configurations';
    var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
    // console.log('*********Artifact Passed for Config********************');
    // console.log('Artifact : ', new_artifact);
    var id = JSON.stringify(new_artifact.id);
    // console.log(id);
    // console.log('*********Artifact Passed for Config********************');
    var conf_payload = {
      "name": req.body.name,
      "executableId": req.body.executableId,
      "scenarioId": req.body.scenario_id,
      "parameterBindings": [
        {
          "key": "training-epochs",
          "value": "1"
        }
      ],
      "inputArtifactBindings": [
        {
          "key": "training-data",
          "artifactId": new_artifact.id
        }
      ]
    }
    
    request.post({url:configuration,
                    headers:headers,
                json: conf_payload},function(error, response, confbody){
                    // console.log('***********************Configuration*************************');
                    // console.log('Configuration : ', confbody);
    new_config = confbody;
    resolve(new_config)
    });
    
}

const  trigger_execution = () => {
  // console.log(new_config.id);
  return new Promise((resolve,reject) => {
    const execUrl  = base_url + '/lm/configurations/' + new_config.id + '/executions' ;
    var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
    request.post({url: execUrl, headers: headers},function(error,response,body){
      // console.log('***********************Execution*************************');
      // console.log('Execution : ', body);
      new_exec = body;
      resolve(new_exec);
      })

  })
}
 
app.post('/search' , function(req,res){

  var exec_id = req.body.exec_id;
  check_status();
})

 function check_status(exec_id){

  const execUrl  = base_url + '/lm/exections/' +  exec_id;
  console.log(base_url)
  var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
  request.get({url:execUrl,headers:headers},function(error,response,execstatus){
  console.log(execstatus);

  })

}
 
const PORT = process.env.PORT || 3003;

app.listen(PORT,function(){
    console.log('Aws Upload and AI Core Trigger Execution App running at port - 3003')
})