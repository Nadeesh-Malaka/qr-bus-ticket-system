<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "", "qr_system");
if ($conn->connect_error) {
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$action = $data['action'] ?? '';

/* 🔍 DEBUG LINE */
file_put_contents("debug.log", $raw . PHP_EOL, FILE_APPEND);

/* ---------- CREATE ---------- */
if ($action === "create") {
    $stmt = $conn->prepare(
        "INSERT INTO route (route_name, start_city, end_city, province, postal_code)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->bind_param(
        "ssssi",
        $data['route_name'],
        $data['start_city'],
        $data['end_city'],
        $data['province'],
        $data['postal_code']
    );

    echo json_encode(["status" => $stmt->execute()]);
    exit;
}

/* ---------- UPDATE ---------- */
if ($action === "update") {
    $stmt = $conn->prepare(
        "UPDATE route
         SET route_name=?, start_city=?, end_city=?, province=?, postal_code=?
         WHERE route_id=?"
    );

    $stmt->bind_param(
        "ssssii",
        $data['route_name'],
        $data['start_city'],
        $data['end_city'],
        $data['province'],
        $data['postal_code'],
        $data['route_id']
    );

    echo json_encode([
        "status" => $stmt->execute(),
        "affected" => $stmt->affected_rows
    ]);
    exit;
}

/* ---------- DELETE ---------- */
if ($action === "delete") {
    $stmt = $conn->prepare("DELETE FROM route WHERE route_id=?");
    $stmt->bind_param("i", $data['route_id']);

    echo json_encode([
        "status" => $stmt->execute(),
        "affected" => $stmt->affected_rows
    ]);
    exit;
}

/* ---------- READ ---------- */
$result = $conn->query(
    "SELECT route_id, route_name, start_city, end_city, province, postal_code FROM route"
);

$routes = [];
while ($row = $result->fetch_assoc()) {
    $routes[] = $row;
}

echo json_encode($routes);

$conn->close();

?>