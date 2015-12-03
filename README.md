# `checkenv` - Check Your Environment

[![Build Status](https://travis-ci.org/inxilpro/node-checkenv.svg)](https://travis-ci.org/inxilpro/node-checkenv) [![Dependency Status](https://david-dm.org/inxilpro/node-checkenv.svg)](https://david-dm.org/inxilpro/node-checkenv)

This module lets you define the environmental variables your application relies on in `env.json` and then provides a method to check for these variables at application launch.

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

![Screen Shot](http://snaps.rchy.net/env.json_-_jobs.api.nachi.org_-_DevelopmentSitesjobs.api.nachi.org_2015-12-03_15-10-37.jpg)

If you would like to handle errors yourself, `check` takes an optional `pretty` argument which causes it to throw errors instead of printing an error message.  This will only result in an error being thrown on missing required variables.

## Configuration

Your JSON file should define the environmental variables as keys, and either a boolean (required) as the value, or a configuration object with any of the options below.

### JSON
``` json
{
  "NODE_ENV": {
    "description": "This defines the current environment",
  },
  "PORT": {
    "required": false,
    "description": "This is the port the API server will run on"
  },
  "NODE_PATH": true,
  "DEBUG": false
}
```

### Options

#### `required`

Defines whether or not this variable is required.  By default, all variables are required, so you must explicitly set them to optional by setting this to `false`

#### `description`

Describes the variable and how it should be used. Useful for new developers setting up the project, and is printed in the error output if present.

## Planed Enhancements

There are two major enhancements in the pipeline:

  1. Default values
  2. Value validation (type, enum, regex)

## Change Log

### 1.0.5
  - Passes tests for node 0.10 through 5.1

### 1.0.0
  - Initial release