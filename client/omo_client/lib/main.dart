import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:omo_client/pages/home_page.dart';
import 'package:omo_client/router/app_router.dart';

import 'package:omo_client/services/navigation_service/navigation_service.dart';

final navigationKey = GlobalKey<NavigatorState>();
final router = AppRouter.build(navigationKey);
void main() => runApp(ProviderScope(
    overrides: [navigatorKeyProvider.overrideWithValue(navigationKey)],
    child: MyApp()));

class MyApp extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      routerConfig: router,
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
    );
  }
}
