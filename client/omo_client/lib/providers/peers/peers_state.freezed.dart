// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'peers_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#custom-getters-and-methods');

/// @nodoc
mixin _$PeerState {
  List<RTCVideoRenderer> get peers => throw _privateConstructorUsedError;

  @JsonKey(ignore: true)
  $PeerStateCopyWith<PeerState> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PeerStateCopyWith<$Res> {
  factory $PeerStateCopyWith(PeerState value, $Res Function(PeerState) then) =
      _$PeerStateCopyWithImpl<$Res, PeerState>;
  @useResult
  $Res call({List<RTCVideoRenderer> peers});
}

/// @nodoc
class _$PeerStateCopyWithImpl<$Res, $Val extends PeerState>
    implements $PeerStateCopyWith<$Res> {
  _$PeerStateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? peers = null,
  }) {
    return _then(_value.copyWith(
      peers: null == peers
          ? _value.peers
          : peers // ignore: cast_nullable_to_non_nullable
              as List<RTCVideoRenderer>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PeerStateImplCopyWith<$Res>
    implements $PeerStateCopyWith<$Res> {
  factory _$$PeerStateImplCopyWith(
          _$PeerStateImpl value, $Res Function(_$PeerStateImpl) then) =
      __$$PeerStateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<RTCVideoRenderer> peers});
}

/// @nodoc
class __$$PeerStateImplCopyWithImpl<$Res>
    extends _$PeerStateCopyWithImpl<$Res, _$PeerStateImpl>
    implements _$$PeerStateImplCopyWith<$Res> {
  __$$PeerStateImplCopyWithImpl(
      _$PeerStateImpl _value, $Res Function(_$PeerStateImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? peers = null,
  }) {
    return _then(_$PeerStateImpl(
      peers: null == peers
          ? _value._peers
          : peers // ignore: cast_nullable_to_non_nullable
              as List<RTCVideoRenderer>,
    ));
  }
}

/// @nodoc

class _$PeerStateImpl with DiagnosticableTreeMixin implements _PeerState {
  _$PeerStateImpl({final List<RTCVideoRenderer> peers = const []})
      : _peers = peers;

  final List<RTCVideoRenderer> _peers;
  @override
  @JsonKey()
  List<RTCVideoRenderer> get peers {
    if (_peers is EqualUnmodifiableListView) return _peers;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_peers);
  }

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'PeerState(peers: $peers)';
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties
      ..add(DiagnosticsProperty('type', 'PeerState'))
      ..add(DiagnosticsProperty('peers', peers));
  }

  @override
  bool operator ==(dynamic other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PeerStateImpl &&
            const DeepCollectionEquality().equals(other._peers, _peers));
  }

  @override
  int get hashCode =>
      Object.hash(runtimeType, const DeepCollectionEquality().hash(_peers));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$PeerStateImplCopyWith<_$PeerStateImpl> get copyWith =>
      __$$PeerStateImplCopyWithImpl<_$PeerStateImpl>(this, _$identity);
}

abstract class _PeerState implements PeerState {
  factory _PeerState({final List<RTCVideoRenderer> peers}) = _$PeerStateImpl;

  @override
  List<RTCVideoRenderer> get peers;
  @override
  @JsonKey(ignore: true)
  _$$PeerStateImplCopyWith<_$PeerStateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
