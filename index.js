
exports.decode = function (codec) {
  var buffer = null, offset = 0, ended = null

  function parse (cb) {
    var val, bytes = 0
    if(!buffer || offset >= buffer.length)
      return false

    val = codec.decode(buffer, offset)
    bytes = codec.decode.bytes

    if(bytes !== 0) {
      offset += bytes
      if(offset === buffer.length) {
        buffer = null
        offset = 0
      }
    }
    else {
      if(ended) return cb(new Error('Unexpected End of Stream'))
      return false
    }
    cb(null, val)
    return true
  }

  return function (read) {
    return function (abort, cb) {
      if(abort) return read(abort, cb)
      if(parse(cb)) return
      if(ended) return cb(ended)

      read(null, function next (end, data) {
        if(end) {
          ended = end
          return buffer !== null ? parse(cb) : cb(ended)
        }
        if(!buffer) {
          buffer = data
          offset = 0
        }
        else {
          buffer = Buffer.concat([
            offset > 0 ? buffer.slice(offset) : buffer,
            data
          ])
          offset = 0
        }

        if(!parse(cb)) read(null, next)
      })

    }
  }
}

exports.encode = function (codec) {
  return function (read) {
    return function (abort, cb) {
      read(abort, function (end, data) {
        if(end) cb(end)
        else    cb(null, codec.encode(data))
      })
    }
  }
}

exports.duplex = function (stream, codec) {
  return {
    source: pull(stream.source, exports.encode(codec)),
    sink: pull(exports.decode(codec), stream.sink))
  }
}

