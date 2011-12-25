#import <Foundation/Foundation.h>
#import "JS_BaseClass.h"

@interface JS_IosSocket : JS_BaseClass <NetworkDelegate> {
  JSObjectRef callbackReceive;
  JSObjectRef callbackDisconnect;
  JSObjectRef callbackPause;
  JSObjectRef callbackStartGame;
  
  Boolean paused;
}

- (void) startGame;
- (void) receiveData:(NSData *)data;
- (void) disconneted;
- (void) pause:(Boolean)returned;

@end
