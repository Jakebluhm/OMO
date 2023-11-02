import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:omo_client/providers/game/game_provider.dart';
import 'package:omo_client/providers/peers/peers_state.dart';
import 'package:omo_client/providers/user/user_provider.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

// class RoomPage extends HookConsumerWidget {
//   RoomPage();

//   @override
//   Widget build(BuildContext context, WidgetRef ref) {
//     final game = ref.watch(gameProvider);
//     final user = ref.watch(userProvider);

//     return Center(
//       child: Column(children: [
//         Text(user.name),
//         Text(user.uuid),
//         Text(game.prompt!.identityA),
//         Text(game.prompt!.identityB),
//         Text(game.uuid!),
//       ]),
//     );
//   }
// }

class RoomPage extends HookConsumerWidget {
  late IO.Socket socket;
  //List<RTCVideoRenderer> peers = [];
  RTCVideoRenderer localRenderer = RTCVideoRenderer();
  final roomID = "some_room_id"; // Adjust the room ID as needed

  Future<void> initRenderers() async {
    await localRenderer.initialize();
    MediaStream localStream = await navigator.mediaDevices.getUserMedia({
      'audio': true,
      'video': {
        'facingMode': 'user',
      },
    });

    localRenderer.srcObject = localStream;
    // More setup, signaling, and handling peers
  }

  void _connect() {
    socket = IO.io('/', <String, dynamic>{
      'transports': ['websocket'],
    });

    socket.onConnect((_) {
      print('connect');
      socket.emit('join room', roomID);
    });

    // Handle socket events, create and add peers
    socket.on('all users', (users) {
      // Iterate over users and create peers
    });

    // Other event handlers...
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final game = ref.watch(gameProvider);
    final user = ref.watch(userProvider);

    final peerNotifier = ref.read(peerProvider.notifier);
    final peersState = ref.read(peerProvider);

    useEffect(
      () {
        initRenderers();
        _connect();
        return () {
          // cleanup logic, such as dispose
          localRenderer.dispose();
          peersState.peers.forEach((renderer) => renderer.dispose());
          socket.dispose();
        };
      },
      [],
    );

    return Scaffold(
      body: Container(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            Expanded(
              child: RTCVideoView(localRenderer, mirror: true),
            ),
            // Display remote videos
            ...peersState.peers
                .map((peer) => Expanded(child: RTCVideoView(peer))),
            Text(user.name),
            Text(user.uuid),
            Text(game.prompt!.identityA),
            Text(game.prompt!.identityB),
            Text(game.uuid!),
          ],
        ),
      ),
    );
  }
}
