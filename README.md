This is a plugin for Impact. It works in the browser and in iOS. For the browser you need socket.io and a node server. The iOS Version works with the code provided alone.

The iOS Version uses GameKit from Apple. This establishes a connection via Bluetooth and only allows __two__ peers. The whole connection part is build around this. So the node version supports two peers, too. But you could extend the connection/start game part so it would work with more peers. But I can't tell you how good that works.

With the Plugin comes an example game thats build upon the jump & run example from Dominic. Unfortunately this isn't the best example for this network plugin. But it shows its limitations. It's quite hard to do a action game that depends on realtime and exact position transfer. Right now the plugin only overwrites the new value that comes in from the network. That could be better. It could somehow tween between the old and the new value. But thats something I can't do right now and it wasn't important for our game [Steamclash](http://steamclash.com/) which works perfectly fine despite this.

I wrote some comments into the example game. So start with this, learn how it works and have fun.

# Installation

## Example game

You need the media assets from the jump & run example from Impact. You can get them in your Download page.

## Node Version

1. Install node and socket.io. Get information from their sites, it's not that hard.
2. Put the following line into the head of your index.html `<script> var ios = false; </script><script src="/socket.io/socket.io.js"></script>`
3. Put the plugin in your impact plugin directory
4. Include it in your main.js file
5. You need 3 functions in your ig.game:
  1. `startGame()`
  2. `setPause( pause )`
  3. `disconnect`
6. Have fun

If it isn't working, look into the example game.

## iOS Version

This is a little bit more complicated cause I can't include the full source code. So you have to do some copy & paste.

1. Add GameKit to your project
2. Get the JS_IosSocket.h and .m file and import it into your project.
3. Edit impact.h

Add the following code:

At the top

  #import <gamekit/gamekit.h>

After the `@end` from the `@protocol TouchDelegate`

    @protocol NetworkDelegate
    - (void) startGame;
    - (void) receiveData:(NSData *)data;
    - (void) disconneted;
    - (void) pause:(Boolean)returned;
    @end

The interface should look like this:

    @interface Impact : UIViewController <GKSessionDelegate, GKPeerPickerControllerDelegate> {
      // the standard impact stuff
  
      // network
      GKSession *currentSession;
      GKPeerPickerController *peerPicker;
      NSObject<NetworkDelegate> * networkDelegate;
    }

at the end but before `@end`

    - (void)connectAction:(id)sender;
    - (void) mySendDataToPeers:(NSData *) data;
    - (void) disconnect;

    @property (nonatomic,retain) NSObject<NetworkDelegate> * networkDelegate;
    @property (nonatomic, retain) GKSession *currentSession;

4. Edit impact.m

After all the `@syntesize` lines

    @synthesize currentSession;
    @synthesize networkDelegate;

In the `- (void)dealloc` add `[networkDelegate release];`

Copy the code from the iOS/impact.m file into the impact.m of your project

5. Edit iOSImpactAppDelegate.m

Add those lines

    - (void)applicationWillResignActive:(UIApplication *)application {
      [[engine networkDelegate] pause:true];
  
    }

    - (void)applicationDidEnterBackground:(UIApplication *)application {
      [[engine networkDelegate] pause:true];
    }

    - (void)applicationDidBecomeActive:(UIApplication *)application {
      if ( [engine currentSession] ) {
        [[engine networkDelegate] pause:false];
      }
    }

Those functions will probably exist already but only contain comments. Delete them if they do nothing, if not, copy the network code into them.

6. Add the iOS impact plugin to your impact plugin folder and the main.js file.

# Using 

The example game shows how this works. Look into that.

# Questions

Open tickets here on Github if you have questions or discover a bug. I will try to answer and help.