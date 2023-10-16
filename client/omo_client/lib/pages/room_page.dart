import 'package:flutter/cupertino.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:omo_client/providers/game/game_provider.dart';
import 'package:omo_client/providers/user/user_provider.dart';

class RoomPage extends HookConsumerWidget {
  RoomPage();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final game = ref.watch(gameProvider);
    final user = ref.watch(userProvider);

    return Center(
      child: Column(children: [
        Text(user.name),
        Text(user.uuid),
        Text(game.prompt!.identityA),
        Text(game.prompt!.identityB),
      ]),
    );
  }
}
