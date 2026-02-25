import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';

import 'config/routes.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/category_provider.dart';
import 'providers/product_provider.dart';
import 'services/api_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  runApp(const TaonaireApp());
}

class TaonaireApp extends StatelessWidget {
  const TaonaireApp({super.key});

  @override
  Widget build(BuildContext context) {
    final apiService = ApiService();

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(apiService)..init(),
        ),
        ChangeNotifierProvider(
          create: (_) => CategoryProvider(apiService),
        ),
        ChangeNotifierProvider(
          create: (_) => ProductProvider(apiService),
        ),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return MaterialApp(
            title: 'Taonaire',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            routes: AppRoutes.routes,
            initialRoute: authProvider.isAuthenticated
                ? AppRoutes.home
                : AppRoutes.login,
          );
        },
      ),
    );
  }
}
