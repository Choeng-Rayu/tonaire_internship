import '../services/api_service.dart';

class CategoryService {
  final ApiService _api;

  CategoryService(this._api);

  Future<Map<String, dynamic>> getAll({String? search}) async {
    final params = <String, String>{};
    if (search != null && search.isNotEmpty) {
      params['search'] = search;
    }
    return _api.get('/categories', queryParams: params.isNotEmpty ? params : null);
  }

  Future<Map<String, dynamic>> getById(int id) async {
    return _api.get('/categories/$id');
  }

  Future<Map<String, dynamic>> create(String name, String? description) async {
    return _api.post('/categories', body: {
      'name': name,
      'description': description,
    });
  }

  Future<Map<String, dynamic>> update(
      int id, String name, String? description) async {
    return _api.put('/categories/$id', body: {
      'name': name,
      'description': description,
    });
  }

  Future<Map<String, dynamic>> delete(int id) async {
    return _api.delete('/categories/$id');
  }
}
