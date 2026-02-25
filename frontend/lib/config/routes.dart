import 'package:flutter/material.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/home_screen.dart';
import '../screens/category/category_list_screen.dart';
import '../screens/category/category_form_screen.dart';
import '../screens/product/product_list_screen.dart';
import '../screens/product/product_form_screen.dart';

class AppRoutes {
  static const String login = '/login';
  static const String signup = '/signup';
  static const String forgotPassword = '/forgot-password';
  static const String home = '/home';
  static const String categories = '/categories';
  static const String categoryForm = '/categories/form';
  static const String products = '/products';
  static const String productForm = '/products/form';

  static Map<String, WidgetBuilder> get routes => {
        login: (_) => const LoginScreen(),
        signup: (_) => const SignupScreen(),
        forgotPassword: (_) => const ForgotPasswordScreen(),
        home: (_) => const HomeScreen(),
        categories: (_) => const CategoryListScreen(),
        categoryForm: (_) => const CategoryFormScreen(),
        products: (_) => const ProductListScreen(),
        productForm: (_) => const ProductFormScreen(),
      };
}
