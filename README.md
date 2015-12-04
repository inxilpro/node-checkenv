# `checkenv` - Check Your Environment

[![npm version](https://badge.fury.io/js/checkenv.svg)](https://www.npmjs.com/package/checkenv) [![Build Status](https://travis-ci.org/inxilpro/node-checkenv.svg)](https://travis-ci.org/inxilpro/node-checkenv) [![Coverage Status](https://coveralls.io/repos/inxilpro/node-checkenv/badge.svg?branch=master&service=github)](https://coveralls.io/github/inxilpro/node-checkenv?branch=master) [![Dependency Status](https://david-dm.org/inxilpro/node-checkenv.svg)](https://david-dm.org/inxilpro/node-checkenv)

A modern best-practice is to [store your application's configuration in environmental variables](http://12factor.net/config).  This allows you to keep all config data outside of your repository, and store it in a standard, system-agnotic location.  Modern build/deploy/development tools make it easier to manage these variables per-host, but they're still often undocumented, and can lead to bugs when missing.

This module lets you define all the environmental variables your application relies on in an `env.json` file.  It then provides a method to check for these variables at application launch, and print a help screen if any are missing.

## Installation

``` bash
$ npm i -S checkenv
```

## Usage

First, define a JSON file called `env.json` in your project root (see below).  Then, add the following line to the top of your project's entry file:

``` js
require('checkenv').check();
```

By default, `checkenv` will print a pretty error message and call `process.exit(1)` if any required variables are missing.  It will also print an error message if optional variables are missing, but will not exit the process.

![Screen Shot](https://cloud.githubusercontent.com/assets/21592/11595855/8f5cb9d6-9a7f-11e5-9128-376f91fd6d1a.jpg)

If you would like to handle errors yourself, `check` takes an optional `pretty` argument which causes it to throw errors instead of printing an error message.  This will only result in an error being thrown on missing required variables.

``` js
try {
  require('checkenv').check(false);
} catch (e) {
  // Do something with this error
}
```

## Configuration

Your JSON file should define the environmental variables as keys, and either a boolean (required) as the value, or a configuration object with any of the options below.

### JSON
``` json
{
  "NODE_ENV": {
    "description": "This defines the current environment",
    "validators": [{
      "name": "in",
      "options": ["development", "testing", "staging", "production"]
    }]
  },
  "PORT": {
    "description": "This is the port the API server will run on",
    "default": 3000
  },
  "NODE_PATH": true,
  "DEBUG": {
    "required": false,
    "description": "If set, enables additional debug messages"
  }
}
```

### Options

#### `required`

Defines whether or not this variable is required.  By default, all variables are required, so you must explicitly set them to optional by setting this to `false`

#### `description`

Describes the variable and how it should be used. Useful for new developers setting up the project, and is printed in the error output if present.

#### `default`

Defines the default value to use if variable is unset. Implicitly sets `required` to `false`.

## Planed Enhancements

There is one major enhancements in the pipeline:

  1. Value validation (type, enum, regex)

### See Also

If you like this module, you may also want to check out:

  - [`dotenv`](https://github.com/motdotla/dotenv) Load missing environmental variables from `.env`
  - [`app-root-path`](https://github.com/inxilpro/node-app-root-path) Automatically determine 
    the root path for the current application
  - [`enforce-node-path`](https://github.com/inxilpro/enforce-node-path) Enforce the usage of 
    the `NODE_PATH` environmental variable

## Change Log

### 1.1.1
  - Prints default value in help

### 1.1.0
  - Added support for default values
  - Added support to change filename via `setFilename()`

### 1.0.6
  - Bugfix — please do not use versions before 1.0.6

### 1.0.5
  - Passes tests for node 0.10 through 5.1

### 1.0.0
  - Initial release
