import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:omo_client/helpers/prompts/prompts.dart';
part 'game_provider.freezed.dart';

@freezed
class Game with _$Game {
  factory Game({
    Prompt? prompt,
  }) = _Game;

  factory Game.initial() => Game(
        prompt: null,
      );
}

final gameProvider =
    StateNotifierProvider<GameNotifier, Game>((ref) => GameNotifier());

class GameNotifier extends StateNotifier<Game> {
  GameNotifier() : super(Game.initial());

  void updatePrompt(Prompt prompt) {
    state = state.copyWith(prompt: prompt);
  }
}
