import '../services/api_service.dart';

class AuthService {
  final ApiService _api;

  AuthService(this._api);

  Future<Map<String, dynamic>> login(String email, String password) async {
    return _api.post('/auth/login', body: {
      'email': email,
      'password': password,
    });
  }

  Future<Map<String, dynamic>> signup(
      String name, String email, String password) async {
    return _api.post('/auth/signup', body: {
      'name': name,
      'email': email,
      'password': password,
    });
  }

  Future<Map<String, dynamic>> googleLogin({
    required String googleId,
    required String email,
    required String name,
  }) async {
    return _api.post('/auth/google', body: {
      'google_id': googleId,
      'email': email,
      'name': name,
    });
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    return _api.post('/auth/forgot-password', body: {
      'email': email,
    });
  }

  Future<Map<String, dynamic>> resetPassword(
      String email, String otp, String newPassword) async {
    return _api.post('/auth/reset-password', body: {
      'email': email,
      'otp': otp,
      'newPassword': newPassword,
    });
  }
}
