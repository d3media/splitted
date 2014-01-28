var fs = require('fs'),
    byt = require('byt'),
    util = require('util'),
    Writable = require('stream').Writable;

function ChunkedStream(_file, _size, nameFn) {
    if (!(this instanceof ChunkedStream)) {
        return new ChunkedStream(_file, _size);
    }

    function consecutiveName(file) {
        return file + '.' + consecutiveName.chunks++;
    }
    consecutiveName.chunks = 0;
    Writable.call(this);
    this.nextFile = nameFn || consecutiveName;
    this.file = _file;
    this.size = byt(_size || '50m');
    this._createWriteStream();
}
module.exports = ChunkedStream;
util.inherits(ChunkedStream, Writable);
ChunkedStream.prototype._createWriteStream = function () {
    var self = this;
    this.currFile = self.nextFile(self.file);
    this.writer = fs.createWriteStream(this.currFile, {
        flags: 'a+'
    });
    this.writer.on('error', function (err) {
        err.currentFile = this.currFile;
        self.emit('error', err);
    });
    var finish = function (file) {
        this.emit('finish', file);
    }.bind(this, self.currFile);
    this.writer.on('finish', finish);
    this.writer.once('open', function () {
        fs.stat(self.currFile, function (err, st) {
            if (err) {
                return self.emit('error', err);
            }
            self.writer.size = st.size;
            self.emit('ready', self.writer);
        });
    });
};

function w(chunk, encoding, cb) {
    this.writer.write(chunk, encoding);
    this.writer.size += chunk.length;
    cb();
}
ChunkedStream.prototype._write = function (chunk, encoding, cb) {
    var overflow;
    var self = this;
    if (undefined === this.writer.size) {
        return this.once('ready', function () {
            self._write(chunk, encoding, cb);
        });
    }
    overflow = (this.writer.size + chunk.length) - this.size;
    if (overflow <= 0) {
        w.call(this, chunk, encoding, cb);
        return;
    } else {
        w.call(this, chunk.slice(0, chunk.length - overflow), encoding, function () {
            self._chunk();
            return self.once('ready', function () {
                self._write(chunk.slice(chunk.length - overflow), encoding, cb);
            });
        });
    }
};
ChunkedStream.prototype._chunk = function () {
    var self = this,
        closedChunkName = self.currFile;
    this.writer.end();
    this.chunks++;
    self._createWriteStream();
};
