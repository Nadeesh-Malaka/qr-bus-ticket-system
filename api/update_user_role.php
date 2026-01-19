<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "", "qr_system");

if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "DB connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => false, "message" => "No data received"]);
    exit;
}

$user_id = trim($data['user_id'] ?? '');
$user_type = trim($data['user_type'] ?? '');

if (empty($user_id) || empty($user_type)) {
    echo json_encode(["status" => false, "message" => "User ID and user type required"]);
    exit;
}

// Validate user type
$valid_types = ['passenger', 'bus driver', 'bus operator', 'admin'];
if (!in_array($user_type, $valid_types)) {
    echo json_encode(["status" => false, "message" => "Invalid user type"]);
    exit;
}

// Update user type
$stmt = $conn->prepare("UPDATE users SET user_type = ? WHERE user_id = ?");
$stmt->bind_param("ss", $user_type, $user_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "status" => true,
            "message" => "User role updated successfully"
        ]);
    } else {
        echo json_encode([
            "status" => false,
            "message" => "No user found with that ID or no changes made"
        ]);
    }
} else {
    echo json_encode([
        "status" => false,
        "message" => "Update failed: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
