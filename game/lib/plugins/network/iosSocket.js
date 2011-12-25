ig.module('plugins.network.iosSocket')
.requires(
  'impact.game'
)
.defines(function() {

    var IosSocket = ig.Class.extend({
      staticInstantiate: function() {
        if (IosSocket.instance == null) return null;
        else return IosSocket.instance;
      },
      
      nativeObj: null,
      
      callback: {},
      
      connect: function() {
        this.nativeObj = new native.IosSocket;
        this.nativeObj.receive( this.receive.bind( this ) );
        this.nativeObj.disconnect( this.disconnect.bind( this ) );
        this.nativeObj.pause( this.pause.bind( this ) );
        
        return this;
      },
      
      disconnect: function() {
        if ( ig.game.disconnect ) ig.game.disconnect();
      },
      
      pause: function( pause ) {
        if ( ig.game.setPause ) ig.game.setPause( pause );
        this.emit( 'pause', pause );
      },
      
      on: function( name, fn ) {
        this.callback[ name ] = this.callback[ name ] || [];
        this.callback[ name ].push( fn );
      },
      
      emit: function( name, obj ) {
        var json = JSON.stringify( { name: name, obj: obj } );
        this.nativeObj.emit( json );
      },
      
      receive: function( obj ) {
        if ( this.callback[ obj.name ] ) {
          for ( var i = this.callback[obj.name].length; i--; ) this.callback[ obj.name ][i]( obj.obj );
        }
      },
      
      versionUnmatch: function( v ) {
        this.nativeObj.versionUnmatch( v );
      }
      
    });

    IosSocket.instance = null;
    
    if (typeof(io) === 'undefined' && !ios) {
      native = {
        IosSocket: function() { 
          return {
            receive: function() {},
            emit: function() {}
          }
        }
      };

      io = new IosSocket();
    }

    if (ios) io = new IosSocket();

});