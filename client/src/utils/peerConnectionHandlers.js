export function getOnConnectHandler(uid, getPeerByUid) {
  return function() {
    console.log('Peer connection established');
    return {
      uid,
      connectionState: "connected",
    };
  };
}

export function getOnCloseHandler(uid, getPeerByUid) {
  // implementation
}

export function getOnIceConnectionStateChangeHandler(uid, getPeerByUid) {
  // implementation
}

export function getOnConnectionStateChangeHandler(uid, getPeerByUid) {
  // implementation
}
