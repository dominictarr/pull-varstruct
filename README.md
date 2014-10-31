# pull-varstruct

stream encode/decode varstructs

## example

``` js
var varstruct = require('varstruct')
var pv = require('pull-varstruct')

var struct = varstruct({
  //32 bit Big Engian integer
  id: varstruct.UInt32,
  //a buffer 0 - 255 bytes long
  name: varstruct.varbuf(varstruct.byte)
})

//if duplex is a tcp, etc stream, that we want to write
//object to.
function serialize(duplex) {
  return pv.duplex(duplex, struct)
}
```

## api

### pv.encode(codec)

transform stream that takes an object stream and outputs a binary stream.

### pv.decode(codec)

transform stream that takes a binary stream and outputs an object stream.

### pv.duplex(stream, codec)

take a duplex object stream and return an binary duplex stream, encoded/decoded
with `codec`.

## License

MIT
