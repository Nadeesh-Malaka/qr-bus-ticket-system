<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "", "qr_system");

if ($conn->connect_error) {
    die(json_encode(["status" => false, "message" => "Database connection failed"]));
}

$prefixMap = [
    'admin'        => 'ADM',
    'bus operator' => 'OPR',
    'bus driver'   => 'DRV',
    'passenger'    => 'PAS'
];

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(["status" => false, "message" => "Email and password required"]);
    exit;
}

// Fetch user by email
$stmt = $conn->prepare("SELECT id, full_name, gmail, password, user_type FROM users WHERE gmail=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    echo json_encode(["status" => false, "message" => "Invalid credentials"]);
    exit;
}

// Check password (use password_verify if hashed)
if ($user['password'] !== $password) {
    echo json_encode(["status" => false, "message" => "Invalid credentials"]);
    exit;
}

// Generate user_id with prefix
$prefix = $prefixMap[$user['user_type']] ?? "USR";
$user_id = $prefix . str_pad($user['id'], 4, "0", STR_PAD_LEFT);

echo json_encode([
    "status" => true,
    "user_id" => $user_id,
    "role" => $user['user_type'],
    "full_name" => $user['full_name']
]);

$conn->close();
?>
