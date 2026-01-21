<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

try {
    // Get filter parameters
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $activity_type = isset($_GET['activity_type']) ? $_GET['activity_type'] : null;
    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    // Build query
    $query = "SELECT 
                ual.log_id,
                ual.user_id,
                ual.activity_type,
                ual.activity_description,
                ual.ip_address,
                ual.created_at,
                u.full_name,
                u.user_type
              FROM user_activity_log ual
              LEFT JOIN users u ON ual.user_id = u.user_id
              WHERE 1=1";

    $params = [];
    $types = "";

    // Apply filters
    if ($user_id) {
        $query .= " AND ual.user_id = ?";
        $params[] = $user_id;
        $types .= "s";
    }

    if ($activity_type) {
        $query .= " AND ual.activity_type = ?";
        $params[] = $activity_type;
        $types .= "s";
    }

    if ($start_date) {
        $query .= " AND DATE(ual.created_at) >= ?";
        $params[] = $start_date;
        $types .= "s";
    }

    if ($end_date) {
        $query .= " AND DATE(ual.created_at) <= ?";
        $params[] = $end_date;
        $types .= "s";
    }

    if ($search) {
        $query .= " AND (ual.user_id LIKE ? OR ual.activity_description LIKE ? OR u.full_name LIKE ?)";
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= "sss";
    }

    // Order by newest first
    $query .= " ORDER BY ual.created_at DESC";

    // Add pagination
    $query .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";

    // Prepare and execute
    $stmt = $conn->prepare($query);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = [
            'log_id' => $row['log_id'],
            'user_id' => $row['user_id'],
            'full_name' => $row['full_name'],
            'user_type' => $row['user_type'],
            'activity_type' => $row['activity_type'],
            'activity_description' => $row['activity_description'],
            'ip_address' => $row['ip_address'],
            'created_at' => $row['created_at']
        ];
    }

    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM user_activity_log ual LEFT JOIN users u ON ual.user_id = u.user_id WHERE 1=1";
    
    if ($user_id) {
        $countQuery .= " AND ual.user_id = '$user_id'";
    }
    if ($activity_type) {
        $countQuery .= " AND ual.activity_type = '$activity_type'";
    }
    if ($start_date) {
        $countQuery .= " AND DATE(ual.created_at) >= '$start_date'";
    }
    if ($end_date) {
        $countQuery .= " AND DATE(ual.created_at) <= '$end_date'";
    }
    if ($search) {
        $countQuery .= " AND (ual.user_id LIKE '%$search%' OR ual.activity_description LIKE '%$search%' OR u.full_name LIKE '%$search%')";
    }
    
    $countResult = $conn->query($countQuery);
    $total = $countResult->fetch_assoc()['total'];

    echo json_encode([
        'status' => true,
        'data' => $logs,
        'total' => (int)$total,
        'limit' => $limit,
        'offset' => $offset
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Error fetching activity logs: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
