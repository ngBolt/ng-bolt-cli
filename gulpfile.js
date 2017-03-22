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

var fs = require('fs');
var gulp = require('gulp');
var bump = require('gulp-bump');
var git = require('gulp-git');
var args = require('get-gulp-args')();

var pkgPath = './package.json';
var type = args.t;

gulp.task('checkout:dev', function(cb){
    git.checkout('development', function(err){
        if (err) {
            throw err;
        }
        cb();
    });
});

gulp.task('bump', ['checkout:dev'], function(){
    if (!type) {
        console.error('A value for "type" is required. Pass "type" as a command line argument: "-t=<type>"');
    } else if (type !== 'major' || type !== 'minor' || type !== 'patch' || type !== 'prerelease') {
        console.error('Invalid value for "type". Valid values are "major", "minor", "patch" or "prerelease".');
    }

    return gulp
        .src(pkgPath)
        .pipe(bump({type: type}))
        .pipe(gulp.dest('./'));
});

gulp.task('commit', ['bump'], function(){
    return gulp
        .src(pkgPath)
        .pipe(git.commit('up version'));
});

gulp.task('push:dev', ['commit'], function(cb){
    git.push('origin', 'development', function(err){
        if (err) {
            throw err;
        }
        cb();
    });
});

gulp.task('checkout:master', ['push:dev'], function(cb){
    git.checkout('master', function(err){
        if (err) {
            throw err;
        }
        cb();
    });
})

gulp.task('merge', ['checkout:master'], function(cb){
    git.merge('development', function(err){
        if (err) {
            throw err;
        }
        cb();
    });
});

gulp.task('push:master', ['merge'], function(cb){
    git.push('origin', 'master', function(err){
        if(err) {
            throw err;
        }
        cb();
    });
});

gulp.task('release', ['push:master'], function(cb){
    var json = JSON.parse(fs.readFileSync('./package.json'));
    console.log('Successfully release version ' + json.version + '. Checking out development.');
    git.checkout('development', function(err){
        if (err) {
            throw err;
        }
        cb();
    });
});