import 'dart:io';
import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../services/product_service.dart';
import '../config/app_config.dart';

class ProductProvider extends ChangeNotifier {
  late final ProductService _productService;

  List<Product> _products = [];
  bool _isLoading = false;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  String? _errorMessage;
  int _currentPage = 1;
  int _totalPages = 1;
  String _sortBy = 'name';
  String _sortOrder = 'asc';
  String _searchQuery = '';
  int? _categoryId;

  ProductProvider(ApiService apiService) {
    _productService = ProductService(apiService);
  }

  // Getters
  List<Product> get products => _products;
  bool get isLoading => _isLoading;
  bool get isLoadingMore => _isLoadingMore;
  bool get hasMore => _hasMore;
  String? get errorMessage => _errorMessage;
  int get currentPage => _currentPage;
  String get sortBy => _sortBy;
  String get sortOrder => _sortOrder;
  String get searchQuery => _searchQuery;
  int? get categoryId => _categoryId;

  // Fetch products (reset list)
  Future<void> fetchProducts() async {
    _isLoading = true;
    _errorMessage = null;
    _currentPage = 1;
    _hasMore = true;
    notifyListeners();

    try {
      final response = await _productService.getAll(
        page: 1,
        limit: AppConfig.itemsPerPage,
        sortBy: _sortBy,
        sortOrder: _sortOrder,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
        categoryId: _categoryId,
      );

      if (response['success'] == true) {
        final paginatedData = response['data'] as Map<String, dynamic>;
        final data = paginatedData['data'] as List;
        _products = data
            .map((e) => Product.fromJson(e as Map<String, dynamic>))
            .toList();
        _totalPages = paginatedData['totalPages'] as int;
        _currentPage = 1;
        _hasMore = _currentPage < _totalPages;
      } else {
        _errorMessage = response['message'] as String? ?? 'Failed to load products.';
      }
    } catch (e) {
      _errorMessage = 'Connection error. Please try again.';
    }

    _isLoading = false;
    notifyListeners();
  }

  // Load more products (append to list)
  Future<void> loadMore() async {
    if (_isLoadingMore || !_hasMore) return;

    _isLoadingMore = true;
    notifyListeners();

    try {
      final nextPage = _currentPage + 1;
      final response = await _productService.getAll(
        page: nextPage,
        limit: AppConfig.itemsPerPage,
        sortBy: _sortBy,
        sortOrder: _sortOrder,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
        categoryId: _categoryId,
      );

      if (response['success'] == true) {
        final paginatedData = response['data'] as Map<String, dynamic>;
        final data = paginatedData['data'] as List;
        final newProducts = data
            .map((e) => Product.fromJson(e as Map<String, dynamic>))
            .toList();
        _products.addAll(newProducts);
        _currentPage = nextPage;
        _totalPages = paginatedData['totalPages'] as int;
        _hasMore = _currentPage < _totalPages;
      }
    } catch (e) {
      // Silently fail on load more
    }

    _isLoadingMore = false;
    notifyListeners();
  }

  // Set sort
  void setSort(String sortBy, String sortOrder) {
    _sortBy = sortBy;
    _sortOrder = sortOrder;
    fetchProducts();
  }

  // Set search query
  void setSearch(String query) {
    _searchQuery = query;
    fetchProducts();
  }

  // Set category filter
  void setCategoryFilter(int? categoryId) {
    _categoryId = categoryId;
    fetchProducts();
  }

  // Create product
  Future<bool> createProduct({
    required String name,
    String? description,
    required int categoryId,
    required double price,
    File? image,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _productService.create(
        name: name,
        description: description,
        categoryId: categoryId,
        price: price,
        image: image,
      );

      if (response['success'] == true) {
        await fetchProducts();
        return true;
      } else {
        _errorMessage = response['message'] as String? ?? 'Failed to create product.';
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

  // Update product
  Future<bool> updateProduct({
    required int id,
    required String name,
    String? description,
    required int categoryId,
    required double price,
    File? image,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _productService.update(
        id: id,
        name: name,
        description: description,
        categoryId: categoryId,
        price: price,
        image: image,
      );

      if (response['success'] == true) {
        await fetchProducts();
        return true;
      } else {
        _errorMessage = response['message'] as String? ?? 'Failed to update product.';
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

  // Delete product
  Future<bool> deleteProduct(int id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _productService.delete(id);

      if (response['success'] == true) {
        await fetchProducts();
        return true;
      } else {
        _errorMessage = response['message'] as String? ?? 'Failed to delete product.';
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
