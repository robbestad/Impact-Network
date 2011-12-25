// testen in node v0.6.6 and socket.io v0.8.3

var app = require('http').createServer( handler ), 
    io = require('socket.io').listen( app ), 
    fs = require('fs'),
    url = require('url'),
    
    mime_types = {
      html: { type: 'text/html', mode: 'utf8' },
      js: { type: 'text/javascript', mode: 'utf8' },
      css: { type: 'text/css', mode: 'utf8' },
      png: { type: 'image/png', mode: 'binary' },
      gif: { type: 'image/gif', mode: 'binary' },
      mp3: { type: 'audio/mpeg', mode: 'binary' },
      ogg: { type: 'audio/ogg', mode: 'binary' }
    },
    file_test = new RegExp( '\.(' + (function() {
      var r = '';
      for ( var n in mime_types ) r += n + '|';
      return r.slice( 0, -1 );
    })() + ')$' );

app.listen( 8080 );

// just a simple web server
function handler ( req, res ) {
  var path = url.parse( req.url ).pathname;

  if ( path == '/' ) {
    fs.readFile( __dirname + '/index.html', function( err, data ){
      res.writeHead( 200, { 'Content-Type': 'text/html' } );
      res.write( data, 'utf8' );
      res.end();
    });
  }
  else {
    var file_type = file_test.exec( path );
    
    if ( file_type !== null ) {
      try {
        var file = mime_types[ file_type[1] ];
        
        res.writeHead( 200, { 'Content-Type': file.type } );

        res.write( fs.readFileSync( __dirname + path, file.mode ), file.mode );
        res.end();
      }
      catch (e) { console.warn( 'Could not load: ' + path ); }
    }
    else console.warn( 'Could not identify: ' + path );
  }
}

io.enable( 'browser client minification' );
io.enable( 'browser client etag' );
io.enable( 'browser client gzip' );
io.set( 'log level', 1 );

io.sockets.on( 'connection', function ( socket ) {
  socket.on( 'init', function( m ) {
    socket.broadcast.emit( 'init', m );
  });
  
  socket.on( 'okey', function() {
    socket.broadcast.emit( 'okey' );
  });

  socket.on( 'spawn', function( m ) {
    socket.broadcast.emit( 'spawn', m );
  });
  
  socket.on( 'update', function( m ) {
    socket.broadcast.emit( 'update', m );
  });
  
  socket.on( 'kill', function( m ) {
    socket.broadcast.emit( 'kill', m );
  });
  
  socket.on( 'postName', function( m ) {
    socket.broadcast.emit( 'postName', m );
  });
  
  socket.on( 'disconnect', function () {
    socket.broadcast.emit( 'disconnect' );
  });
  
  socket.on( 'pause', function( m ) {
    socket.broadcast.emit( 'pause', m );
  });

});