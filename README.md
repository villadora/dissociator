# Dissociator [![NPM version](https://badge.fury.io/js/dissociator.svg)](http://badge.fury.io/js/dissociator) [![Build Status](https://travis-ci.org/villadora/dissociator.svg?branch=master)](https://travis-ci.org/villadora/dissociator) [![Dependency Status](https://gemnasium.com/villadora/dissociator.svg)](https://gemnasium.com/villadora/dissociator)

A router for express based on [routington](https://github.com/jonathanong/routington)

## Install

```bash
$ npm install dissociator --save
```

## Usage

```js
var dissociator = require('dissociator');
var router = dissociator();

// middleware
router.use('/page', function(req, res, next) {

});

router.post('/post|page/:controller', function(req, res) {

});

router.get('/page/:id(\\w{3,30})', function(req, res) {

});

var app = require('express')();

app.use(router.handle);
```

## Licence

MIT
<!-- do not want to make nodeinit to complicated, you can edit this whenever you want. -->
