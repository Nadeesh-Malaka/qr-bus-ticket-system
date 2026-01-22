<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

$driver_id = $_GET['driver_id'] ?? '';
$date = $_GET['date'] ?? date('Y-m-d');

if (empty($driver_id)) {
    echo json_encode([
        "success" => false,
        "message" => "Driver ID is required"
    ]);
    exit;
}

try {
    // Get buses assigned to this driver with their schedules for the specified date
    $stmt = $conn->prepare("
        SELECT 
            b.bus_id,
            b.bus_no,
            b.bus_route,
            b.no_of_seats AS total_seats,
            b.start_time,
            b.reach_time,
            b.bus_service_tel,
            r.route_name,
            r.start_city,
            r.end_city,
            r.price,
            (SELECT COUNT(*) 
             FROM seat_booking sb 
             WHERE sb.bus_no = b.bus_no 
             AND sb.travel_date = ?
             AND sb.booking_status IN ('pending', 'confirmed')
            ) AS booked_seats
        FROM bus b
        LEFT JOIN route r ON b.route_id = r.route_id
        WHERE b.driver_id = ?
        ORDER BY b.start_time ASC
    ");
    
    $stmt->bind_param("ss", $date, $driver_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $schedules = [];
    while ($row = $result->fetch_assoc()) {
        $schedules[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "schedules" => $schedules,
        "date" => $date
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
