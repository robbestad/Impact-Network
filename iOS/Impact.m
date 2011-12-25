#pragma mark - Network

// this opens an interface to connect via bluetooth
-(void) connectAction:(id)sender {
  if ( currentSession ) {
    [currentSession disconnectFromAllPeers];
    [currentSession setDelegate:nil];
    [currentSession setDataReceiveHandler:nil withContext:nil];
    [self setCurrentSession:nil];
  }
  
  peerPicker = [[GKPeerPickerController alloc] init];
  [peerPicker setDelegate:self];
  [peerPicker setConnectionTypesMask:GKPeerPickerConnectionTypeNearby];
  
  [peerPicker show];
  [peerPicker release];
}

// gets called when the picker did connect
- (void) peerPickerController:(GKPeerPickerController *)picker 
               didConnectPeer:(NSString *)peerID 
                    toSession:(GKSession *) session {
  
  if ( currentSession ) {
    [currentSession disconnectFromAllPeers];
    [self setCurrentSession:nil];
  }
  
  [self setCurrentSession:session];
  [currentSession setDelegate:self];
  [currentSession setDataReceiveHandler:self withContext:nil];
  [currentSession setDisconnectTimeout: 45];
  
  [picker setDelegate:nil];
  [picker dismiss];
}

// gets called when peer picker gets canceled
- (void) peerPickerControllerDidCancel:(GKPeerPickerController *)picker {
  picker.delegate = nil;
}

// gets called when the session changes, like connecting and disconnecting
- (void) session:(GKSession *)session peer:(NSString *)peerID didChangeState:(GKPeerConnectionState)state {
  switch (state) {
    case GKPeerStateConnected:
      [networkDelegate startGame];
      break;
    case GKPeerStateDisconnected:
      [networkDelegate disconneted];
      [session disconnectFromAllPeers];
      [session setDelegate:nil];
      [session setDataReceiveHandler:nil withContext:nil];
      [self setCurrentSession:nil];
      break;
    default:
      break;
  }
}

// send method
- (void) mySendDataToPeers:(NSData *) data {
  if (currentSession) {
    [currentSession sendDataToAllPeers:data
                          withDataMode:GKSendDataReliable 
                                 error:nil];
  }    
}

// receive method
- (void) receiveData:(NSData *)data 
            fromPeer:(NSString *)peer 
           inSession:(GKSession *)session 
             context:(void *)context {
  
  if ( networkDelegate ) {
    [networkDelegate receiveData:data];
  }
}

// disconnect right
- (void) disconnect {
  if ( currentSession ) {
    [networkDelegate disconneted];
    [currentSession disconnectFromAllPeers];
    [currentSession setDelegate:nil];
    [currentSession setDataReceiveHandler:nil withContext:nil];
    [self setCurrentSession:nil];
  }
}