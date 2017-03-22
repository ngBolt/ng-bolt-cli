#!/usr/bin/env node
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

var program = require('commander');
var shell = require('shelljs');
var fs = require('fs');
var chalk = require('chalk');

program
  .version(chalk.cyan("\nng-bolt-cli: \t") + require('./package.json').version + getBoltVersion())
  .option('-e, --env [env]', "The environment for the gulp build. Valid values are 'development'(default) and 'production'")
  .option('-s, --serve [serve]', "Run a server as part of a gulp build. This is default behavior when [env] is 'development' and [platform] is 'angular'.")
  .option('-b, --beautify [beautify]', "Prevent minification of assets.")
  .option('-t, --template [template]', "Path to the ng-bolt template repository to use with the new command.")
  .option('-v, --bolt [bolt]', "Version of ng-bolt to use in the new project. Defaults to latest.")
  .option('-r, --root [root]', "The path to the root of the ng-bolt app directory relative to the current directory. Defaults to './ng-bolt-app.'")
  .option('-f, --fatal [fatal]', "The error level that will exit the build process. Valid values are 'error'(default), 'warning', 'off'")
;

  // TODO: add 'o' or 'out' flag for build destination.

program
  .command('run [profile]')
  .description('start gulp build with provided profile and watch for changes.')
  .action(function(profile){
    
    profile = profile || 'development';

    var command = 'gulp';
    var flags = getFlags(profile);

    runGulp(profile, command, flags);
  });

program
  .command('clean [profile]')
  .description('clean the build directory.')
  .action(function(profile){

    // Set profile to development by default
    profile = profile || 'development';
    var command = 'gulp clean';
    var flags = getFlags(profile);

    runGulp(profile, command, flags);
  });

program
  .command('build [profile]')
  .description('run gulp build.')
  .action(function(profile){

    // Set profile to development by default
    profile = profile || 'development';
    var command = 'gulp build';
    var flags = getFlags(profile);

    runGulp(profile, command, flags);
  });

program
  .command('deploy <profile>')
  .description('run gulp build and compress assets.')
  .action(function(profile){
    
    program.fatal = 'warning';

    if (!program.env){
      program.env = 'production';
    }
    
    var command = 'gulp deploy';
    var flags = getFlags(profile);    
    
    runGulp(profile, command, flags);
  });

program 
  .command('new [name]')
  .description('Creates a new ngBoltJS project with an interactive setup prompt.')
  .action(function(name){
    require('./libs/new')(program, name);
  });

program
  .command('update')
  .description('updates ng-bolt to latest version')
  .action(function(){

    // Make sure we are in a ng-bolt project
    try {
      var pkg = require(shell.pwd() + '/package.json');
      if (pkg.dependencies['ng-bolt']) {
        shell.exec('npm update ng-bolt');
      } else {
        throw new Error('ng-bolt is not installed in this directory.')
      }
    } catch(e) {
      console.error(chalk.red(e));
    }
  })

program.parse(process.argv);

if (!program.args.length) program.help();

/**
 * Gets flags to append to gulp task command base on CLI arguments
 * 
 * @param {string} profile The used build profile.
 * @return {string} Flags to append to gulp task command.
 */
function getFlags(profile){
  var flags = ' --color --pr ' + profile;
  
  if (program.fatal) {
    flags += ' --fatal ' + program.fatal;
  }
  if (program.env) {
    flags += ' --env ' + program.env;
  }
  if (program.beautify) {
    flags += ' --b ';
  }
  if (program.root) {
    flags += ' --appRoot ' + program.root;
  }

  return flags;
}

/**
 * Gets the filepath of the profile based on the root
 * of the application root.
 * 
 * @param {string} profile The name of the profile file.
 * @return {string} The absolute filepath of the profile.
 */
function getProfilePath(profile){
  var profilePath = '/config/profiles/' + profile + '.json';

  if (program.root) {
    return shell.pwd() + '/' + program.root + profilePath;
  } else {
    return shell.pwd() + profilePath;
  }
}

function runGulp(profile, command, flags) {
  // Get the profile path
  var path = getProfilePath(profile);

  // Check if profile exisits, exit process if not.
  fs.access(path, fs.F_OK, function(err){
    if (err) {
      console.error('ngBoltJS: ' + chalk.red('Run failed! ') + chalk.bold.red(path) + chalk.red(' does not exist or is not accessible.'));
      process.exit(1);
    } else {
      console.log('ngBoltJS: ' + chalk.cyan('Starting gulp using ') + chalk.bold.cyan(profile) + chalk.cyan(' profile.'));

      var gulpfilePath = './node_modules/ng-bolt/gulpfile.js';

      // Look for gulpfile in node_modules, if does not exit we're probably in the 
      // ng-bolt repo and will use the local gulpfile.
      fs.access(gulpfilePath, fs.F_OK, function(err){
        if (err) {
          shell.exec(command + flags);
        } else {
          shell.exec(command + ' --gulpfile ' + gulpfilePath + ' ' + flags);
        }
      });
    }
  });
}

/**
 * Gets the current version of ng-bolt if the
 * package.json for ng-bolt is found in the CWD.
 * Also checks the node_modules folder of the CWD.
 * 
 * @returns {String} The ng-bolt version or an empty string. 
 */
function getBoltVersion(){
  var prefix = chalk.cyan('\nng-bolt: \t');
  try {
    // Look in CWD for ng-bolt package.json
    var rootPkg = require(shell.pwd() + '/package.json');
    if (rootPkg.name == 'ng-bolt') {
      return prefix + rootPkg.version + '\n';
    } else {
      // Look in node_modules for ng-bolt package.json
      var nodePkg = require(shell.pwd() + '/node_modules/ng-bolt/package.json');
      if (nodePkg.name == 'ng-bolt') {
        return prefix + nodePkg.version + '\n';
      }
      return '\n';
    }
  } catch(e) {
    return '\n';
  }
}