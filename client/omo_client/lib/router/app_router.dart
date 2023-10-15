import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import 'package:omo_client/pages/home_page.dart';
import 'package:omo_client/pages/room_page.dart';
import 'package:omo_client/router/app_router_constants.dart';

class AppRouter {
  static GoRouter build(GlobalKey<NavigatorState> navigatorKey) {
    return GoRouter(
        navigatorKey: navigatorKey,
        observers: null,
        initialLocation: AppRoutes.homePage.toPath(),
        errorBuilder: (context, state) => Container(
              child: Text('Error'),
            ),
        routes: [
          GoRoute(
            name: AppRoutes.homePage.toName(),
            path: AppRoutes.homePage.toPath(),
            builder: (context, state) => HomePage(),
          ),
          GoRoute(
            name: AppRoutes.roomPage.toName(),
            path: AppRoutes.roomPage.toPath(),
            builder: (context, state) => RoomPage(),
          ),
        ]);
  }
}
