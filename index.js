

exports.decode = function (codec) {
  var buffer = null, offset = 0, ended = null

  function parse (cb) {
    var val

    console.log('NEXT', ended, buffer && buffer.length, offset)
    if(!buffer || offset >= buffer.length)
      return false

    try {
      val = codec.decode(buffer, offset)
      offset += codec.decode.bytesRead
      console.log('parsed?', val, offset)
      if(offset >= buffer.length) {
        buffer = null
        offset = 0
      }
    } catch (err) {
      console.log('read more', err)
      if(ended) return cb(err)
      return false
    }
    console.log('parsed:', val)
    cb(null, val)
    return true
  }

  return function (read) {
    return function (abort, cb) {
      if(abort) return read(abort, cb)
      if(parse(cb)) return
      if(ended) return cb(ended)

      read(null, function next (end, data) {
        console.log('next', end, data)
        if(end) {
          ended = end
          console.log('END')
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
