ig.module( 'game.entities.button-respawn' )
.requires(
  'plugins.button'
)
.defines(function() {

  EntityButtonRespawn = Button.extend({
    text: [ 'Respawn' ],
    textPos: { x: 32 , y: 3 },
    textAlign: ig.Font.ALIGN.CENTER,
    
    size: { x: 64, y: 16 },
    animSheet: new ig.AnimationSheet( 'media/button.png', 64, 16 ),

    init: function( x, y, s ) {
      this.parent( x, y, s );
    },
    
    update: function() {
      this.parent();
      
      if ( ig.input.state( 'restart' ) ) this.pressedUp();
    },

    draw: function() {
      ig.system.context.fillStyle = 'rgba(0,0,0,.5)';
      ig.system.context.fillRect( 0, 0, ig.system.realWidth, ig.system.realHeight );
      
      this.parent();
    },

    pressedUp: function() {
      ig.game.spawnEntity( EntityPlayer, ig.system.width / 2, ig.system.height / 2 - 10 );
      this.kill();
    }

  });

});