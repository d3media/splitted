[![Build Status](https://travis-ci.org/d3media/splitted.png)](https://travis-ci.org/d3media/splitted)
splitted
==============

A simple chunked stream

## Install 

`$ npm install splitted`

## Usage

	var splitted = require('splitted'),
	    stream = splitted('output.txt', '10m');
	// Get notified when a chunk is full
	stream.on('finish', function (file) {
	    console.log(file);
	});
	stream.write('hello');
	// An output.txt.0 file has been created
## Test

You can run tests with `$ npm test` command.
