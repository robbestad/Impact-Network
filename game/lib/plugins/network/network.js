ig.module('plugins.network.network')
.requires(
  'impact.game',
  'impact.entity',
  'plugins.network.entity',
  'plugins.network.iosSocket'
)
.defines(function() {

  var Network = ig.Class.extend({
    staticInstantiate: function() {
      if ( Network.instance == null ) return null;
      else return Network.instance;
    },
    
    isServer: false,
    
    queue: [],
    lazyQueue: {},
    
    // we don't want to get old updates
    lastUpdateTimestamp: false,
    
    // the lazy timer
    // this runs every 2, or the time you set, secondsand updates the entitites
    // that have the lazy update property
    lazyTimer: null,
    lazyTimerTime: 2,
    
    init: function() {
      Network.instance = this;
      
      this.lazyTimer = new ig.Timer();
      
      this.socket = io.connect( '/' );

      // our dice. decides if we are server or the other is
      this.randServer = Math.random() * 100;

      this.socket.on( 'init', function( data ) {
        // Check if versions match
        if ( data.version != ig.game.version ) {
          if ( ios ) network.socket.versionUnmatch( data.version > ig.game.version );
          else alert( 'Wrong Version!' );
          return;
        }

        network.isServer = data.dice > network.randServer;

        if ( network.isServer ) {
          network.socket.emit( 'okey' );

          ig.game.startGame();
        }
      });
      
      // the client gets this when the game starts
      this.socket.on( 'okey', function( data ) {
        ig.game.startGame();
      });
      
      this.socket.on( 'spawn', function( data ) {
        var spawnY, ent, 
            id = data.id,
            o, 
            hasShip = false;
        
        // id is saved above, don't need it in data
        if ( id !== undefined && id !== null ) delete data.id;
        
        data.sendOnSpawn = false;
        data.sendByNetwork = true;

        // spawn
        ent = ig.game.spawnEntity( window[data.className], data.pos.x, data.pos.y, data );
        ig.game.sortEntities();

        // fix name
        if ( id !== undefined && id !== null ) network.socket.emit( 'postName', { id: id, name: ent.name } );
      });
      
      this.socket.on( 'update', function( serverData ) {
        
        if ( this.lastUpdateTimestamp !== false && this.lastUpdateTimestamp > serverData.time ) return;
        this.lastUpdateTimestamp = serverData.time;
        
        for ( var i = serverData.data.length; i--; ) {
          var data = serverData.data[ i ],
              entity = ig.game.getEntityByName( data.name ),
              obj;
          
          if ( entity !== undefined && entity !== null ) {
            for ( obj in data.obj ) entity[ obj ] = data.obj[ obj ];
          }
        }
      });
      
      this.socket.on( 'kill', function( data ) {
        if ( data.name == '' ) return;
        
        var ent = ig.game.getEntityByName( data.name );
        
        if ( ent && !ent._killed ) ent.kill();
      });
      
      this.socket.on( 'postName', function( data ) {
        for ( var i = ig.game.entities.length; i--; ) {
          if ( ig.game.entities[ i ].id == data.id ) {
            ig.game.entities[ i ].name = data.name;
            ig.game.namedEntities[ data.name ] = ig.game.entities[ i ];
            
            return;
          }
        }
      });
      
      this.socket.on( 'pause', function( pause ) {
        ig.game.setPause( pause );
      });
      
      this.socket.on( 'disconnect', function() {
        if ( ig.game.disconnect ) ig.game.disconnect();
      });

    },
    
    start: function() {
      this.socket.emit( 'init', { dice: this.randServer, version: ig.game.version } );
    },
    
    restart: function() {
      this.isServer = false;
      this.randServer = Math.random() * 100;
    },
    
    pause: function( pause ) {
      if ( ig.game.setPause ) ig.game.setPause( pause );
      this.socket.emit( 'pause', pause );
    }
  });

  Network.instance = null;
  network = new Network();

  // get into main loop
  ig.Game.inject({
    
    version: 1,
    
    update: function() {
      this.parent();
      
      if ( network.lazyTimer.delta() > 0 ) {
        for ( var entity_name in network.lazyQueue ) {
          var entity = ig.game.getEntityByName( entity_name );
              changedProperties = false;
          
          if ( entity ) {
            changedProperties = entity._changedValues( entity.lazyUpdateProperties );
            
            if ( changedProperties ) network.queue.push( { name: entity.name, obj: changedProperties } )
          }
        }
        
        network.lazyTimer.set( this.lazyTimerTime );
      }
      
      if ( network.queue.length > 0 ) {
        network.socket.emit( 'update', { time: Date.now(), data: network.queue } );
        network.queue = [];
      }
    }
  });

});