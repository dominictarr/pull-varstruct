
var crypto = require('crypto')

var pull = require('pull-stream')
var tape = require('tape')
var decode = require('../').decode

var varstruct = require('varstruct')

var struct = varstruct({
  random: varstruct.varint,
  length: varstruct.varint,
  buffer: varstruct.varbuf(varstruct.varint)
})

var n = 0
function random () {
  var l =~~(Math.random()*40)
  var b = new Buffer(l)
  b.fill(++n)
  return {
    random: ~~(Math.random()*100000000),
    buffer: b,
    length: l
  }
}

function readRandom () {
  var buffer, ended
  return function (read) {
    return function (abort, cb) {
      if(abort) return read(abort, cb)
      if(ended) return cb(ended)
      read(null, function (end, data) {
        if(end) {
          ended = end
          if(buffer.length)
            return cb(null, buffer)
          return cb(ended)
        }
        //copy twice, this isn't efficient,
        //but this is just for testing.
        if(buffer)
          buffer = Buffer.concat([buffer, data])
        else
          buffer = data

        var offset =  ~~(Math.random() * buffer.length)
        data = buffer.slice(0, offset)
        buffer = buffer.slice(offset)
        cb(null, data)
      })
    }
  }
}

tape('simple', function (t) {

  pull(
    pull.count(1),
    pull.map(random),
    pull.collect(function (err, ary) {
      var buffer = Buffer.concat(ary.map(function (v) {
          return struct.encode(v)
        }))

      var o = ~~(Math.random()*buffer.length)

      pull(
        pull.values([buffer.slice(0, o), buffer.slice(o)]),
        decode(struct),
        pull.through(console.log),
        pull.collect(function (err, _ary) {
          console.log(_ary)
          t.deepEqual(_ary, ary)
          t.end()
        })
      )
    })
  )

})
