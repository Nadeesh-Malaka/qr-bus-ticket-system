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

/* DB CONNECTION */
$conn = new mysqli("localhost", "root", "", "qr_system");

if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "DB connection failed"]);
    exit;
}

/* READ JSON INPUT */
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["status" => false, "message" => "Invalid JSON"]);
    exit;
}

/* SAFE ACCESS */
$bus_no        = $data['bus_no'] ?? null;
$route_id     = $data['route_id'] ?? null;
$schedule_date= $data['schedule_date'] ?? null;
$departure    = $data['departure_time'] ?? null;
$arrival      = $data['arrival_time'] ?? null;

if (!$bus_no || !$route_id || !$schedule_date || !$departure || !$arrival) {
    echo json_encode(["status" => false, "message" => "Missing fields"]);
    exit;
}

/* PREPARE SQL */
$sql = "INSERT INTO schedule (bus_no, route_id, schedule_date, departure_time, arrival_time)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "status" => false,
        "message" => "SQL prepare failed",
        "error" => $conn->error
    ]);
    exit;
}

/* BIND & EXECUTE */
$stmt->bind_param("sisss", $bus_no, $route_id, $schedule_date, $departure, $arrival);

if ($stmt->execute()) {
    echo json_encode(["status" => true, "message" => "Schedule added"]);
} else {
    echo json_encode(["status" => false, "message" => "Insert failed"]);
}

$stmt->close();
$conn->close();
?>