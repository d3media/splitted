var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    chunkedStream = require('..');
describe('chunked stream', function () {
    var finishEvents = [],
        readyEvents = [],
        expectedFileMaxSize = 32;
    before(function (done) {
        var chunk = new Array(64 + 1).join('1'),
            stream = chunkedStream('test', expectedFileMaxSize),
            i = 5,
            j = 10;
        stream.on('finish', function (filePath) {
            finishEvents.push(filePath);
        });
        stream.on('ready', function (writableStream) {
            readyEvents.push(writableStream.path);
        });
        while (i--) {
            stream.write(chunk);
        }
        stream.write('end', done);
    });
    it('should split streams into chunked files', function () {
        var lastFile;
        finishEvents.forEach(function (f) {
            try {
                assert.equal(expectedFileMaxSize, fs.statSync(f).size);
            } catch (err) {
                err.message += ' file ' + f + 'does not meet expected size';
                throw err;
            }
        });
        assert.equal('end'.length, fs.statSync('test.10').size);
    });
    it('should trigger ready events', function () {
        var expected = ['test.0', 'test.1', 'test.2', 'test.3', 'test.4', 'test.5', 'test.6', 'test.7', 'test.8', 'test.9', 'test.10'];
        expected.forEach(function (f) {
            assert(~readyEvents.indexOf(f), f + ' does not exist');
        });
        assert.equal(readyEvents.length, expected.length);
    });
    it('should trigger finish events', function () {
        var expected = ['test.0', 'test.1', 'test.2', 'test.3', 'test.4', 'test.5', 'test.6', 'test.7', 'test.8', 'test.9'];
        expected.forEach(function (f) {
            assert(~readyEvents.indexOf(f), f + ' does not exist');
        });
        assert.equal(finishEvents.length, expected.length);
    });
});
