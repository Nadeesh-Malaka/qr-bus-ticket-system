<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$ticket_number = $data['ticket_number'] ?? '';
$driver_id = $data['driver_id'] ?? '';

if (empty($ticket_number)) {
    echo json_encode([
        "success" => false, 
        "message" => "No ticket number provided"
    ]);
    exit;
}

try {
    // Get ticket details with bus info
    $stmt = $conn->prepare("
        SELECT 
            t.*,
            b.bus_no,
            b.driver_id,
            b.bus_route,
            r.route_name
        FROM ticket t
        LEFT JOIN bus b ON t.bus_id = b.bus_id
        LEFT JOIN route r ON b.route_id = r.route_id
        WHERE t.ticket_number = ?
    ");
    
    $stmt->bind_param("s", $ticket_number);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Ticket not found"
        ]);
        exit;
    }

    $ticket = $result->fetch_assoc();
    
    // Check if ticket is already verified
    if ($ticket['is_verified'] == 1) {
        echo json_encode([
            "success" => false,
            "message" => "Ticket already verified on " . date('M d, Y H:i', strtotime($ticket['verified_at'])),
            "ticket" => $ticket
        ]);
        exit;
    }
    
    // Check if travel date matches today
    $travel_date = $ticket['travel_date'];
    $today = date('Y-m-d');
    
    if ($travel_date !== $today) {
        $date_display = date('M d, Y', strtotime($travel_date));
        if (strtotime($travel_date) < strtotime($today)) {
            echo json_encode([
                "success" => false,
                "message" => "Ticket expired. Valid for: $date_display",
                "ticket" => $ticket
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Ticket valid for: $date_display (not today)",
                "ticket" => $ticket
            ]);
        }
        exit;
    }
    
    // Optional: Check if driver matches (if driver_id provided)
    if (!empty($driver_id) && !empty($ticket['driver_id']) && $ticket['driver_id'] !== $driver_id) {
        echo json_encode([
            "success" => false,
            "message" => "This ticket is for a different bus/driver",
            "ticket" => $ticket
        ]);
        exit;
    }
    
    // Mark ticket as verified
    $update_stmt = $conn->prepare("
        UPDATE ticket 
        SET is_verified = 1, verified_at = NOW() 
        WHERE ticket_number = ?
    ");
    $update_stmt->bind_param("s", $ticket_number);
    $update_stmt->execute();
    
    // Update booking status
    $update_booking = $conn->prepare("
        UPDATE seat_booking 
        SET booking_status = 'verified' 
        WHERE reference_no = (
            SELECT JSON_UNQUOTE(JSON_EXTRACT(qr_code_data, '$.booking_ref'))
            FROM ticket 
            WHERE ticket_number = ?
        )
    ");
    $update_booking->bind_param("s", $ticket_number);
    $update_booking->execute();
    
    echo json_encode([
        "success" => true,
        "message" => "✅ Ticket verified successfully!",
        "ticket" => $ticket
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
