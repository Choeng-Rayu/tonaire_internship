import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import '../config/app_config.dart';

class ApiService {
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  String? get token => _token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  String _buildUrl(String endpoint) {
    return '${AppConfig.apiBaseUrl}$endpoint';
  }

  Future<Map<String, dynamic>> get(String endpoint,
      {Map<String, String>? queryParams}) async {
    final uri = Uri.parse(_buildUrl(endpoint)).replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: _headers);
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> post(String endpoint,
      {Map<String, dynamic>? body}) async {
    final response = await http.post(
      Uri.parse(_buildUrl(endpoint)),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> put(String endpoint,
      {Map<String, dynamic>? body}) async {
    final response = await http.put(
      Uri.parse(_buildUrl(endpoint)),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> delete(String endpoint) async {
    final response = await http.delete(
      Uri.parse(_buildUrl(endpoint)),
      headers: _headers,
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> multipartPost(
    String endpoint, {
    required Map<String, String> fields,
    File? imageFile,
    String imageFieldName = 'image',
  }) async {
    final request = http.MultipartRequest('POST', Uri.parse(_buildUrl(endpoint)));

    if (_token != null) {
      request.headers['Authorization'] = 'Bearer $_token';
    }

    request.fields.addAll(fields);

    if (imageFile != null) {
      final ext = imageFile.path.split('.').last.toLowerCase();
      request.files.add(await http.MultipartFile.fromPath(
        imageFieldName,
        imageFile.path,
        contentType: MediaType('image', ext == 'jpg' ? 'jpeg' : ext),
      ));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> multipartPut(
    String endpoint, {
    required Map<String, String> fields,
    File? imageFile,
    String imageFieldName = 'image',
  }) async {
    final request = http.MultipartRequest('PUT', Uri.parse(_buildUrl(endpoint)));

    if (_token != null) {
      request.headers['Authorization'] = 'Bearer $_token';
    }

    request.fields.addAll(fields);

    if (imageFile != null) {
      final ext = imageFile.path.split('.').last.toLowerCase();
      request.files.add(await http.MultipartFile.fromPath(
        imageFieldName,
        imageFile.path,
        contentType: MediaType('image', ext == 'jpg' ? 'jpeg' : ext),
      ));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return _handleResponse(response);
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    return body;
  }
}
