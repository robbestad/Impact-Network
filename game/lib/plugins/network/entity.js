ig.module('plugins.network.entity')
.requires(
  'impact.game',
  'impact.entity'
)
.defines(function() {

  ig.Entity.inject({
    sendByNetwork: false,
    updateWhilePause: false,
    sendOnSpawn: false,
    sendOnUpdate: false,
    lazyUpdate: false,
    
    init: function( x, y, s ) {
      if ( s.sendByNetwork && this.networkInit ) {
        var preInit = this.networkInit( x, y, s );
        if ( preInit !== undefined ) {
          if ( preInit.x !== undefined ) x = preInit.x;
          if ( preInit.y !== undefined ) y = preInit.y;
          if ( preInit.settings !== undefined ) s = ig.merge( s, preInit.settings );
        }
      }
      
      this.parent( x, y, s );
      
      if ( this.updateFromClient && this.sendByNetwork ) {
        this.sendOnUpdate = false;
      }
      
      this.sendOnUpdate = ( this.sendOnUpdate && network.isServer ) || ( this.sendOnUpdate && this.updateFromClient );
      this.lazyUpdate = this.lazyUpdate && network.isServer;

      if ( network.isServer ) this.name = this.id;

      if ( this.sendOnSpawn ) {
        var _s = {};

        this.spawnProperties = this.spawnProperties || [];
        this.spawnProperties.push( 'name', 'className', 'pos' );

        if ( !network.isServer ) this.spawnProperties.push( 'id' );

        for ( var i = this.spawnProperties.length; i--; ) {
          _s[ this.spawnProperties[ i ] ] = this[ this.spawnProperties[ i ] ];
        }

        network.socket.emit( 'spawn', _s );
      }
      
      if ( this.sendOnUpdate ) {
        this._makeOldValues( this.updateProperties );
      }
      
      if ( this.lazyUpdate ) {
        this._makeOldValues( this.lazyUpdateProperties );
        network.lazyQueue[ this.name ] = this.lazyUpdateProperties;
      }
    },
    
    _makeOldValues: function( props ) {
      for ( var i = props.length; i--; ) {
        this[ 'old_' + props[ i ] ] = null;
      }
    },
    
    _changedValues: function( props ) {
      var _changed = false,
          obj = {};
      
      for ( var i = props.length; i--; ) {
        var prop = props[i],
            value = false;
        
        // check if val is entity
        if ( typeof this[ prop ] === 'object' && this[ prop ].name !== undefined && this[ prop ].name !== null ) {
          value = this[ prop ].name;
        }
        
        if ( !value ) value = this[ prop ];

        if ( typeof this[ prop ] === 'object' ) {
          var isSame = this._checkForSameObject( this[ prop ], this[ 'old_' + prop ] );
          
          if ( prop == 'vel' ) console.log( isSame, this[ prop ].x, this[ 'old_' + prop ] && this[ 'old_' + prop ].x );
          
          if ( !isSame ) {
            obj[ prop ] = value;
            _changed = true;
          }
        }
        else if ( this[ 'old_' + prop ] !== null && this[ 'old_' + prop ] !== value ) {
          obj[ prop ] = value;
          _changed = true;
        }
        
        this[ 'old_' + prop ] = value;
      }
      
      return ( _changed ) ? obj : false;
    },
    
    _checkForSameObject: function( newObj, oldObj ) {
      for ( var o in oldObj ) {
        if ( newObj[ o ] === undefined ) return false;
        if ( typeof oldObj[ o ] === 'object' ) {
          if ( !this._checkForSameObject( newObj[ o ], oldObj[ o ] ) ) return false;
        }
        else if ( oldObj[ o ] !== newObj[ o ] ) return false;
      }

      return true;
    },
    
    update: function() {
      this.parent();

      if ( this.sendOnUpdate ) {
        var _changedProperties = this._changedValues( this.updateProperties );
        
        if ( _changedProperties ) network.queue.push( { name: this.name, obj: _changedProperties } );
      }
    },
    
    kill: function() {
      if ( network.isServer || this.updateFromClient ) {
        if ( this.lazyUpdate ) {
          delete network.lazyQueue[ this.name ];
        }
        
        this.parent();
        
        if ( ( this.sendOnSpawn || this.sendByNetwork ) && !this.dontSendOnKill ) {
          network.socket.emit( 'kill', { name: this.name } );
        }
      }
      else {
        if ( !this.sendByNetwork || this.dontSendOnKill ) this.parent();
      }
    }
  });

});