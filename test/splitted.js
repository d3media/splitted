var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    splitted = require('..');
describe('splitted stream', function () {
    var finishEvents = [],
        readyEvents = [],
        expectedFileMaxSize = 32;
    var expected = '';
    before(function (done) {
        var stream = splitted('test', expectedFileMaxSize),
            i;
        stream.on('chunkFinish', function (filePath) {
            finishEvents.push(filePath);
        });
        for (i = 0; i < 5; i++) {

            chunk = new Array(64 + 1).join('' + i);
            expected += chunk;
            stream.write(chunk);
        }
        stream.write('end', done);
        expected += 'end';
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
    it('should trigger finish events', function () {
        var expected = ['test.0', 'test.1', 'test.2', 'test.3', 'test.4', 'test.5', 'test.6', 'test.7', 'test.8', 'test.9'];
        assert.equal(finishEvents.length, expected.length);
    });
});
