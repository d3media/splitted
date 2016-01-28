[![Build Status](https://travis-ci.org/d3media/splitted.png)](https://travis-ci.org/d3media/splitted)
splitted
==============

A simple chunked file stream

## Install 

`$ npm install splitted`

## Usage

As a library
```
var splitted = require('splitted'),
    stream = splitted('output.txt', '10m');
// Get notified when a chunk is full
stream.on('chunkFinish', function (path) {
    console.log('chunk', path);
});
stream.write('hello');
// An output.txt.0 file has been created
```
Or as a standalone executable
```
$ npm install -g splitted
$ splitted <some-file.txt some-file-splitted.txt --size 400k
# will output some-file-splitted.txt.0..some-file-splitted.txt.N files. 
```


