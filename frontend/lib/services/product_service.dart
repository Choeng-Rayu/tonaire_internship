import 'dart:typed_data';
import '../services/api_service.dart';

class ProductService {
  final ApiService _api;

  ProductService(this._api);

  Future<Map<String, dynamic>> getAll({
    int page = 1,
    int limit = 20,
    String sortBy = 'name',
    String sortOrder = 'asc',
    String? search,
    int? categoryId,
  }) async {
    final params = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
      'sort_by': sortBy,
      'sort_order': sortOrder,
    };
    if (search != null && search.isNotEmpty) {
      params['search'] = search;
    }
    if (categoryId != null) {
      params['category_id'] = categoryId.toString();
    }
    return _api.get('/products', queryParams: params);
  }

  Future<Map<String, dynamic>> getById(int id) async {
    return _api.get('/products/$id');
  }

  Future<Map<String, dynamic>> create({
    required String name,
    String? description,
    required int categoryId,
    required double price,
    Uint8List? imageBytes,
    String? imageFileName,
  }) async {
    return _api.multipartPost(
      '/products',
      fields: {
        'name': name,
        'description': description ?? '',
        'category_id': categoryId.toString(),
        'price': price.toString(),
      },
      imageBytes: imageBytes,
      imageFileName: imageFileName,
    );
  }

  Future<Map<String, dynamic>> update({
    required int id,
    required String name,
    String? description,
    required int categoryId,
    required double price,
    Uint8List? imageBytes,
    String? imageFileName,
  }) async {
    return _api.multipartPut(
      '/products/$id',
      fields: {
        'name': name,
        'description': description ?? '',
        'category_id': categoryId.toString(),
        'price': price.toString(),
      },
      imageBytes: imageBytes,
      imageFileName: imageFileName,
    );
  }

  Future<Map<String, dynamic>> delete(int id) async {
    return _api.delete('/products/$id');
  }
}
