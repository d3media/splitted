[![Build Status](https://travis-ci.org/d3media/chunked-stream.png)](https://travis-ci.org/d3media/chunked-stream)
chunked-stream
==============

A simple chunked stream

## Install 

`$ npm install chunked-stream`

## Usage

	var chunkedStream = require('chunked-stream'),
	    stream = chunkedStream('output.txt', '10m');
	// Get notified when a chunk is full
	stream.on('finish', function (file) {
	    console.log(file);
	});
	stream.write('hello');
	// An output.txt.0 file has been created
## Test

You can run tests with `$ npm test` command.
