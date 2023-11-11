import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:omo_client/providers/game/game_provider.dart';
import 'package:omo_client/providers/peers/peers_state.dart';
import 'package:omo_client/providers/user/user_provider.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import 'package:web_socket_channel/html.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:http/http.dart'
    as http; // Make sure this line is at the top of your file

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
    debugPrint('inside initRenderers()');
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

  Future<void> _fetchTurnCredentials() async {
    try {
      final response = await http.get(Uri.parse('/turn-credentials'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        // TODO: Use the TURN credentials
        print('TURN credentials: $data');
      } else {
        throw Exception('Failed to load TURN credentials');
      }
    } catch (error) {
      print('Error fetching TURN credentials: $error');
    }
  }

  void _connect(User user, Game game) {
    debugPrint('inside _connect()');

    // Configure socket connection
    final socket = IO.io('wss://omo.social', <String, dynamic>{
      'autoConnect': false,
    });
    debugPrint('before socket.connect();');
    socket.connect();
    debugPrint('after socket.connect();');
    debugPrint('sending it with join room');
    socket.emit('join room', {
      'roomID': roomID,
      'name': user.name,
      'OMO': user.oddOneOutIndex,
      'uid': user.uuid,
    });

    // Socket event handlers
    socket.onConnect((_) {
      debugPrint('connect');
      socket.emit('join room', {
        'roomID': roomID,
        'name': user.name,
        'OMO': user.oddOneOutIndex,
        'uid': user.uuid,
      });
    });

    socket.onConnectError((data) {
      debugPrint('onConnectError: $data');
    });

    socket.onConnectTimeout((data) {
      debugPrint('onConnectTimeout: $data');
    });

    socket.onError((data) {
      debugPrint('onError: $data');
    });

    socket.onDisconnect((_) {
      debugPrint('disconnect');
    });

    // Handle custom socket events
    socket.on('all users', (users) {
      debugPrint('all users');
      debugPrint(users.toString());
      for (var user in users) {
        debugPrint(user.toString());
      }
      // Iterate over users and create peers
    });

    // Other event handlers...
  }

  // void _connect(User user, Game game) {
  //   debugPrint('inside NEW _connect()');

  //   const wsUrl =
  //       'wss://omo.social:3000'; // Modify this to point to your server.js WebSocket

  //   WebSocketChannel channel;

  //   if (kIsWeb) {
  //     // For web
  //     channel = HtmlWebSocketChannel.connect(wsUrl);
  //   } else {
  //     // For mobile
  //     channel = IOWebSocketChannel.connect(wsUrl);
  //   }

  //   channel.stream.listen((event) {
  //     final message = jsonDecode(event);
  //     print("--- Received message !!!!!!!!");
  //     print("message");
  //     print(message);
  //     // Handle message...
  //   }, onError: (error) {
  //     print('WebSocket error: $error');
  //   });

  //   // Send the 'join room' message
  //   final joinMessage = jsonEncode({
  //     'roomID': roomID,
  //     'name': user.name,
  //     'OMO': user.oddOneOutIndex,
  //     'uid': user.uuid,
  //   });
  //   channel.sink.add(joinMessage);
  // }

  // void _connect1(User user, Game game) {
  //   debugPrint('inside _connect()');

  //   // For Web????
  //   IO.Socket socket = IO.io('/', <String, dynamic>{
  //     'transports': ['websocket'],
  //     'autoConnect': false,
  //     // ... any other options you might need
  //   });
  //   debugPrint('b4444 socket.connect();');
  //   socket.connect();
  //   debugPrint('after IO.io()');

  //   socket.onConnect((_) {
  //     print('connect');
  //     socket.emit('join room', {
  //       'roomID': roomID,
  //       'name': user.name,
  //       'OMO': user.oddOneOutIndex,
  //       'uid': user.uuid,
  //     });
  //   });

  //   socket.onConnectError((data) {
  //     debugPrint('onConnectError: $data');
  //   });

  //   socket.onConnectTimeout((data) {
  //     debugPrint('onConnectTimeout: $data');
  //   });

  //   socket.onError((data) {
  //     debugPrint('onError: $data');
  //   });

  //   socket.onDisconnect((_) {
  //     debugPrint('disconnect');
  //   });

  //   // Handle socket events, create and add peers
  //   socket.on('all users', (users) {
  //     print('all users');
  //     print(users);
  //     for (var user in users) {
  //       print(user);
  //     }
  //     // Iterate over users and create peers
  //   });

  //   // Other event handlers...
  // }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final game = ref.watch(gameProvider);
    final user = ref.watch(userProvider);

    final peerNotifier = ref.read(peerProvider.notifier);
    final peersState = ref.read(peerProvider);

    useEffect(
      () {
        try {
          _fetchTurnCredentials();
        } catch (err) {
          print(err);
        }

        try {
          _connect(user, game);
        } catch (err) {
          print(err);
        }
        initRenderers();
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
            Text("OMO"),
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
