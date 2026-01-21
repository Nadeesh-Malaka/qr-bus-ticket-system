<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* DB Connection */
$conn = new mysqli("localhost", "root", "", "qr_system");

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

/* 🔴 DELETE USER (POST) */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['user_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "User ID not provided"
        ]);
        exit;
    }

    $user_id = intval($data['user_id']);

    $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "User deleted successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Delete failed"
        ]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

/* 🔵 GET USERS (GET) */
// Check if filtering by specific user_id
if (isset($_GET['user_id']) && !empty($_GET['user_id'])) {
    $user_id = $_GET['user_id'];
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode($data);
    $stmt->close();
} else {
    // Return all users if no filter
    $sql = "SELECT * FROM users";
    $result = $conn->query($sql);
    
    if (!$result) {
        echo json_encode([]);
        exit;
    }
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode($data);
}

$conn->close();

?>