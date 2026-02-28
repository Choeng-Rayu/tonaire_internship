import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../utils/constants.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService;
  late final AuthService _authService;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _errorMessage;
  User? _user;
  String? _token;

  AuthProvider(this._apiService) {
    _authService = AuthService(_apiService);
  }

  // Getters
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get errorMessage => _errorMessage;
  User? get user => _user;
  String? get token => _token;

  // Initialize: check for saved token
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(Constants.tokenKey);
    final userData = prefs.getString(Constants.userKey);

    if (_token != null && userData != null) {
      _apiService.setToken(_token);
      _user = User.fromJson(jsonDecode(userData));
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _authService.login(email, password);

      if (response['success'] == true) {
        final data = response['data'];
        _token = data['token'] as String;
        _user = User.fromJson(data['user'] as Map<String, dynamic>);
        _isAuthenticated = true;

        // Save token and user
        _apiService.setToken(_token);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(Constants.tokenKey, _token!);
        await prefs.setString(Constants.userKey, jsonEncode(_user!.toJson()));

        _setLoading(false);
        return true;
      } else {
        _errorMessage = response['message'] as String? ?? 'Login failed.';
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _errorMessage = 'Connection error. Please try again.';
      _setLoading(false);
      return false;
    }
  }

  // Sign Up
  Future<bool> signup(String name, String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _authService.signup(name, email, password);

      if (response['success'] == true) {
        _setLoading(false);
        return true;
      } else {
        _errorMessage = response['message'] as String? ?? 'Sign up failed.';
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _errorMessage = 'Connection error. Please try again.';
      _setLoading(false);
      return false;
    }
  }

  // Forgot Password
  Future<bool> forgotPassword(String email) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _authService.forgotPassword(email);

      if (response['success'] == true) {
        _setLoading(false);
        return true;
      } else {
        _errorMessage =
            response['message'] as String? ?? 'Failed to send OTP.';
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _errorMessage = 'Connection error. Please try again.';
      _setLoading(false);
      return false;
    }
  }

  // Reset Password
  Future<bool> resetPassword(
      String email, String otp, String newPassword) async {
    _setLoading(true);
    _clearError();

    try {
      final response =
          await _authService.resetPassword(email, otp, newPassword);

      if (response['success'] == true) {
        _setLoading(false);
        return true;
      } else {
        _errorMessage =
            response['message'] as String? ?? 'Failed to reset password.';
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _errorMessage = 'Connection error. Please try again.';
      _setLoading(false);
      return false;
    }
  }

  // Google Sign-In
  Future<bool> signInWithGoogle() async {
    _setLoading(true);
    _clearError();

    try {
      // Trigger the Google Sign-In flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        // User cancelled the sign-in
        _errorMessage = 'Google sign-in was cancelled.';
        _setLoading(false);
        return false;
      }

      // Send Google user info to our backend
      final response = await _authService.googleLogin(
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.displayName ?? googleUser.email.split('@')[0],
      );

      if (response['success'] == true) {
        final data = response['data'];
        _token = data['token'] as String;
        _user = User.fromJson(data['user'] as Map<String, dynamic>);
        _isAuthenticated = true;

        // Save token and user
        _apiService.setToken(_token);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(Constants.tokenKey, _token!);
        await prefs.setString(Constants.userKey, jsonEncode(_user!.toJson()));

        _setLoading(false);
        return true;
      } else {
        _errorMessage = response['message'] as String? ?? 'Google login failed.';
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _errorMessage = 'Google sign-in error: ${e.toString()}';
      _setLoading(false);
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    _token = null;
    _user = null;
    _isAuthenticated = false;
    _apiService.setToken(null);

    // Sign out from Google too
    try {
      await _googleSignIn.signOut();
    } catch (_) {}

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(Constants.tokenKey);
    await prefs.remove(Constants.userKey);

    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
