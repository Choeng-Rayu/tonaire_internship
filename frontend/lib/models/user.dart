class User {
  final int id;
  final String name;
  final String email;
  final String? authProvider;
  final DateTime? createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.authProvider,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      name: json['name'] as String,
      email: json['email'] as String,
      authProvider: json['auth_provider'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'auth_provider': authProvider,
    };
  }
}
