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
    error_log("Login failed: User not found for email: " . $email);
    echo json_encode(["status" => false, "message" => "Invalid credentials", "debug" => "User not found"]);
    exit;
}

error_log("Login attempt for: " . $email . " | Password length in DB: " . strlen($user['password']));

// Check password - support both old plain text and new hashed passwords
// Check if password is hashed (starts with $2y$ for bcrypt)
if (strpos($user['password'], '$2y$') === 0) {
    // New hashed password
    error_log("Checking hashed password for: " . $email);
    if (!password_verify($password, $user['password'])) {
        error_log("Login failed: Hashed password mismatch for: " . $email);
        echo json_encode(["status" => false, "message" => "Invalid credentials", "debug" => "Password mismatch (hashed)"]);
        exit;
    }
    error_log("Login successful (hashed): " . $email);
} else {
    // Old plain text password - also hash it for future use
    error_log("Checking plain text password for: " . $email);
    if ($user['password'] !== $password) {
        error_log("Login failed: Plain text password mismatch for: " . $email);
        echo json_encode(["status" => false, "message" => "Invalid credentials", "debug" => "Password mismatch (plain text)"]);
        exit;
    }
    error_log("Login successful (plain text): " . $email . " - Upgrading to hashed");
    // Update to hashed password for next time
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $update = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $update->bind_param("si", $hashed, $user['id']);
    $update->execute();
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
