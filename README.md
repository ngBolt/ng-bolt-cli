# ngBoltJS CLI

This is the command-line interface for the [ngBoltJS](https://github.com/ngbolt/ng-bolt) Application Framework. It can setup a new ngBoltJS project, run an ngBoltJS application in a development environment and deploy to a production environment.

## Requirements

You'll need to have the following software installed to get started.

* [Node.js](http://nodejs.org) (LTS): Use the installer provided on the NodeJS website for your OS.
    * After Node is installed, run `npm --version`. If the version is less than 3.0, run `npm install -g npm` to update.
    * With NPM up to date, run `[sudo] npm install -g gulp` to install [GulpJs](http://gulpjs.com).
* [Git](http://git-scm.com/downloads): Use the installer for your OS.
    * Windows users can also try [Git for Windows](http://git-for-windows.github.io/).
    * Bitbucket users can also use [SourceTree](https://www.sourcetreeapp.com) which will install `git` and give you access to ngBoltJS repos.

## Installing

```bash
$ npm install -g ng-bolt-cli
```

This will add the `bolt` command to your system.
Check that the CLI was successfully installed by running `bolt -V`. You should see version **1.3.0** or higher.

### Special Instructions for Windows Users

A dependency of ngBoltJS requires the node package node-gyp which may cause [issues](https://github.com/nodejs/node-gyp/issues/629#issuecomment-153196245) for some Windows users. Follow the steps below to remedy:

1. Update npm to 3.10.8+ if necessary. You will need to uninstall Node using the Control Panel and reinstall to update NPM.

To check your current version of npm run:
```bash
npm --version
```
2. Install [VC++ Build Tools](http://landinghub.visualstudio.com/visual-cpp-build-tools), choose **Custom Install**, and select both Windows 8.1 and Windows 10 SDKs. Windows 7 also requires [.NET Framework 4.5.1](https://www.microsoft.com/en-us/download/details.aspx?id=40779).

3. Install [Python 2.7](https://www.python.org/download/releases/2.7/), and add it to your PATH:

```bash
npm config set python python 2.7
```

4. Configure NPM:

```bash
npm config set msvs_version 2015 -  -global
```

## Usage

```bash
$ bolt [flags] [command]
```


## Commands

### New

Set up a new ngBoltJS project. *Run the command while inside the directory you want to create your new project directory.*

```bash
$ bolt new
```

### Run

While inside your project's folder, run gulp build with provided `profile` and watch for changes. Profile defaults to *development*.

```bash
$ bolt [profile] [flags] run
```


### Deploy

While inside your project's folder, run gulp build with provided `profile` and compress assets for deployment.

```bash
$ bolt <profile> [flags] deploy
```


## Available Flags

* `-h`, `--help` Output usage information.
* `-V`, `--version` Output the version number.
* `-f`, `--fatal [value]` The error level that will exit the build process. Valid values are *error* (default), *warning* and *off*.
* `-p`, `--platform [value]` The platform that the app will be deployed to. Valid values are *angular* (default), *rails*, *grails* and *cordova*.
* `-e`, `--env [value]` The environment for the gulp build. Valid values are *development* (default) and *production*.
* `-s`, `--serve [boolean]` Run a server as part of a gulp build. This is default behavior when `env` is *development* and `platform` is *angular*.
* `-b`, `--beautify [boolean]` Prevent minification of assets.