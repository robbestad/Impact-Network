ig.module( 
  'game.main' 
)
.requires(
  'impact.game'

 ,'plugins.network.network'

 ,'plugins.button'
 
 ,'game.entities.button-connect'
 ,'game.entities.button-respawn'

 ,'game.entities.player'

 ,'game.levels.untitled'

 // if you want to build the iOS Version, decomment this
 // ,'plugins.ios.ios'
)

.defines(function(){
  
  // This is a little nasty way to implement a pause.
  ig.System.inject({
    
    run: function() {
      if ( !ig.game.pause ) {
        ig.Timer.step();
        this.tick = this.clock.tick();
      }

      this.delegate.run();
      ig.input.clearPressed();

      if ( this.newGameClass ) {
        this.setGameNow( this.newGameClass );
        this.newGameClass = null;
      }
      
      if ( ios ) this.context.present();
    }
    
  });
  
  MyGame = ig.Game.extend({

    // Version Number. Get checked on connection with other peer if both are the same.
    // is a lot more important in the iOS Version
    version: 1,

    // if both peers are connected and the game is started this will be true
    running: false,
    // you can set this to true to totaly pause the game
    pause: false,
    
    // game related stuff, not important
    font: new ig.Font( 'media/font-small.png' ),
    gravity: 300,
    
    init: function() {
      if ( ios ) {
        ig.input.bindTouchArea( 0, 224, 80, 96, 'left' );
        ig.input.bindTouchArea( 80, 224, 80, 96, 'right' );
        ig.input.bindTouchArea( 320, 224, 80, 96, 'jump' );
        ig.input.bindTouchArea( 400, 224, 80, 96, 'shoot' );
      }
      else {
        ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
        ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
        ig.input.bind( ig.KEY.UP_ARROW, 'jump' );
        ig.input.bind( ig.KEY.SPACE, 'shoot' );
        ig.input.bind( ig.KEY.ENTER, 'restart' );
      }
      
      ig.input.bind( ig.KEY.MOUSE1, 'click' );
      
      ig.game.spawnEntity( EntityButtonConnect, ig.system.width / 2 - 32, ig.system.height / 2 - 8 );
    },

    // entities get an extra property called updateWhilePause
    // thos entities will work even when the game is paused
    // pause freezes the game completly, no entity gets updated and timers stop
    update: function() {
      if ( ig.game.pause ) {
        for ( var i = 0; i < this.entities.length; i++ ) {
          var ent = this.entities[ i ];
          if ( !ent._killed && ent.updateWhilePause ) {
            ent.update();
          }
        }
      }
      else this.parent();
    },


    draw: function() {
      this.parent();

      if ( this.pause ) {
        this.font.draw( 'Pause', ig.system.width / 2 , 20, ig.Font.ALIGN.CENTER );
      }
    },

    startGame: function() {
      this.loadLevel( LevelUntitled );
      
      ig.game.spawnEntity( EntityPlayer, ig.system.width / 2, ig.system.height / 2 - 10 );
    },
    
    // gets called when the network changes the pause state
    // pause is true if the game should pause and false when it should continue
    setPause: function( pause ) {
      this.pause = pause;
      // do other stuff
    },

    // if a player disconnectes, this gets called
    disconnect: function() {
      // do what you want

      // for the sake of the ios example, cause there are only two players allowed
      // we end the game when one of them leaves
      // this can happen via closing the app, disconnect or timeout
      
      if ( ios ) {
        this.pause = false;
        this.entities = [];
        this.namedEntities = {};
        this.collisionMap = ig.CollisionMap.staticNoCollision;
        this.backgroundMaps = [];

        ig.game.spawnEntity( EntityButtonConnect, ig.system.width / 2 - 32, ig.system.height / 2 - 8 );
      }
    }

  });
  
  ig.main( '#canvas', MyGame, 30, 240, 160, 2 );
  
});
