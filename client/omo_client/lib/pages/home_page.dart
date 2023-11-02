import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:omo_client/providers/game/game_provider.dart';
import 'package:omo_client/services/navigation_service/navigation_service.dart';
import 'package:omo_client/widgets/prompts/prompt_pair_widget.dart';
import 'package:web_socket_channel/html.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../helpers/prompts/prompts.dart';
import 'package:omo_client/providers/user/user_provider.dart';
import 'dart:core';
import 'dart:io' if (dart.library.html) 'dart:html' as platformSpecific;

import 'package:flutter/foundation.dart';

// This will manage the name as a state
final nameProvider = StateProvider<String>((ref) => "");

class HomePage extends HookConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    double width = MediaQuery.of(context).size.width;
    double height = MediaQuery.of(context).size.height;
    // This gives you the controller for the nameProvider
    final nameController = ref.watch(nameProvider.notifier);
    final userNotifier = ref.watch(userProvider.notifier);
    final user = ref.watch(userProvider);
    final gameNotifer = ref.watch(gameProvider.notifier);

    void handlePromptAdd(Map<String, dynamic> buttonLabel) {
      print("-----------handlePromptClick-----");
      print(buttonLabel);

      final existingIndex = user.prompts.indexWhere((prompt) {
        return jsonDecode(prompt).keys.first == buttonLabel.keys.first;
      });

      if (existingIndex == -1) {
        // If the promptId doesn't exist in the array, add the new answer
        userNotifier.appendToPrompts(jsonEncode(buttonLabel));
      } else {
        // If the promptId exists in the array, replace the existing answer with the new one
        userNotifier.removeFromPrompts(existingIndex);
        userNotifier.appendToPrompts(jsonEncode(buttonLabel));
      }
    }

    void handlePromptRemoval(Map<String, dynamic> buttonLabel) {
      print("-----------handlePromptRemoval-----");
      print(buttonLabel);

      final existingIndex = user.prompts.indexWhere((prompt) {
        return jsonDecode(prompt).keys.first == buttonLabel.keys.first;
      });

      if (existingIndex != -1) {
        // If the promptId exists in the array, remove it
        userNotifier.removeFromPrompts(existingIndex);
      }
    }

    void startSearch() async {
      print("startSearch() Establishing WebSocket Connection");

      String gameHistoryString =
          Uri.encodeComponent(jsonEncode(user.gameHistory));
      final wsUrl =
          'wss://1myegfct68.execute-api.us-east-1.amazonaws.com/production/?userId=${user.uuid}&prompts=${Uri.encodeComponent(jsonEncode(user.prompts))}&gameHistory=$gameHistoryString';

      WebSocketChannel channel;

      if (kIsWeb) {
        // For web
        channel = HtmlWebSocketChannel.connect(wsUrl);
      } else {
        // For mobile
        channel = IOWebSocketChannel.connect(wsUrl);
      }
      channel.stream.listen((event) {
        final message = jsonDecode(event);
        print("---INSIDE ws.onmessage !!!!!!!!");
        print("message");
        print(message);

        if (message['action'] == "sendURL") {
          String uuid = message['uuid'];
          String promptId = message['promptId'];

          final prompt = user.prompts
              .firstWhere((p) => jsonDecode(p).keys.first == promptId);
          final oddOneOutValue = jsonDecode(prompt)[promptId];

          print("oddOneOutValue");
          print(oddOneOutValue);

          print("Type of promptId");
          print(promptId.runtimeType);

          print("promptId");
          print(promptId);

          final matchingPrompt = prompts
              .firstWhere((promptObj) => promptObj.id.toString() == promptId);
          print("matchingPrompt");
          print(matchingPrompt.toString());

          gameNotifer.updatePrompt(matchingPrompt);
          gameNotifer.updateGameUuid(uuid);

          ref.navigationService.goToRoomPage();
          // Navigate to the room page using Flutter's Navigator.
          // You might need to adapt this part to your Flutter app's navigation structure.
          // Navigator.of(context).pushNamed('/room/$uuid', arguments: {
          //  xxx 'playerName': name,
          //  xxx 'oddOneOut': oddOneOutValue,
          //  xxx 'uid': userData['Item']['user'],
          //  xxx 'prompt': matchingPrompt,
          //   'userData': userData,
          //   'dummyPrompts': dummyPrompts,
          // });
        }
      });
    }

    // Create a TextEditingController to keep track of TextField content
    final textEditingController =
        TextEditingController(text: nameController.state);

    return Scaffold(
      appBar: AppBar(title: const Center(child: Text('-OMO-'))),
      body: Column(
        children: [
          SizedBox(
            width: width * 0.25,
            child: TextField(
              controller: textEditingController,
              decoration: const InputDecoration(labelText: "Enter your name"),
              onChanged: (value) {
                // Update the state when the text field changes
                userNotifier.updateName(value);
                nameController.state = value;
                print(nameController.state);
              },
            ),
          ),
          const SizedBox(height: 25),
          Expanded(
            child: ListView.builder(
              itemCount: prompts.length,
              itemBuilder: (context, index) {
                return PromptComponent(
                  prompt: prompts[index],
                  handlePromptAdd: handlePromptAdd,
                  handlePromptRemoval: handlePromptRemoval,
                );
              },
            ),
          ),
          GestureDetector(
            onTap: () {
              debugPrint('start search tapped');
              startSearch();
            },
            child: Container(
              width: width * 0.15,
              height: height * 0.05,
              decoration: BoxDecoration(
                  color: Colors.black,
                  border: Border.all(color: Colors.blueAccent, width: 3),
                  borderRadius: const BorderRadius.all(Radius.circular(25))),
              child: const Center(
                child: Text(
                  'Start Search',
                  style: TextStyle(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
          const SizedBox(height: 25),
        ],
      ),
    );
  }
}
