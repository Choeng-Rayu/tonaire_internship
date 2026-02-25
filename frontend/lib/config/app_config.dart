import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get apiBaseUrl =>
      dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';

  static String get uploadBaseUrl {
    final base = apiBaseUrl.replaceAll('/api', '');
    return '$base/uploads/images';
  }

  static const int itemsPerPage = 20;
  static const int debounceDuration = 500; // milliseconds
}
