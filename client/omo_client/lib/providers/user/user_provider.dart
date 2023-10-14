import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:uuid/uuid.dart';

part 'user_provider.freezed.dart';

@freezed
class User with _$User {
  factory User({
    required String uuid,
    required List<String> prompts,
    required List<String> gameHistory,
  }) = _User;

  factory User.initial() => User(
        uuid: Uuid().v4(),
        prompts: [],
        gameHistory: [],
      );
}

final userProvider =
    StateNotifierProvider<UserNotifier, User>((ref) => UserNotifier());

class UserNotifier extends StateNotifier<User> {
  UserNotifier() : super(User.initial());

  void updateUuid(String newUuid) {
    state = state.copyWith(uuid: newUuid);
  }

  void appendToPrompts(String newPrompt) {
    state = state.copyWith(prompts: [...state.prompts, newPrompt]);
    // for (var prompt in state.prompts) {
    //   debugPrint(prompt);
    // }
  }

  void removeFromPrompts(int index) {
    final updatedPrompts = List<String>.from(state.prompts)..removeAt(index);
    state = state.copyWith(prompts: updatedPrompts);
  }

  void updateGameHistory(List<String> newGameHistory) {
    state = state.copyWith(gameHistory: newGameHistory);
  }
}
