<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$conn = new mysqli("localhost", "root", "", "qr_system");

$bus_no = $_GET['bus_no'] ?? '';

if ($bus_no === '') {
    echo json_encode(["total_seats" => 0, "booked_seats" => []]);
    exit;
}

/* total seats */
$stmt = $conn->prepare("SELECT no_of_seats FROM bus WHERE bus_no=?");
$stmt->bind_param("s", $bus_no);
$stmt->execute();
$res = $stmt->get_result();

$total_seats = 0;
if ($res->num_rows > 0) {
    $total_seats = (int)$res->fetch_assoc()['no_of_seats'];
}

/* booked seats */
$stmt2 = $conn->prepare(
    "SELECT seat_no FROM seat_booking WHERE bus_no=? AND status='Booked'"
);
$stmt2->bind_param("s", $bus_no);
$stmt2->execute();
$res2 = $stmt2->get_result();

$booked = [];
while ($r = $res2->fetch_assoc()) {
    $booked[] = $r['seat_no'];
}

echo json_encode([
    "total_seats" => $total_seats,
    "booked_seats" => $booked
]);


?>