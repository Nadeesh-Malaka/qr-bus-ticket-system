<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include 'db.php';

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

try {
    $bookingId = isset($input['booking_id']) ? intval($input['booking_id']) : 0;
    $userId = isset($input['user_id']) ? $input['user_id'] : '';
    $amount = isset($input['amount']) ? floatval($input['amount']) : 0;
    $cardLastFour = isset($input['card_last_four']) ? $input['card_last_four'] : '';
    $paymentMethod = isset($input['payment_method']) ? $input['payment_method'] : 'CARD';
    
    if ($bookingId === 0 || empty($userId) || $amount <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid payment details',
            'debug' => [
                'booking_id' => $bookingId,
                'user_id' => $userId,
                'amount' => $amount
            ]
        ]);
        exit;
    }
    
    // Check if user_id exists, if not try to find by id number (same as save_booking_v2.php)
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
        }
    }
    $checkUser->close();
    
    // Start transaction
    $conn->begin_transaction();
    
    // Get booking details
    $bookingStmt = $conn->prepare(
        "SELECT sb.*, b.bus_id, b.bus_no, b.bus_route 
         FROM seat_booking sb
         JOIN bus b ON sb.bus_no = b.bus_no
         WHERE sb.seat_booking_id = ? AND sb.user_id = ?"
    );
    $bookingStmt->bind_param("is", $bookingId, $userId);
    $bookingStmt->execute();
    $bookingResult = $bookingStmt->get_result();
    
    if ($bookingResult->num_rows === 0) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Booking not found'
        ]);
        exit;
    }
    
    $booking = $bookingResult->fetch_assoc();
    $bookingStmt->close();
    
    // Get all seats for this reference number
    $seatsStmt = $conn->prepare(
        "SELECT seat_no FROM seat_booking WHERE reference_no = ?"
    );
    $seatsStmt->bind_param("s", $booking['reference_no']);
    $seatsStmt->execute();
    $seatsResult = $seatsStmt->get_result();
    
    $allSeats = [];
    while ($seatRow = $seatsResult->fetch_assoc()) {
        $allSeats[] = $seatRow['seat_no'];
    }
    $seatsStmt->close();
    
    // Simulate payment processing (always succeeds in simulation)
    $transactionStatus = 'completed';
    
    // Insert payment transaction
    $paymentStmt = $conn->prepare(
        "INSERT INTO payment_transaction 
        (booking_id, user_id, amount, payment_method, card_last_four, transaction_status, transaction_date) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())"
    );
    $paymentStmt->bind_param("isdsss", $bookingId, $userId, $amount, $paymentMethod, $cardLastFour, $transactionStatus);
    
    if (!$paymentStmt->execute()) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Payment processing failed'
        ]);
        exit;
    }
    
    $transactionId = $conn->insert_id;
    $paymentStmt->close();
    
    // Update booking status to confirmed
    $updateStmt = $conn->prepare(
        "UPDATE seat_booking SET booking_status = 'confirmed', updated_at = NOW() 
         WHERE reference_no = ?"
    );
    $updateStmt->bind_param("s", $booking['reference_no']);
    $updateStmt->execute();
    $updateStmt->close();
    
    // Generate ticket
    $ticketNumber = 'TKT' . strtoupper(uniqid());
    $seatNumbersStr = implode(', ', $allSeats);
    $qrCodeData = json_encode([
        'ticket_number' => $ticketNumber,
        'booking_ref' => $booking['reference_no'],
        'bus_no' => $booking['bus_no'],
        'travel_date' => $booking['travel_date'],
        'seats' => $allSeats,
        'passenger' => $booking['passenger_name']
    ]);
    
    $ticketStmt = $conn->prepare(
        "INSERT INTO ticket 
        (ticket_number, booking_id, user_id, bus_id, passenger_name, travel_date, seat_numbers, total_amount, qr_code_data, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"
    );
    $ticketStmt->bind_param(
        "sisisssds",
        $ticketNumber,
        $bookingId,
        $userId,
        $booking['bus_id'],
        $booking['passenger_name'],
        $booking['travel_date'],
        $seatNumbersStr,
        $amount,
        $qrCodeData
    );
    
    if (!$ticketStmt->execute()) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to generate ticket'
        ]);
        exit;
    }
    
    $ticketId = $conn->insert_id;
    $ticketStmt->close();
    
    // Log user activity
    $activityStmt = $conn->prepare(
        "INSERT INTO user_activity_log (user_id, activity_type, activity_description, created_at) 
         VALUES (?, 'PAYMENT_COMPLETED', ?, NOW())"
    );
    $activityDesc = "Payment completed for booking {$booking['reference_no']} - Amount: Rs. {$amount} - Ticket: {$ticketNumber}";
    $activityStmt->bind_param("ss", $userId, $activityDesc);
    $activityStmt->execute();
    $activityStmt->close();
    
    // Commit transaction
    $conn->commit();
    
    // Return success with ticket details
    echo json_encode([
        'success' => true,
        'message' => 'Payment successful',
        'transaction_id' => $transactionId,
        'ticket' => [
            'ticket_id' => $ticketId,
            'ticket_number' => $ticketNumber,
            'booking_ref' => $booking['reference_no'],
            'bus_no' => $booking['bus_no'],
            'bus_route' => $booking['bus_route'],
            'travel_date' => $booking['travel_date'],
            'passenger_name' => $booking['passenger_name'],
            'seats' => $allSeats,
            'total_amount' => $amount,
            'qr_code_data' => $qrCodeData
        ]
    ]);
    
    $conn->close();
    
} catch (Exception $e) {
    if ($conn) {
        $conn->rollback();
    }
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
