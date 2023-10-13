import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../helpers/prompts/prompts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// This will manage the name as a state
final nameProvider = StateProvider<String>((ref) => "");

class HomePage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
// This gives you the controller for the nameProvider
    final nameController = ref.watch(nameProvider.notifier);

    // Create a TextEditingController to keep track of TextField content
    final textEditingController =
        TextEditingController(text: nameController.state);

    return Scaffold(
      appBar: AppBar(title: const Text('Riverpod Initialization')),
      body: Column(
        children: [
          TextField(
            controller: textEditingController,
            decoration: InputDecoration(labelText: "Enter your name"),
            onChanged: (value) {
              // Update the state when the text field changes
              nameController.state = value;
              print(nameController.state);
            },
          ),
          Expanded(
            child: ListView.builder(
              itemCount: prompts.length,
              itemBuilder: (context, index) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CupertinoButton(
                        child: Container(
                          height: 100,
                          child: AspectRatio(
                            aspectRatio: 1.00,
                            child: Container(
                                decoration: BoxDecoration(
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(5)),
                                  color: Color.fromRGBO(23, 26, 111, 0.753),
                                  border: Border.all(
                                    color: const Color.fromARGB(255, 0, 0, 0),
                                    width: 2.0,
                                  ),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Text(
                                    '${prompts[index].identityA}',
                                    style: TextStyle(color: Colors.white),
                                  ),
                                )),
                          ),
                        ),
                        onPressed: () => debugPrint('identityA Pressed')),
                    CupertinoButton(
                        child: Container(
                          height: 100,
                          child: AspectRatio(
                            aspectRatio: 1.00,
                            child: Container(
                                decoration: BoxDecoration(
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(5)),
                                  color: Color.fromRGBO(23, 26, 111, 0.753),
                                  border: Border.all(
                                    color: const Color.fromARGB(255, 0, 0, 0),
                                    width: 2.0,
                                  ),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Text(
                                    '${prompts[index].identityB}',
                                    style: TextStyle(color: Colors.white),
                                  ),
                                )),
                          ),
                        ),
                        onPressed: () => debugPrint('identityB Pressed')),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
