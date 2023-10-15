import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:omo_client/router/app_router_constants.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'navigation_service.g.dart';

@Riverpod(dependencies: [])
GlobalKey<NavigatorState> navigatorKey(NavigatorKeyRef ref) =>
    throw UnimplementedError();

@Riverpod(dependencies: [navigatorKey])
NavigationService navigationService(NavigationServiceRef ref) =>
    NavigationService(ref.watch(navigatorKeyProvider));

extension WidgetRefX on WidgetRef {
  NavigationService get navigationService {
    return read(navigationServiceProvider);
  }
}

class NavigationService {
  NavigationService(this.navigatorKey);

  final GlobalKey<NavigatorState> navigatorKey;

  void goToRoute(
    AppRoutes route, {
    Map<String, String> params = const <String, String>{},
    Map<String, dynamic> queryParams = const <String, dynamic>{},
    Object? extra,
  }) {
    if (navigatorKey.currentContext == null) return;
    GoRouter.of(navigatorKey.currentContext!).goNamed(
      route.toName(),
      pathParameters: params,
      queryParameters: queryParams,
      extra: extra,
    );
  }

  void goToHomePage() => goToRoute(AppRoutes.homePage);
  void goToRoomPage() => goToRoute(AppRoutes.roomPage);
}
