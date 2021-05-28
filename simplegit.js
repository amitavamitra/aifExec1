// idea is to put a file from a local directory to a 
// chosen git repo with access.
// The implementation would be to push the 
// generated argoWT and argoST to the AI core git synced repo.
const path = require('path');
path.resolve("./100DaysOfCodeR2/28/");
// const localRepoName = 'C:\\Users\\amit.mitra01@sap.com\\Desktop\\100DaysOfCodeR2\\28\\'

require('simple-git')()
   .init()
   .add('./*')
   .commit("first commit!")
   .addRemote('origin', 'https://github.com/user/repo.git')
   .push('origin', 'master');

const git = require('simple-git')();
const fs = require('fs')
const url = require('url');

this.gitURL = 'https://github.tools.sap/I304524/nodeapp.git';

const localURL = url.parse(this.gitURL);
const localRepoName = (localURL.hostname + localURL.path)
// const localRepoName = (path)
.replace('com', '')
.replace('/', '')
.replace('/', '.')
.replace('.git', '')

this.localPath = `./${localRepoName}`;
this.options = ['--depth', '1'];
this.callback = () => {
    console.log('DONE')
}

if (fs.existsSync(this.localPath)) {
    // something
} else {
    git.outputHandler((command, stdout, stderr) => {
            stdout.pipe(process.stdout);
            stderr.pipe(process.stderr)

            stdout.on('data', (data) => {
                // Print data
                console.log(data.toString('utf8'))
            })

            stderr.out.on('data', (data) => {
                // Print data
                console.log(data.toString('utf8'))
            })


        })
        .clone(this.gitURL, this.localPath, this.options, this.callback)
}