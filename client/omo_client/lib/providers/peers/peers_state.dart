import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

part 'peers_state.freezed.dart';

@freezed
class PeerState with _$PeerState {
  factory PeerState({
    @Default([]) List<RTCVideoRenderer> peers,
  }) = _PeerState;
}

final peerProvider =
    StateNotifierProvider<PeerNotifier, PeerState>((ref) => PeerNotifier());

class PeerNotifier extends StateNotifier<PeerState> {
  PeerNotifier() : super(PeerState());

  void addPeer(RTCVideoRenderer peer) {
    state = state.copyWith(peers: [...state.peers, peer]);
  }

  void removePeer(RTCVideoRenderer peer) {
    state = state.copyWith(peers: state.peers.where((p) => p != peer).toList());
  }

  // Add other methods to manage peers if necessary
}
