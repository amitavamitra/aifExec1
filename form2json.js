const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
var jdata = "";
var data = "";
app.get('/' , function(req,res){
    res.render('yaml', {jdata:data});
})
app.post('/', function(req,res){
    // get all inputs from the form and their labels..
    let argoWT = {
        apiVersion: req.body.apiVersion,
        kind: req.body.kind,
        metadata:{
            name: req.body.meta_name,
            generateName: req.body.generateName,
            annotations: {
                'scenarios.ai.sap.com/description':req.body.scenarios_description,
                'scenarios.ai.sap.com/name':req.body.scenarios_name,
                'executables.ai.sap.com/name': req.body.executables_name,
                'executables.ai.sap.com/description': req.body.executables_description,
                'artifacts.ai.sap.com/training-data.kind': req.body.artifacts_datakind,
                'artifacts.ai.sap.com/model.kind': req.body.artifacts_modelkind
                 },
            labels: {
                'ai.sap.com/version':req.body.ai_version,
                'scenarios.ai.sap.com/id': req.body.scenarios_id
            },
        },
        spec:{
            'imagePullSecrets':[{
            'name':req.body.docker_secret
            }],
            'entrypoint':req.body.entrypoint
        }
            
        }    

 
const fs = require('fs');

let data = JSON.stringify(argoWT);  

fs.writeFileSync('argoCrud.json', data, finished);

console.log(data);
function finished(err)
{
    console.log('success');
}

const YAML = require('yaml');
const writeYamlFile = require('write-yaml-file')
const doc = new YAML.Document();
doc.contents = argoWT;

writeYamlFile('argo.yaml', doc.contents).then(() => {
    console.log('done')
  })

// read.js
const yaml = require('js-yaml');

try {
    let fileContents = fs.readFileSync('argo.yaml', 'utf8');
    let data = yaml.load(fileContents);

    console.log(data);
} catch (e) {
    console.log(e);
}



// res.write(data);
// res.send();
res.redirect('/');

});
app.listen(3003,function(){
    console.log('Form to Json is running at port 3003');
})