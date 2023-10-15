// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_provider.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#custom-getters-and-methods');

/// @nodoc
mixin _$User {
  String get uuid => throw _privateConstructorUsedError;
  List<String> get prompts => throw _privateConstructorUsedError;
  List<String> get gameHistory => throw _privateConstructorUsedError;

  @JsonKey(ignore: true)
  $UserCopyWith<User> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserCopyWith<$Res> {
  factory $UserCopyWith(User value, $Res Function(User) then) =
      _$UserCopyWithImpl<$Res, User>;
  @useResult
  $Res call({String uuid, List<String> prompts, List<String> gameHistory});
}

/// @nodoc
class _$UserCopyWithImpl<$Res, $Val extends User>
    implements $UserCopyWith<$Res> {
  _$UserCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? uuid = null,
    Object? prompts = null,
    Object? gameHistory = null,
  }) {
    return _then(_value.copyWith(
      uuid: null == uuid
          ? _value.uuid
          : uuid // ignore: cast_nullable_to_non_nullable
              as String,
      prompts: null == prompts
          ? _value.prompts
          : prompts // ignore: cast_nullable_to_non_nullable
              as List<String>,
      gameHistory: null == gameHistory
          ? _value.gameHistory
          : gameHistory // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UserImplCopyWith<$Res> implements $UserCopyWith<$Res> {
  factory _$$UserImplCopyWith(
          _$UserImpl value, $Res Function(_$UserImpl) then) =
      __$$UserImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String uuid, List<String> prompts, List<String> gameHistory});
}

/// @nodoc
class __$$UserImplCopyWithImpl<$Res>
    extends _$UserCopyWithImpl<$Res, _$UserImpl>
    implements _$$UserImplCopyWith<$Res> {
  __$$UserImplCopyWithImpl(_$UserImpl _value, $Res Function(_$UserImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? uuid = null,
    Object? prompts = null,
    Object? gameHistory = null,
  }) {
    return _then(_$UserImpl(
      uuid: null == uuid
          ? _value.uuid
          : uuid // ignore: cast_nullable_to_non_nullable
              as String,
      prompts: null == prompts
          ? _value._prompts
          : prompts // ignore: cast_nullable_to_non_nullable
              as List<String>,
      gameHistory: null == gameHistory
          ? _value._gameHistory
          : gameHistory // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ));
  }
}

/// @nodoc

class _$UserImpl with DiagnosticableTreeMixin implements _User {
  _$UserImpl(
      {required this.uuid,
      required final List<String> prompts,
      required final List<String> gameHistory})
      : _prompts = prompts,
        _gameHistory = gameHistory;

  @override
  final String uuid;
  final List<String> _prompts;
  @override
  List<String> get prompts {
    if (_prompts is EqualUnmodifiableListView) return _prompts;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_prompts);
  }

  final List<String> _gameHistory;
  @override
  List<String> get gameHistory {
    if (_gameHistory is EqualUnmodifiableListView) return _gameHistory;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_gameHistory);
  }

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'User(uuid: $uuid, prompts: $prompts, gameHistory: $gameHistory)';
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties
      ..add(DiagnosticsProperty('type', 'User'))
      ..add(DiagnosticsProperty('uuid', uuid))
      ..add(DiagnosticsProperty('prompts', prompts))
      ..add(DiagnosticsProperty('gameHistory', gameHistory));
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserImpl &&
            (identical(other.uuid, uuid) || other.uuid == uuid) &&
            const DeepCollectionEquality().equals(other._prompts, _prompts) &&
            const DeepCollectionEquality()
                .equals(other._gameHistory, _gameHistory));
  }

  @override
  int get hashCode => Object.hash(
      runtimeType,
      uuid,
      const DeepCollectionEquality().hash(_prompts),
      const DeepCollectionEquality().hash(_gameHistory));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UserImplCopyWith<_$UserImpl> get copyWith =>
      __$$UserImplCopyWithImpl<_$UserImpl>(this, _$identity);
}

abstract class _User implements User {
  factory _User(
      {required final String uuid,
      required final List<String> prompts,
      required final List<String> gameHistory}) = _$UserImpl;

  @override
  String get uuid;
  @override
  List<String> get prompts;
  @override
  List<String> get gameHistory;
  @override
  @JsonKey(ignore: true)
  _$$UserImplCopyWith<_$UserImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
