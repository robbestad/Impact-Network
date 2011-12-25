// The Player class is from the jump & example

ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({
  
  // this has to be set to the className
  className: 'EntityPlayer',
  
  // network settings
  sendOnSpawn: true, // set this to true if the entity should spawn in the network
  sendOnUpdate: true, // set true if the entity should be updated via network
  updateFromClient: true, // set true if the entity is updates from his owner
  updateProperties: [ 'pos', 'flip', 'state' ], // the properties that should be updated
  lazyUpdate: false, // set true if you want to update some values every 2 seconds
                     // should be used for not so important stuff, which, despite beeing not important
                     // should still be the same on both devices
  lazyUpdateProperties: [], // the lazy update properties
  
  
  // we need this to display the right animation
  state: 'idle',
  
  // not important for network
  size: { x: 8, y: 14 },
  offset: { x: 4, y: 2 },
  
  maxVel: { x: 100, y: 200 },
  friction: { x: 600, y: 0 },
  
  type: ig.Entity.TYPE.A,
  checkAgainst: ig.Entity.TYPE.NONE,
  collides: ig.Entity.COLLIDES.PASSIVE,
  
  animSheet: new ig.AnimationSheet( 'media/player.png', 16, 16 ),

  flip: false,
  accelGround: 400,
  accelAir: 200,
  jump: 140,
  health: 10,
  
  // this method gets called when the entity is spawned via the network
  // use it to change some stuff
  // in this case the collission changes so the bullets hit the other players
  // gets called before the init.parent()
  networkInit: function( x, y, settings ) {
    // if you want to change x, y or settings return an object containing them
    // like this
    return {
      x: x, // you don't have to set them if you don't change them
      y: y,
      settings: {
        type: ig.Entity.TYPE.B,
        gravityFactor: 0
      }
    };
  },
  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );
    
    this.addAnim( 'idle', 1, [0] );
    this.addAnim( 'run', 0.07, [0,1,2,3,4,5] );
    this.addAnim( 'jump', 1, [9] );
    this.addAnim( 'fall', 0.4, [6,7] );
  },
  
  update: function() {
    // this is a little bit hacky, but works
    // if the player entity is spawned by the network, it's probably not ours
    // there is some network related code at the end of the function
    if ( !this.sendByNetwork ) {
      var accel = this.standing ? this.accelGround : this.accelAir;
      
      if ( ig.input.state( 'left' ) ) {
        this.accel.x = -accel;
        this.flip = true;
      }
      else if ( ig.input.state( 'right' ) ) {
        this.accel.x = accel;
        this.flip = false;
      }
      else {
        this.accel.x = 0;
      }

      // jump
      if ( this.standing && ig.input.pressed( 'jump' ) ) {
        this.vel.y = -this.jump;
      }

      // shoot
      if ( ig.input.pressed('shoot') ) {
        ig.game.spawnEntity( EntitySlimeGrenade, this.pos.x, this.pos.y, { flip:this.flip } );
      }
      
      // set the current animation, based on the player's speed
      if ( this.vel.y < 0 ) this.state = 'jump';
      else if ( this.vel.y > 0 ) this.state = 'fall';
      else if ( this.vel.x != 0 ) this.state = 'run';
      else this.state = 'idle';
    }
    
    this.currentAnim = this.anims[ this.state ];
    this.currentAnim.flip.x = this.flip;
    
    // move!
    this.parent();
  },
  
  kill: function() {
    // It can happen that the network sends the kill before game tiself
    // so it is important to check if the entity is already death
    if ( !this._killed ) {
      if ( !this.sendByNetwork ) ig.game.spawnEntity( EntityButtonRespawn, ig.system.width / 2 - 32, ig.system.height / 2 - 8 );

      this.parent();
    }
  }
});

EntitySlimeGrenade = ig.Entity.extend({
  
  // network stuff
  className: 'EntitySlimeGrenade',
  
  sendOnSpawn: true,
  spawnProperties: [ 'flip' ],
  dontSendOnKill: true,
  
  // not important for network
  size: { x: 4, y: 4 },
  offset: { x: 2, y: 2 },
  maxVel: { x: 200, y: 200 },
  
  bounciness: 0.6, 
  
  type: ig.Entity.TYPE.NONE,
  checkAgainst: ig.Entity.TYPE.B,
  collides: ig.Entity.COLLIDES.PASSIVE,
    
  animSheet: new ig.AnimationSheet( 'media/slime-grenade.png', 8, 8 ),
  
  bounceCounter: 0,
  
  networkInit: function( x, y, settings ) {
    // be carefull while doing this
    this.checkAgainst = ig.Entity.TYPE.A;
    
    // in this case this works. but when the settings object or the spawn properties contain this property
    // it gets overwritten in the init of the entity cause networkInit is called before init
  },
  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );
    
    this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
    this.vel.y = -50;
    this.addAnim( 'idle', 0.2, [0,1] );
  },
  
  handleMovementTrace: function( res ) {
    this.parent( res );
    
    if ( res.collision.x || res.collision.y ) {
      this.bounceCounter++;
      
      if ( this.bounceCounter > 2 ) this.kill();
    }
  },

  check: function( other ) {
    other.receiveDamage( 10, this );
    this.kill();
  }  
});

});