import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:omo_client/helpers/prompts/prompts.dart';

class PromptComponent extends HookConsumerWidget {
  final Prompt prompt;
  final Function(Map<String, int>) handlePromptAdd;
  final Function(Map<String, int>) handlePromptRemoval;

  PromptComponent({
    required this.prompt,
    required this.handlePromptAdd,
    required this.handlePromptRemoval,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    double width = MediaQuery.of(context).size.width;
    double height = MediaQuery.of(context).size.height;
    final isAnswered = useState(false);
    final aSelected = useState(false);
    final bSelected = useState(false);

    void handleIdentityASelected() {
      if (aSelected.value) {
        isAnswered.value = false;
        aSelected.value = false;
        bSelected.value = false;
        handlePromptRemoval({'${prompt.id}': 0});
        return;
      }
      print("Identity A selected");
      isAnswered.value = true;
      aSelected.value = true;
      bSelected.value = false;
      handlePromptAdd({'${prompt.id}': 0});
    }

    void handleIdentityBSelected() {
      if (bSelected.value) {
        isAnswered.value = false;
        aSelected.value = false;
        bSelected.value = false;
        handlePromptRemoval({'${prompt.id}': 1});
        return;
      }
      print("Identity B selected");
      isAnswered.value = true;
      bSelected.value = true;
      aSelected.value = false;
      handlePromptAdd({'${prompt.id}': 1});
    }

    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ElevatedButton(
            onPressed: handleIdentityASelected,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              side: BorderSide(
                  color: aSelected.value ? Colors.red : Colors.transparent,
                  width: 3),
              padding: const EdgeInsets.all(5.0),
            ),
            child: Container(
              width: width * 0.1,
              constraints: const BoxConstraints(
                minWidth: 50.0, // You can set your desired minimum height here.
              ),
              child: Center(
                child: Text(
                  prompt.identityA,
                  style: const TextStyle(color: Colors.black),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
          const SizedBox(width: 5), // gap between the buttons
          ElevatedButton(
            onPressed: handleIdentityBSelected,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              side: BorderSide(
                  color: bSelected.value ? Colors.red : Colors.transparent,
                  width: 3),
              padding: const EdgeInsets.all(5.0),
            ),
            child: Container(
              width: width * 0.1,
              constraints: const BoxConstraints(
                minWidth: 50.0, // You can set your desired minimum height here.
              ),
              child: Center(
                child: Text(
                  prompt.identityB,
                  style: const TextStyle(color: Colors.black),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// class Prompt {
//   final String id;
//   final String identityA;
//   final String identityB;

//   Prompt({required this.id, required this.identityA, required this.identityB});
// }
