<?php
ini_set('display_errors', 0);  // hide errors from breaking JSON
header('Content-Type: application/json');

$mysqli = new mysqli("localhost", "root", "", "qr_system");
if ($mysqli->connect_error) {
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

// Get bus_no from query string
$bus_no = $_GET['bus_no'] ?? '';

if (!$bus_no) {
    // Fetch all buses
    $res = $mysqli->query("SELECT * FROM bus");
    if (!$res) {
        echo json_encode(["message" => "Failed to fetch buses"]);
        exit;
    }
    $buses = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode($buses);
    exit;
}

// Fetch selected bus
$stmt = $mysqli->prepare("SELECT * FROM bus WHERE bus_no=?");
$stmt->bind_param("s", $bus_no);
$stmt->execute();
$bus = $stmt->get_result()->fetch_assoc();

if (!$bus) {
    echo json_encode(["message" => "Bus not found"]);
    exit;
}

// Fetch booked seats
$stmt2 = $mysqli->prepare("SELECT seat_no FROM seat_booking WHERE bus_no=? AND status='booked'");
$stmt2->bind_param("s", $bus_no);
$stmt2->execute();
$bookedSeats = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

$bus['booked_seats'] = array_column($bookedSeats, 'seat_no');

echo json_encode($bus);
