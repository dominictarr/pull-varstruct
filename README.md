# pull-varstruct

stream encode/decode varstructs

## example

``` js
var varstruct = require('varstruct')

var struct = varstruct({
  //32 bit Big Engian integer
  id: varstruct.UInt32,
  //a buffer 0 - 255 bytes long
  name: varstruct.varbuf(varstruct.byte)
})

//if duplex is a tcp, etc stream, that we want to write
//object to.
function serialize(duplex) {
  return {
    //encode objects going into the duplex's sink.
    sink: pull(pv.encode(struct), duplex.sink),

    //decode objects coming out of the duplex's source
    source: pull(duplex.source, pv.decode(struct))
  }
}
```


## License

MIT
