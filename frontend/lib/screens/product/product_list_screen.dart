import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/product_provider.dart';
import '../../providers/category_provider.dart';
import '../../models/product.dart';
import '../../config/routes.dart';
import '../../config/app_config.dart';
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
        title: const Text('Products'),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search products... (English / ខ្មែរ)',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _onSearchChanged('');
                        },
                      )
                    : null,
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
    return Card(
      child: ListTile(
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: SizedBox(
            width: 56,
            height: 56,
            child: product.imageUrl != null && product.imageUrl!.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl:
                        '${AppConfig.uploadBaseUrl}/${product.imageUrl}',
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: Colors.grey[200],
                      child: const Icon(Icons.image, color: Colors.grey),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.grey[200],
                      child:
                          const Icon(Icons.broken_image, color: Colors.grey),
                    ),
                  )
                : Container(
                    color: Colors.grey[200],
                    child: const Icon(Icons.inventory_2, color: Colors.grey),
                  ),
          ),
        ),
        title: Text(
          product.name,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '\$${product.price.toStringAsFixed(2)}',
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (product.categoryName != null)
              Text(
                product.categoryName!,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 12,
                ),
              ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.blue),
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
              icon: const Icon(Icons.delete, color: Colors.red),
              onPressed: () => _confirmDelete(product),
              tooltip: 'Delete',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductGridCard(Product product) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(
            context,
            AppRoutes.productForm,
            arguments: product,
          );
        },
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
                          color: Colors.grey[200],
                          child:
                              const Icon(Icons.image, size: 40, color: Colors.grey),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: Colors.grey[200],
                          child: const Icon(Icons.broken_image,
                              size: 40, color: Colors.grey),
                        ),
                      )
                    : Container(
                        color: Colors.grey[200],
                        child: const Icon(Icons.inventory_2,
                            size: 40, color: Colors.grey),
                      ),
              ),
            ),
            // Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '\$${product.price.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (product.categoryName != null)
                      Text(
                        product.categoryName!,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 11,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        InkWell(
                          onTap: () => _confirmDelete(product),
                          child:
                              const Icon(Icons.delete, color: Colors.red, size: 20),
                        ),
                      ],
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
