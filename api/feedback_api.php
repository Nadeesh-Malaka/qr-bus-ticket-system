<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

/* ---------- PREFLIGHT ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ---------- DB CONNECTION ---------- */
$conn = new mysqli("localhost", "root", "", "qr_system");
if ($conn->connect_error) {
    echo json_encode([
        "status" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

/* ---------- INPUT ---------- */
$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? '';

/* ---------- CREATE FEEDBACK ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === "create") {

    if (
        empty($data['customer_name']) ||
        empty($data['description']) ||
        empty($data['email']) ||
        empty($data['review_rate'])
    ) {
        echo json_encode([
            "status" => false,
            "message" => "All fields are required"
        ]);
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO customer_review 
        (customer_name, description, email, review_rate) 
        VALUES (?, ?, ?, ?)"
    );

    if (!$stmt) {
        echo json_encode([
            "status" => false,
            "message" => $conn->error
        ]);
        exit;
    }

    $stmt->bind_param(
        "sssi",
        $data['customer_name'],
        $data['description'],
        $data['email'],
        $data['review_rate']
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => true,
            "message" => "Feedback added successfully"
        ]);
    } else {
        echo json_encode([
            "status" => false,
            "message" => $stmt->error
        ]);
    }

    $stmt->close();
    exit;
}

/* ---------- GET FEEDBACK ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM customer_review ORDER BY review_id DESC");

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "status" => true,
        "data" => $data
    ]);
    exit;
}

$conn->close();
?>