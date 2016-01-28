'use strict';
var fs = require('fs'),
    byt = require('byt'),
    util = require('util'),
    async = require('async'),
    Writable = require('stream').Writable;

function fileName(chunkNumber, file) {
    return file + '.' + chunkNumber;
}

function makeNextFileName(file) {
    var chunk = 0;
    return function () {
        return fileName(chunk++, file);
    }
}

function ChunkedStream(path, maxSize, nameFn) {
    if (!(this instanceof ChunkedStream)) {
        return new ChunkedStream(path, maxSize, nameFn);
    }

    if (!path) {
        throw new Error('path is required');
    }
    Writable.call(this);
    this.nextFileName = nameFn || makeNextFileName(path);

    this.maxSize = byt(maxSize || '50m');
    this.bytesWritten = 0;
    this.queue = async.queue(function (w, cb) {
        w(function (err) {
            if (err) {
                cb(err);
            } else {
                cb();
            }
        });
    }, 1);
}
module.exports = ChunkedStream;
util.inherits(ChunkedStream, Writable);
var total = 0;
ChunkedStream.prototype._write = function _write(chunk, encoding, cb) {
    var self = this;
    var pending = chunk.length;
    var offset = 0;
    if (!this._workingStream) {
        this.nextChunk();
    }

    function w(callback) {
        function next(err) {
            var slice;

            if (err) {
                return callback(err);
            }
            if (pending <= 0) {
                return callback();
            }

            if (self._workingStream.bytesWritten >= self.maxSize) {
                self.nextChunk();
            }
            slice = Math.min((chunk.length - offset), self.maxSize)

            self._workingStream.write(chunk.slice(offset, offset + slice), encoding, next);

            self.bytesWritten += slice;
            pending -= slice;
            offset += slice;

        }
        return next();
    }
    this.queue.push(w, function (err) {
        if (!cb) {
            return;
        }
        if (err) {
            return cb(err);
        }
        return cb();
    });
    return true;
};
ChunkedStream.prototype.nextChunk = function nextChunk() {
    var self = this;
    var nextFileName = self.nextFileName();
    if (self._workingStream) {
        self._workingStream.end();
    }
    self._workingStream = fs.createWriteStream(nextFileName);
    self._workingStream.on('finish', function () {
        self.emit('chunkFinish', this.path);
    });
};
