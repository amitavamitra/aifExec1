const express = require('express');
const app = express();

const getSomeThing = () =>{

    return new Promise((resolve, reject) => {
        // fetch something 
        resolve('some data');
         });
};



getSomeThing().then((data)=> {
console.log(data);
});

app.listen(3003,()=>{console.log('Promise')});
