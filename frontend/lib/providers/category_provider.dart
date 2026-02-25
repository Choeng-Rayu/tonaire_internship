import 'package:flutter/material.dart';
import '../models/category.dart';
import '../services/api_service.dart';
import '../services/category_service.dart';

class CategoryProvider extends ChangeNotifier {
  late final CategoryService _categoryService;

  List<Category> _categories = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _searchQuery = '';

  CategoryProvider(ApiService apiService) {
    _categoryService = CategoryService(apiService);
  }

  // Getters
  List<Category> get categories => _categories;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;

  // Fetch all categories (with optional search)
  Future<void> fetchCategories({String? search}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _categoryService.getAll(search: search);

      if (response['success'] == true) {
        final data = response['data'] as List;
        _categories = data
            .map((e) => Category.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        _errorMessage = response['message'] as String? ?? 'Failed to load categories.';
      }
    } catch (e) {
      _errorMessage = 'Connection error. Please try again.';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Set search query and fetch
  Future<void> setSearchQuery(String query) async {
    _searchQuery = query;
    await fetchCategories(search: query.isNotEmpty ? query : null);
  }

  // Create category
  Future<bool> createCategory(String name, String? description) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _categoryService.create(name, description);

      if (response['success'] == true) {
        await fetchCategories(search: _searchQuery.isNotEmpty ? _searchQuery : null);
        return true;
      } else {
        _errorMessage = response['message'] as String? ?? 'Failed to create category.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Connection error. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Update category
  Future<bool> updateCategory(int id, String name, String? description) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _categoryService.update(id, name, description);

      if (response['success'] == true) {
        await fetchCategories(search: _searchQuery.isNotEmpty ? _searchQuery : null);
        return true;
      } else {
        _errorMessage = response['message'] as String? ?? 'Failed to update category.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Connection error. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Delete category
  Future<bool> deleteCategory(int id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _categoryService.delete(id);

      if (response['success'] == true) {
        await fetchCategories(search: _searchQuery.isNotEmpty ? _searchQuery : null);
        return true;
      } else {
        _errorMessage = response['message'] as String? ?? 'Failed to delete category.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Connection error. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
