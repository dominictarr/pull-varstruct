
var crypto = require('crypto')
var readRandomly = require('pull-randomly-split')

var pull = require('pull-stream')
var tape = require('tape')
var pv = require('../')
var decode = pv.decode
var encode = pv.encode

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

tape('simple', function (t) {

  pull(
    pull.count(100),
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


tape('simple - with fuzz', function (t) {

  var ary = []

  pull(
    pull.count(100),
    pull.map(random),
    pull.through(function (v) { ary.push(v) }),
    encode(struct),
    readRandomly(0, 64),
    decode(struct),
    pull.collect(function (err, _ary) {
      console.log(_ary)
      t.deepEqual(_ary, ary)
      t.end()
    })
  )

})


