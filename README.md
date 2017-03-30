# `checkenv` - Check Your Environment

[![npm version](https://badge.fury.io/js/checkenv.svg)](https://www.npmjs.com/package/checkenv) [![Build Status](https://travis-ci.org/inxilpro/node-checkenv.svg)](https://travis-ci.org/inxilpro/node-checkenv) [![Coverage Status](https://coveralls.io/repos/inxilpro/node-checkenv/badge.svg?branch=master&service=github)](https://coveralls.io/github/inxilpro/node-checkenv?branch=master) [![Dependency Status](https://david-dm.org/inxilpro/node-checkenv.svg)](https://david-dm.org/inxilpro/node-checkenv)

A modern best-practice is to [store your application's configuration in environmental variables](http://12factor.net/config).  This allows you to keep all config data outside of your repository, and store it in a standard, system-agnostic location.  Modern build/deploy/development tools make it easier to manage these variables per-host, but they're still often undocumented, and can lead to bugs when missing.

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

#### `validators`

An array of validators that the variable must pass.  See [validator.js](https://github.com/chriso/validator.js) for details about all validators.  Format for each validator is:

``` javascript
{
  /* ... */
  "validators": [
    "validator name", // Option-less validators can be passed as strings
    { // Validators w/ options must be passed as objects
      "name": "validator name",
      "options": options // Option format varies, see below
    }
  ]
  /* ... */
}
```

Possible validators (see [validator.js](https://github.com/chriso/validator.js) for details):

  - `contains` — `options` should be a string with what the value should contain
  - `equals` — `options` should be a string of the exact value
  - `before` — `options` should be a date
  - `after` — `options` should be a date
  - `alpha`
  - `alphanumeric`
  - `ascii`
  - `base64`
  - `boolean`
  - `date`
  - `decimal`
  - `fqdn`
  - `float` — `options` MAY be an object with `min` or `max` properties
  - `hex-color`
  - `hexadecimal`
  - `ip4` — same as `ip` with `"options": 4`
  - `ip6` — same as `ip` with `"options": 6`
  - `ip` — `options` MAY be number (`4` or `6`)
  - `iso8601`
  - `enum` — alias for `in`
  - `in` — `options` MUST be an array of possible values
  - `int` — `options` MAY be an object with `min` or `max` properties
  - `json`
  - `length` — `options` MUST be an object with `min`, `max` or both
  - `lowercase`
  - `mac-address`
  - `numeric`
  - `url`
  - `uuid3` — same as `uuid` with `"options": 3`
  - `uuid4` — same as `uuid` with `"options": 4`
  - `uuid5` — same as `uuid` with `"options": 5`
  - `uuid` — `options` MAY be a number (`3`, `4` or `5`)
  - `uppercase`
  - `regex` — alias for `matches`
  - `regexp` — alias for `matches`
  - `matches` — `options` MUST be either a string representing a regex, or an array in the format `["regex", "modifiers"]`

### See Also

If you like this module, you may also want to check out:

  - [`dotenv`](https://github.com/motdotla/dotenv) Load missing environmental variables from `.env`
  - [`app-root-path`](https://github.com/inxilpro/node-app-root-path) Automatically determine 
    the root path for the current application
  - [`enforce-node-path`](https://github.com/inxilpro/enforce-node-path) Enforce the usage of 
    the `NODE_PATH` environmental variable

## Change Log

### 1.2.2
  - Better handling of syntax errors in `env.json` (thanks yalcindo!)

### 1.2.0
  - Validation (via [validator.js](https://github.com/chriso/validator.js))

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
