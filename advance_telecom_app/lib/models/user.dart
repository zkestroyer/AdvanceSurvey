class User {
  final int id;
  final String email;
  final String name;
  final String role;
  final String? territory;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.territory,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      role: json['role'],
      territory: json['territory'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'territory': territory,
    };
  }
}
