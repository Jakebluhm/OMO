enum AppRoutes {
  homePage,
  roomPage,
}

extension AppRoutesExtension on AppRoutes {
  String toName() {
    switch (this) {
      case AppRoutes.homePage:
        return 'home_page';
      case AppRoutes.roomPage:
        return 'room_page';
    }
  }

  String toPath() {
    switch (this) {
      case AppRoutes.homePage:
        return '/home_page';
      case AppRoutes.roomPage:
        return '/room_page';
    }
  }
}
