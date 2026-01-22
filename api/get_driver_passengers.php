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

$bus_no = $_GET['bus_no'] ?? '';
$travel_date = $_GET['travel_date'] ?? date('Y-m-d');

if (empty($bus_no)) {
    echo json_encode([
        "success" => false,
        "message" => "Bus number is required"
    ]);
    exit;
}

try {
    // Get total seats for the bus
    $bus_stmt = $conn->prepare("SELECT no_of_seats FROM bus WHERE bus_no = ?");
    $bus_stmt->bind_param("s", $bus_no);
    $bus_stmt->execute();
    $bus_result = $bus_stmt->get_result();
    $bus_info = $bus_result->fetch_assoc();
    $total_seats = $bus_info['no_of_seats'] ?? 0;
    
    // Get passenger list
    $stmt = $conn->prepare("
        SELECT 
            sb.seat_booking_id,
            sb.reference_no,
            sb.passenger_name,
            sb.seat_no,
            sb.travel_date,
            sb.booking_status,
            t.ticket_number,
            t.is_verified,
            t.verified_at
        FROM seat_booking sb
        LEFT JOIN ticket t ON sb.reference_no = JSON_UNQUOTE(JSON_EXTRACT(t.qr_code_data, '$.booking_ref'))
        WHERE sb.bus_no = ? 
        AND sb.travel_date = ?
        AND sb.booking_status IN ('pending', 'confirmed')
        ORDER BY CAST(sb.seat_no AS UNSIGNED) ASC
    ");
    
    $stmt->bind_param("ss", $bus_no, $travel_date);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $passengers = [];
    $booked_count = 0;
    $verified_count = 0;
    
    while ($row = $result->fetch_assoc()) {
        $passengers[] = $row;
        $booked_count++;
        if ($row['is_verified'] == 1 || $row['booking_status'] == 'confirmed') {
            $verified_count++;
        }
    }
    
    echo json_encode([
        "success" => true,
        "passengers" => $passengers,
        "stats" => [
            "total" => (int)$total_seats,
            "booked" => $booked_count,
            "verified" => $verified_count,
            "available" => (int)$total_seats - $booked_count
        ],
        "bus_no" => $bus_no,
        "travel_date" => $travel_date
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
