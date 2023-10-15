// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'navigation_service.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$navigatorKeyHash() => r'19fe6a23a8170d3f92ed4f8f9e9782442d1e78a1';

/// See also [navigatorKey].
@ProviderFor(navigatorKey)
final navigatorKeyProvider =
    AutoDisposeProvider<GlobalKey<NavigatorState>>.internal(
  navigatorKey,
  name: r'navigatorKeyProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$navigatorKeyHash,
  dependencies: const <ProviderOrFamily>[],
  allTransitiveDependencies: const <ProviderOrFamily>{},
);

typedef NavigatorKeyRef = AutoDisposeProviderRef<GlobalKey<NavigatorState>>;
String _$navigationServiceHash() => r'c89ef04b3c66f5e9f35ae7cd1a0f96244a536967';

/// See also [navigationService].
@ProviderFor(navigationService)
final navigationServiceProvider =
    AutoDisposeProvider<NavigationService>.internal(
  navigationService,
  name: r'navigationServiceProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$navigationServiceHash,
  dependencies: <ProviderOrFamily>[navigatorKeyProvider],
  allTransitiveDependencies: <ProviderOrFamily>{
    navigatorKeyProvider,
    ...?navigatorKeyProvider.allTransitiveDependencies
  },
);

typedef NavigationServiceRef = AutoDisposeProviderRef<NavigationService>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
