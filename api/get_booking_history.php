<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

try {
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : '';
    
    if (empty($userId)) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID required'
        ]);
        exit;
    }
    
    // Check if user_id exists, if not try to find by id number (same logic as save_booking_v2.php)
    $checkUser = $conn->prepare("SELECT user_id FROM users WHERE user_id = ?");
    $checkUser->bind_param("s", $userId);
    $checkUser->execute();
    $checkResult = $checkUser->get_result();
    
    if ($checkResult->num_rows === 0) {
        // Try to find user by extracting ID number and looking for similar user_id
        $idNumber = preg_replace('/[^0-9]/', '', $userId);
        $prefix = preg_replace('/[0-9]/', '', $userId);
        
        // Try different padding formats
        $tryIds = [
            $prefix . str_pad($idNumber, 6, "0", STR_PAD_LEFT), // PAS000027
            $prefix . str_pad($idNumber, 5, "0", STR_PAD_LEFT), // PAS00027
            $prefix . str_pad($idNumber, 4, "0", STR_PAD_LEFT), // PAS0027
        ];
        
        $foundUserId = null;
        foreach ($tryIds as $tryId) {
            $tryStmt = $conn->prepare("SELECT user_id FROM users WHERE user_id = ?");
            $tryStmt->bind_param("s", $tryId);
            $tryStmt->execute();
            $tryResult = $tryStmt->get_result();
            if ($tryResult->num_rows > 0) {
                $foundUserId = $tryId;
                break;
            }
            $tryStmt->close();
        }
        
        if ($foundUserId) {
            $userId = $foundUserId; // Use the correct format
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
            exit;
        }
    }
    $checkUser->close();
    
    // Get all unique bookings grouped by reference_no
    $sql = "SELECT 
                sb.reference_no,
                sb.user_id,
                sb.passenger_name,
                sb.bus_no,
                sb.travel_date,
                sb.booking_status,
                sb.created_at,
                GROUP_CONCAT(sb.seat_no ORDER BY sb.seat_no SEPARATOR ', ') as seat_numbers,
                COUNT(sb.seat_no) as seat_count,
                b.bus_route,
                b.bus_id,
                r.start_city,
                r.end_city,
                r.price,
                pt.transaction_id,
                pt.transaction_status,
                pt.amount as paid_amount,
                t.ticket_number,
                t.ticket_id
            FROM seat_booking sb
            JOIN bus b ON sb.bus_no = b.bus_no
            LEFT JOIN route r ON b.bus_route = r.route_name
            LEFT JOIN payment_transaction pt ON sb.seat_booking_id = pt.booking_id
            LEFT JOIN ticket t ON sb.seat_booking_id = t.booking_id
            WHERE sb.user_id = ?
            GROUP BY sb.reference_no
            ORDER BY sb.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $totalAmount = floatval($row['price']) * intval($row['seat_count']);
        
        $bookings[] = [
            'reference_no' => $row['reference_no'],
            'passenger_name' => $row['passenger_name'],
            'bus_no' => $row['bus_no'],
            'bus_id' => $row['bus_id'],
            'bus_route' => $row['bus_route'],
            'start_city' => $row['start_city'],
            'end_city' => $row['end_city'],
            'travel_date' => $row['travel_date'],
            'seat_numbers' => $row['seat_numbers'],
            'seat_count' => $row['seat_count'],
            'booking_status' => $row['booking_status'],
            'payment_status' => $row['transaction_status'] ?? 'unpaid',
            'total_amount' => $totalAmount,
            'paid_amount' => $row['paid_amount'],
            'ticket_number' => $row['ticket_number'],
            'ticket_id' => $row['ticket_id'],
            'transaction_id' => $row['transaction_id'],
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $bookings,
        'count' => count($bookings)
    ]);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>