# App Root Path Module

[![Dependency Status](https://david-dm.org/inxilpro/node-checkenv.svg)](https://david-dm.org/inxilpro/node-checkenv)

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

## Config file format

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

### Config options

#### `required`

Defines whether or not this variable is required.  By default, all variables are required, so you must explicitly set them to optional by setting this to `false`

#### `description`

Describes the variable and how it should be used. Useful for new developers setting up the project, and is printed in the error output if present.

## Change Log

### 1.0.0
  - Initial release