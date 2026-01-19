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
$qr_data = $data['qr_data'] ?? '';

if (empty($qr_data)) {
    echo json_encode(["status" => false, "message" => "No QR data provided"]);
    exit;
}

// Parse QR data (assuming format: booking_id|passenger_name|seats)
$parts = explode('|', $qr_data);

if (count($parts) < 3) {
    echo json_encode(["status" => false, "message" => "Invalid QR code format"]);
    exit;
}

$booking_id = $parts[0];
$passenger_name = $parts[1];
$seats = $parts[2];

// Verify booking exists and is valid
$stmt = $conn->prepare("
    SELECT sb.*, u.full_name 
    FROM seat_booking sb
    JOIN users u ON sb.passenger_id = u.user_id
    WHERE sb.id = ? AND sb.status = 'Booked'
");

$stmt->bind_param("s", $booking_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $booking = $result->fetch_assoc();
    
    // Update status to 'Scanned' or 'Used'
    $update = $conn->prepare("UPDATE seat_booking SET status = 'Used' WHERE id = ?");
    $update->bind_param("s", $booking_id);
    $update->execute();
    
    echo json_encode([
        "status" => true,
        "message" => "Valid ticket verified successfully",
        "data" => [
            "booking_id" => $booking_id,
            "passenger_name" => $booking['full_name'],
            "seats" => $booking['seat_number'],
            "bus_no" => $booking['bus_no'],
            "date" => $booking['booking_date']
        ]
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => "Invalid or already used ticket"
    ]);
}

$stmt->close();
$conn->close();
?>
