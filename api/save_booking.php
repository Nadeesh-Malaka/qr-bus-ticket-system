<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
$mysqli = new mysqli("localhost", "root", "", "qr_system");
if ($mysqli->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'DB connection failed']);
    exit;
}

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit;
}

$passenger_name = $mysqli->real_escape_string($data['passenger_name'] ?? '');
$bus_no = $mysqli->real_escape_string($data['bus_no'] ?? '');
$seats = $data['seats'] ?? [];

if (!$passenger_name || !$bus_no || empty($seats)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

// Check if seats are already booked
$alreadyBooked = [];
foreach ($seats as $seat) {
    $seat = $mysqli->real_escape_string($seat);
    $res = $mysqli->query("SELECT * FROM seat_booking WHERE bus_no='$bus_no' AND seat_no='$seat'");
    if ($res && $res->num_rows > 0) {
        $alreadyBooked[] = $seat;
    }
}

if (!empty($alreadyBooked)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Seats already booked: ' . implode(', ', $alreadyBooked)
    ]);
    exit;
}

// Insert bookings
foreach ($seats as $seat) {
    $seat = $mysqli->real_escape_string($seat);
    $query = "INSERT INTO seat_booking (passenger_name, bus_no, seat_no, status, created_at)
              VALUES ('$passenger_name', '$bus_no', '$seat', 'booked', NOW())";

    if (!$mysqli->query($query)) {
        echo json_encode(['status' => 'error', 'message' => 'Insert failed: ' . $mysqli->error]);
        exit;
    }
}

// Return success
echo json_encode(['status' => 'success']);
?>
