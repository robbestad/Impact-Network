#import "JS_IosSocket.h"

@implementation JS_IosSocket

- (id)initWithContext:(JSContextRef)ctx object:(JSObjectRef)obj argc:(size_t)argc argv:(const JSValueRef [])argv {
	if ( self = [super initWithContext:ctx object:obj argc:argc argv:argv] ) {
        [[Impact instance] setNetworkDelegate:self];
    
    paused = false;
	}
	return self;
}

- (void) receiveData:(NSData *)data {
  // Prepare arguments and invoke the callback
  NSString* str = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
  JSStringRef json = JSStringCreateWithUTF8CString([str cStringUsingEncoding:NSUTF8StringEncoding]);
    
  Impact * impact = [Impact instance];
  
	JSValueRef params[] = { JSValueMakeFromJSONString(impact.ctx, json) };
    
	[impact invokeCallback:callbackReceive thisObject:NULL argc:1 argv:params];
}

- (void) disconneted {
  [[Impact instance] invokeCallback:callbackDisconnect thisObject:NULL argc:0 argv:NULL];
}

- (void) pause:(Boolean)returned {
  if ( paused && !returned) return;
  
  paused = !returned;
  
  Impact * impact = [Impact instance];
  
  JSValueRef params[] = { JSValueMakeBoolean([impact ctx], returned) };
  
  [impact invokeCallback:callbackPause thisObject:NULL argc:1 argv:params];
}

- (void) startGame {
  [[Impact instance] invokeCallback:callbackStartGame thisObject:NULL argc:0 argv:nil];
}

JS_FUNC( JS_IosSocket, searchOpponent, ctx, argc, argv ) {
  [[Impact instance] connectAction:self];
  
  return NULL;
}

JS_FUNC( JS_IosSocket, startGame, ctx, argc, argv ) {
  callbackStartGame = JSValueToObject(ctx, argv[0], NULL);
  JSValueProtect(ctx, callbackStartGame);
  
  return NULL;
}

JS_FUNC( JS_IosSocket, emit, ctx, argc, argv ) {
    NSData* data;
    NSString *str = JSValueToNSString(ctx, argv[0]);
    
    data = [str dataUsingEncoding: NSASCIIStringEncoding];
    
    [[Impact instance] mySendDataToPeers:data];
    
    return NULL;
}

JS_FUNC( JS_IosSocket, receive, ctx, argc, argv ) {
    callbackReceive = JSValueToObject(ctx, argv[0], NULL);
    JSValueProtect(ctx, callbackReceive);

    return NULL;
}

JS_FUNC( JS_IosSocket, disconnect, ctx, argc, argv ) {
  callbackDisconnect = JSValueToObject(ctx, argv[0], NULL);
  JSValueProtect(ctx, callbackDisconnect);
  
  return NULL;
}

JS_FUNC( JS_IosSocket, pause, ctx, argc, argv ) {
  callbackPause = JSValueToObject(ctx, argv[0], NULL);
  JSValueProtect(ctx, callbackPause);
  
  return NULL;
}

JS_FUNC( JS_IosSocket, versionUnmatch, ctx, argc, argv ) {
  BOOL smallerVersion = JSValueToBoolean(ctx, argv[0]);
  
  NSString *text;
  
  if ( smallerVersion ) {
    text = @"Please update the game.";
  }
  else {
    text = @"Your opponent needs to update the game.";
  }
  
  UIAlertView *alert = [[[UIAlertView alloc] initWithTitle:@"Wrong Version" message:text delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil] autorelease];

  [alert show];
  
  return NULL;
}

@end
