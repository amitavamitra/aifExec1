const YAML = require('yaml');
const fs = require('fs');

const writeYamlFile = require('write-yaml-file')

const jobj = require('./argoCrud.json');

let jsonObject = 
[{
    description: "The description",
    id: 4265019,
    parameters: [{
        label1: "data1",
        label2: "data2"
    }]
},
{
    description: "The description 2",
    id: 4265020,
    parameters: {
        label3: "data3",
        label4: "data4"
    }
}];

const doc = new YAML.Document();
doc.contents = jobj;

console.log(doc.toString());

writeYamlFile('argo.yaml', doc.contents).then(() => {
  console.log('done')
})

// https://codepen.io/jlengstorf/pen/rNMpJNy


