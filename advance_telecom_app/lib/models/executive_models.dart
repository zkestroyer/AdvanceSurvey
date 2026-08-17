class DashboardSummary {
  final Map<String, dynamic> surveySummary;
  final Map<String, dynamic> shopSummary;
  final Map<String, dynamic> users;
  final Map<String, dynamic> geographicCoverage;
  final Map<String, dynamic> productInsights;
  final Map<String, dynamic> surveyQuality;

  DashboardSummary({
    required this.surveySummary,
    required this.shopSummary,
    required this.users,
    required this.geographicCoverage,
    required this.productInsights,
    required this.surveyQuality,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    return DashboardSummary(
      surveySummary: json['surveySummary'] ?? {},
      shopSummary: json['shopSummary'] ?? {},
      users: json['users'] ?? {},
      geographicCoverage: json['geographicCoverage'] ?? {},
      productInsights: json['productInsights'] ?? {},
      surveyQuality: json['surveyQuality'] ?? {},
    );
  }
}

class ExecutiveNotification {
  final int id;
  final int notificationId;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final String createdAt;

  ExecutiveNotification({
    required this.id,
    required this.notificationId,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory ExecutiveNotification.fromJson(Map<String, dynamic> json) {
    return ExecutiveNotification(
      id: json['id'],
      notificationId: json['notificationId'],
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? '',
      isRead: json['isRead'] ?? false,
      createdAt: json['createdAt'] ?? '',
    );
  }
}
