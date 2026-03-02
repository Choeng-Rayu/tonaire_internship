import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/product_provider.dart';
import '../../providers/category_provider.dart';
import '../../models/product.dart';
import '../../config/routes.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../utils/debouncer.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final _searchController = TextEditingController();
  final _debouncer = Debouncer(milliseconds: AppConfig.debounceDuration);
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CategoryProvider>().fetchCategories();
      context.read<ProductProvider>().fetchProducts();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debouncer.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<ProductProvider>().loadMore();
    }
  }

  void _onSearchChanged(String query) {
    _debouncer.run(() {
      context.read<ProductProvider>().setSearch(query);
    });
  }

  void _confirmDelete(Product product) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Product'),
        content: Text('Are you sure you want to delete "${product.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final provider = context.read<ProductProvider>();
              final success = await provider.deleteProduct(product.id!);
              if (!mounted) return;
              if (success) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Product deleted successfully.'),
                    backgroundColor: Colors.green,
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                        provider.errorMessage ?? 'Failed to delete product.'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Back',
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Products'),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withOpacity(0.08),
                    blurRadius: 12,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: _onSearchChanged,
                decoration: InputDecoration(
                  hintText: 'Search products... (English / ខ្មែរ)',
                  prefixIcon: const Icon(Icons.search_rounded,
                      color: AppTheme.primary),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded),
                          onPressed: () {
                            _searchController.clear();
                            _onSearchChanged('');
                          },
                        )
                      : null,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(
                        color: AppTheme.primary, width: 1.5),
                  ),
                  fillColor: Colors.transparent,
                  filled: true,
                ),
              ),
            ),
          ),

          // Filters Row: Category Dropdown + Sort
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                // Category Dropdown
                Expanded(
                  child: Consumer<CategoryProvider>(
                    builder: (context, catProvider, _) {
                      return Consumer<ProductProvider>(
                        builder: (context, prodProvider, _) {
                          return DropdownButtonFormField<int?>(
                            initialValue: prodProvider.categoryId,
                            isExpanded: true,
                            decoration: const InputDecoration(
                              labelText: 'Category',
                              contentPadding: EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              border: OutlineInputBorder(),
                            ),
                            items: [
                              const DropdownMenuItem<int?>(
                                value: null,
                                child: Text('All Categories'),
                              ),
                              ...catProvider.categories.map((cat) {
                                return DropdownMenuItem<int?>(
                                  value: cat.id,
                                  child: Text(
                                    cat.name,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                );
                              }),
                            ],
                            onChanged: (value) {
                              prodProvider.setCategoryFilter(value);
                            },
                          );
                        },
                      );
                    },
                  ),
                ),
                const SizedBox(width: 8),

                // Sort Buttons
                Consumer<ProductProvider>(
                  builder: (context, provider, _) {
                    return PopupMenuButton<String>(
                      icon: const Icon(Icons.sort),
                      tooltip: 'Sort',
                      onSelected: (value) {
                        switch (value) {
                          case 'name_asc':
                            provider.setSort('name', 'asc');
                            break;
                          case 'name_desc':
                            provider.setSort('name', 'desc');
                            break;
                          case 'price_asc':
                            provider.setSort('price', 'asc');
                            break;
                          case 'price_desc':
                            provider.setSort('price', 'desc');
                            break;
                        }
                      },
                      itemBuilder: (_) => [
                        CheckedPopupMenuItem(
                          value: 'name_asc',
                          checked: provider.sortBy == 'name' &&
                              provider.sortOrder == 'asc',
                          child: const Text('Name (A-Z)'),
                        ),
                        CheckedPopupMenuItem(
                          value: 'name_desc',
                          checked: provider.sortBy == 'name' &&
                              provider.sortOrder == 'desc',
                          child: const Text('Name (Z-A)'),
                        ),
                        CheckedPopupMenuItem(
                          value: 'price_asc',
                          checked: provider.sortBy == 'price' &&
                              provider.sortOrder == 'asc',
                          child: const Text('Price (Low-High)'),
                        ),
                        CheckedPopupMenuItem(
                          value: 'price_desc',
                          checked: provider.sortBy == 'price' &&
                              provider.sortOrder == 'desc',
                          child: const Text('Price (High-Low)'),
                        ),
                      ],
                    );
                  },
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Product List
          Expanded(
            child: Consumer<ProductProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.products.isEmpty) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (provider.errorMessage != null &&
                    provider.products.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline,
                            size: 48, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text(provider.errorMessage!),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => provider.fetchProducts(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                if (provider.products.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inventory_2_outlined,
                            size: 48, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text(
                          provider.searchQuery.isNotEmpty
                              ? 'No products found for "${provider.searchQuery}"'
                              : 'No products yet. Create one!',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  );
                }

                return LayoutBuilder(
                  builder: (context, constraints) {
                    // Responsive: grid on wider screens
                    if (constraints.maxWidth >= 600) {
                      return _buildGridView(provider, constraints);
                    }
                    return _buildListView(provider);
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, AppRoutes.productForm);
        },
        tooltip: 'Add Product',
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildListView(ProductProvider provider) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: provider.products.length + (provider.hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == provider.products.length) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        return _buildProductCard(provider.products[index]);
      },
    );
  }

  Widget _buildGridView(ProductProvider provider, BoxConstraints constraints) {
    final crossAxisCount = constraints.maxWidth >= 900 ? 3 : 2;
    return GridView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: 0.9,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: provider.products.length + (provider.hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == provider.products.length) {
          return const Center(child: CircularProgressIndicator());
        }
        return _buildProductGridCard(provider.products[index]);
      },
    );
  }

  Widget _buildProductCard(Product product) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEEF0FA), width: 1),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              bottomLeft: Radius.circular(16),
            ),
            child: SizedBox(
              width: 80,
              height: 80,
              child: product.imageUrl != null && product.imageUrl!.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl:
                          '${AppConfig.uploadBaseUrl}/${product.imageUrl}',
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: const Color(0xFFF0F2FF),
                        child: const Icon(Icons.image_outlined,
                            color: AppTheme.primaryLight),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: const Color(0xFFF0F2FF),
                        child: const Icon(Icons.broken_image_outlined,
                            color: AppTheme.primaryLight),
                      ),
                    )
                  : Container(
                      color: const Color(0xFFF0F2FF),
                      child: const Icon(Icons.inventory_2_outlined,
                          color: AppTheme.primaryLight),
                    ),
            ),
          ),
          // Info
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: Color(0xFF1C1C2E)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '\$${product.price.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: AppTheme.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  if (product.categoryName != null) ...
                  [
                    const SizedBox(height: 4),
                    Text(
                      product.categoryName!,
                      style: const TextStyle(
                          color: Color(0xFF7A7A9A), fontSize: 12),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ),
          // Actions
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.edit_outlined,
                    color: AppTheme.primary, size: 20),
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    AppRoutes.productForm,
                    arguments: product,
                  );
                },
                tooltip: 'Edit',
              ),
              IconButton(
                icon: Icon(Icons.delete_outline,
                    color: AppTheme.error, size: 20),
                onPressed: () => _confirmDelete(product),
                tooltip: 'Delete',
              ),
            ],
          ),
          const SizedBox(width: 4),
        ],
      ),
    );
  }

  Widget _buildProductGridCard(Product product) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEEF0FA), width: 1),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withOpacity(0.07),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(
            context,
            AppRoutes.productForm,
            arguments: product,
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              flex: 3,
              child: SizedBox(
                width: double.infinity,
                child: product.imageUrl != null &&
                        product.imageUrl!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl:
                            '${AppConfig.uploadBaseUrl}/${product.imageUrl}',
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: const Color(0xFFF0F2FF),
                          child: const Icon(Icons.image_outlined,
                              size: 36, color: AppTheme.primaryLight),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: const Color(0xFFF0F2FF),
                          child: const Icon(Icons.broken_image_outlined,
                              size: 36, color: AppTheme.primaryLight),
                        ),
                      )
                    : Container(
                        color: const Color(0xFFF0F2FF),
                        child: const Icon(Icons.inventory_2_outlined,
                            size: 36, color: AppTheme.primaryLight),
                      ),
              ),
            ),
            // Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: Color(0xFF1C1C2E),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '\$${product.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    if (product.categoryName != null) ...
                    [
                      const SizedBox(height: 2),
                      Text(
                        product.categoryName!,
                        style: const TextStyle(
                            color: Color(0xFF7A7A9A), fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const Spacer(),
                    Align(
                      alignment: Alignment.centerRight,
                      child: InkWell(
                        onTap: () => _confirmDelete(product),
                        borderRadius: BorderRadius.circular(8),
                        child: Padding(
                          padding: const EdgeInsets.all(4),
                          child: Icon(Icons.delete_outline,
                              color: AppTheme.error, size: 18),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
