ig.module( 'game.entities.button-connect' )
.requires(
  'plugins.button'
)
.defines(function() {

  EntityButtonConnect = Button.extend({
    text: [ 'Connect' ],
    textPos: { x: 32 , y: 3 },
    textAlign: ig.Font.ALIGN.CENTER,
    
    size: { x: 64, y: 16 },
    animSheet: new ig.AnimationSheet( 'media/button.png', 64, 16 ),
    
    init: function( x, y, s ) {
      this.parent( x, y, s );
      
      // this registers a callback for the ios version
      // if a connection is established the start function is called
      if ( ios ) {
        network.socket.nativeObj.startGame( this.start.bind( this ) );
      }
    },
    
    update: function () {
      if ( ig.game.running ) this.kill();
      
      this.parent();
    },

    pressedUp: function() {
      // opens the peer picker on ios
      if ( ios  ) network.socket.nativeObj.searchOpponent();
      else this.start();
    },
    
    start: function() {
      network.start();
      this.setState( 'deactive' );
    }

  });
    
});