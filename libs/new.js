// Copyright © 2016 The Pennsylvania State University
//
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var async = require('async');
var isRoot = require('is-root');
var which = require('which');
var ask = require('inquirer');
var fs = require('fs');
var path = require('path');
var format = require('util').format;
var semver = require('semver');
var shell = require('shelljs');
var del = require('del');
var chalk = require('chalk');
var npm = require('enpeem');

module.exports = function(program, name) {
    var projectName, projectFolder, projectDesc, projectVer, projectCom, projectCont;
    var tasks = [
        init, prompt, clone, projectSetup, npmInstall
    ];

    var repo = 'https://github.com/ngbolt/ng-bolt-template.git';

    var boltVersion = undefined;

    if(program.template){
        console.info(chalk.green("Using template: "+program.template));
        repo = program.template;
    }

    if(program.bolt){
        console.info(chalk.green("Using ng-bolt version: "+program.bolt));
        boltVersion = program.bolt;
    }


    if(name && validProjectName(name) !== true){
        console.error(chalk.red(validProjectName(name)));
        return;
    }

    async.series(tasks, done);

    function init(cb) {
        if (isRoot()) {
            console.error(chalk.red('Do not run this installer as the root use (sudo).'));
            process.exit(1)
        }

        which('git', function(err) {
            if (err) {
                var error = chalk.red('Git is not installed. Please install git at ') + chalk.yellow('http://git-scm.com/downloads') + chalk.red(' before using this installer.');
                console.error(error);
                process.exit(69);
            }

            cb(null, true);
        })
    }

    function prompt(cb) {
        var questions = [];
        if(!name){
            questions.push(
              {
                  type: 'input',
                  name: 'name',
                  message: 'What is the name of the project? This will become the project directory (no spaces)',
                  validate: validProjectName
              });
        }

        questions.push(
            {
                type: 'input',
                name: 'title',
                message: 'What is the title of the project? This will be the title displayed in your application. (optional)'
            },
            {
                type: 'input',
                name: 'version',
                message: 'What is the project version? (semver)',
                default: '0.1.0',
                validate: function(input) {
                    if (!semver.valid(input)) {
                        return 'This is not a valid version number. Please use semver format.';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'description',
                message: 'What is the project\'s description? (optional)'
            },
            {
                type: 'input',
                name: 'company',
                message: 'Name of the company. (optional)'
            },
            {
                type: 'input',
                name: 'contributors',
                message: 'List project contributors. (separate with commas. optional)'
            }
        );

        ask.prompt(questions).then(function(answers) {
            projectName = name || answers.name;
            projectTitle = answers.title || null;
            projectDesc = answers.description || null;
            projectVer = answers.version;
            projectCom = answers.company || null;
            projectCont = answers.contributers || null;
            projectFolder = path.join(process.cwd(), projectName);

            cb(null, true);
        });
    }

    function validProjectName(candidate){
        var folder = path.join(process.cwd(), candidate);
        if (fs.existsSync(folder)) {
            return 'There is already a folder with that name in this directory.';
        }
        if (candidate.indexOf(" ") != -1) {
            return "The project name should not contain any spaces.";
        }
        return true;
    }

    function clone(cb) {
        var cmd = format('git clone %s %s', repo, projectName);

        console.log(chalk.cyan('Downloading ng-bolt-template...'));

        shell.exec(cmd, function(code, stderr, stdout) {
            if (stderr) {
                process.exit(1);
            }

            console.log(chalk.cyan('Clone successful! Setting up project...'));
            
            process.chdir(projectFolder);

            cb(null, true);
        });
    }
    
    function projectSetup(cb){
        del.sync('.git');

        var pkg = JSON.parse(fs.readFileSync('package.json'));

        var newPkg = {};

        newPkg.name = projectName;
        newPkg.version = projectVer;

        if (projectDesc) {
            newPkg.description = projectDesc;
        }

        if (projectTitle){
            newPkg.title = projectTitle;
        }
        
        if (projectCom) {
            newPkg.author = {};
            newPkg.author.name = projectCom;
        }

        if (projectCont) {
            contributers = projectCont.split(',');
            for (var i = 0; i < contributers.length; i ++) {
                contributers[i].trim();
            }
            newPkg.contributors = contributers;
        }

        newPkg.license = pkg.license;
        newPkg.publishConfig = pkg.publishConfig;
        newPkg.dependencies = pkg.dependencies;
        newPkg.devDependencies = pkg.devDependencies;

        if(boltVersion){
            newPkg.dependencies["ng-bolt"] = boltVersion;
        }

        del.sync('package.json');

        fs.writeFileSync('package.json', JSON.stringify(newPkg, null, 4));

        cb();
    }

    function npmInstall(cb){
        console.log(chalk.green('Installing dependencies...'));

        npm.install({
            dir: projectFolder,
            'cache-min': 999999999,
            logLevel: 'error'
        }, function(err){
            if(err){
                console.error(chalk.red('Failed to install node dependencies.'), err);
                cb(null, false);
            } else {
                cb(null, true);
            }
        });
    }

    function done(err, results) {
        var success = 'Your new ngBoltJS project is set up and ready to go! You can now run ' + chalk.cyan('bolt run ') + 'while inside the ' + chalk.cyan(projectName) + ' folder.';
        var fail = chalk.red('There were some problems when trying to setup your new ngBoltJS project.');

        if (results.indexOf(false) === -1) {
            console.log(success);
        } else {
            console.error(fail);
        }
    }
}
