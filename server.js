// import npm packages
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const https = require('https');
const request = require('request');
const rfcClient = require("node-rfc").Client; 
require('dotenv').config();

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
// const { request } = require('node:http');
const { func } = require('assert-plus');
const { head } = require('request');
// clientID acts as username in requests 
const clientId = service_key['clientid'];
//  secretkey acts as password
const secretkey = service_key['clientsecret'];
// base_url to ai instance
const base_url = service_key['serviceurls']['ML_API_URL'] + '/v2' ;
// url to be used to fetch the auth token
var url = service_key['url'] + '/oauth/token?grant_type=client_credentials' ;
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

app.get('/login', function(req,res){
  res.render('login');
})
app.get('/', function(req,res){
  res.render('home',{alive:alive , entity:entity,value:value , text:text});
})
entity =[];
value = [];
// 1. Function - get JwT token. Button Login press.
//  done through a post route.
// called from Login button in a  form in home.ejs post action .
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
                res.redirect('/');
                // Create headers  with AI Resource Group and Bearer token
  });

// app.post('/scenario)

app.post('/', function(req,res){
    var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
    console.log(headers);
    // Register Artifact 

    // artifact_register(artifact , payload);
    const artifact  = base_url + '/lm/artifacts';
    const payload = { 
        'name': 'materialbasicdata',
        'kind': 'dataset',
        'url': 'ai://default/spacy/',
        // 'url': 'ai://default/'+ 'spacy/',
        'description': 'A meaningful Description',
        'scenarioId': 'materialbasicdata'
      }
    request.post({ url:artifact,
                   headers:headers,
                   json: payload}, function(error, response, artbody){
                    console.log('***********************\Artifact*************************');              
    artifactID = artbody.id;
    console.log('Artifact : ', artifactID);
                });
    // Create Configuration
    
const configuration  = base_url + '/lm/configurations';
console.log('*********Artifact Passed for Config********************');
console.log('Artifact : ', artifactID);
console.log('*********Artifact Passed for Config********************');
var conf_payload = {
  "name": "materialbasicdata",
  "executableId": "materialbasicdata",
  "scenarioId": "materialbasicdata",
  "parameterBindings": [
    {
      "key": "training-epochs",
      "value": "1"
    }
  ],
  "inputArtifactBindings": [
    {
      "key": "training-data",
      "artifactId": artifactID
    }
  ]
}

request.post({url:configuration,
                headers:headers,
            json: conf_payload},function(error, response, confbody){
                console.log('***********************Configuration*************************');
                console.log('Configuration : ', confbody.id);
conf_id = confbody.id;
});

//  Ok bug here , working on second trigger.. buggy code..
    // Trigger Execution 

    // # Start execution of executable with given config

const execUrl  = base_url + '/lm/configurations/' + conf_id + '/executions' ;


    request.post({url: execUrl, headers: headers},function(error,response,body){
    console.log('***********************Execution*************************');
    console.log('Execution : ', body);
    })
})

// Check the deployment is running - before inference
app.post('/serve', function(req,res){
    var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
    console.log(headers);
    const serve  = base_url + '/lm/deployments/'+ req.body.deploymentID;
    console.log(serve);
    request.get( {
        url : serve,
        headers : headers,
      }, function(error, response, body) {
        console.log('***********************deployment*************************');
          console.log('body : ', JSON.parse(body));
         serving = JSON.parse(body)['deploymentUrl'];
        //   Serving
        console.log('**************************************************************');
        console.log(serving);
        console.log('**************************************************************');
      });
 });

// Infer on Text data
  app.post('/infer', function(req,res,next){
    var headers = {'AI-Resource-Group': 'default','Authorization': 'Bearer '+ token}
    var inference = serving + "/v1/models/model:predict";
    console.log('******************Infererence Url*************************');
    console.log(inference);
    console.log('******************Infererence Url*************************');
          text = req.body.text;
          var inputs = {
            "text": text,
            }
            console.log(inputs);  
          request.post({
            url: inference,
            headers: headers,
            json: inputs,
              }, function(err, res) {
                if(err) {
                  console.error(err);
                } else {
                  yourArray = res.body;
                  console.log('******************Your Array *************************');
                  console.log(yourArray);
                  console.log('******************Your Array *************************');
                  for (let index = 0; index < yourArray.length; index++) {
                    const element = yourArray[index];
                    var eleString = JSON.stringify(element)
                    // console.log('Entities')
                    ent = eleString.substr(2, eleString.indexOf('":')-2 )
                    entity.push(ent);
                    val = eleString.substr(eleString.indexOf('":') + 3, eleString.indexOf("}"))
                    val = val.substring(0, val.length - 2);
                    value.push(val);
                    }
                  } 
                     
          });
          res.redirect('/');  
          next();   
});

// On user approval - call S/4 via node-rfc

app.post('/s4api' , function(req,res){

  const abapConnection = {
    dest:'S4H',
    user:process.env.USER,
    passwd:process.env.PASSWORD,
    ashost: process.env.AHOST,
    sysnr: "00",
    client: "100",
  };
   
  // create new client
  const client = new rfcClient(abapConnection);
  
  //  check material description
console.log(entity)
  for (let index = 0; index < entity.length; index++) {
    // const element = entity[index];
    if (entity[index] == 'MATKX') {
      var matkx = value[index]
      console.log(matkx)
    }
  }
  // echo SAP NW RFC SDK and nodejs/RFC binding version
  console.log("Client version: ", client.version);
  
  // open connection
  client.connect(function(err) {
    
    if (err) {
      return console.error("could not connect to server",err);
    } else {
      console.log('Logged on to System:' + abapConnection.dest + " client " +abapConnection.client)
    }
var timest = new Date().getUTCMinutes();
 
  //   // invoke ABAP function module, passing structure and table parameters
       
      const headdata = {
      MATERIAL        :       'text2ent' + timest,
      IND_SECTOR      :       "M",
      MATL_TYPE       :       "HALB",
      BASIC_VIEW      :       "X",
      MATERIAL_LONG   :      'text2ent' + timest
          };
  const clientdata  = {
      OLD_MAT_NO     :   matkx,
      BASE_UOM       :    "EA",
      MATL_GROUP     :    "01"  
      };
  const clientdatax  = {
      OLD_MAT_NO     :    "X",
      BASE_UOM       :    "X" ,
      MATL_GROUP     :    "X"    
      };
  
  const    MATERIALDESCRIPTION = [{
  
      LANGU        :         "EN",
      LANGU_ISO    :          "EN",
      MATL_DESC    :        matkx
  
  }];
  
          client.invoke(
          "BAPI_MATERIAL_SAVEDATA",
          { HEADDATA: headdata ,
            CLIENTDATA: clientdata,
            CLIENTDATAX:clientdatax,
            MATERIALDESCRIPTION: MATERIALDESCRIPTION
           },
          function(err, res) {
              if (err) {
                  return console.error("Error invoking STFC_STRUCTURE:", err);
              }
              console.log("BAPI_MATERIAL_SAVEDATA call result:", res);
          }
      ); 
  });  // Dont comment this one..

})


app.listen(3003,function(){
    console.log('Aws Upload and AI Core Trigger Execution App running at port - 3003')
})