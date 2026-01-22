<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include 'db.php';

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

try {
    $userId = isset($input['user_id']) ? $input['user_id'] : '';
    $busNo = isset($input['bus_no']) ? $input['bus_no'] : '';
    $busId = isset($input['bus_id']) ? intval($input['bus_id']) : 0;
    $passengerName = isset($input['passenger_name']) ? $input['passenger_name'] : '';
    $travelDate = isset($input['travel_date']) ? $input['travel_date'] : '';
    $selectedSeats = isset($input['selected_seats']) ? $input['selected_seats'] : [];
    $passengerCount = isset($input['passenger_count']) ? intval($input['passenger_count']) : 0;
    $totalAmount = isset($input['total_amount']) ? floatval($input['total_amount']) : 0;
    $bookingStatus = isset($input['booking_status']) ? $input['booking_status'] : 'pending';
    
    // Validate inputs
    if (empty($userId) || empty($busNo) || empty($travelDate) || empty($selectedSeats)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields',
            'debug' => [
                'user_id' => $userId,
                'bus_no' => $busNo,
                'travel_date' => $travelDate,
                'seats' => $selectedSeats
            ]
        ]);
        exit;
    }
    
    // Check if user_id exists, if not try to find by id number
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
                'message' => "User account not found. Please contact support."
            ]);
            exit;
        }
    }
    $checkUser->close();
    
    // Start transaction
    $conn->begin_transaction();
    
    $bookingIds = [];
    $referenceNo = 'BK' . strtoupper(uniqid());
    
    // Insert booking for each selected seat
    $stmt = $conn->prepare(
        "INSERT INTO seat_booking 
        (user_id, reference_no, passenger_name, number_of_passengers, bus_no, seat_no, travel_date, legacy_status, booking_status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'BOOKED', ?, NOW())"
    );
    
    foreach ($selectedSeats as $seatNo) {
        // Check if seat is already booked for this date
        // Check both booking_status and legacy_status for compatibility
        $checkStmt = $conn->prepare(
            "SELECT seat_booking_id FROM seat_booking 
             WHERE bus_no = ? AND seat_no = ? AND travel_date = ? 
             AND (
                 booking_status IN ('pending', 'confirmed')
                 OR (legacy_status = 'BOOKED' AND (booking_status IS NULL OR booking_status NOT IN ('cancelled')))
             )"
        );
        $checkStmt->bind_param("sss", $busNo, $seatNo, $travelDate);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            $conn->rollback();
            echo json_encode([
                'success' => false,
                'message' => "Seat {$seatNo} is already booked for this date"
            ]);
            exit;
        }
        $checkStmt->close();
        
        // Insert booking
        $stmt->bind_param(
            "sssissss",
            $userId,
            $referenceNo,
            $passengerName,
            $passengerCount,
            $busNo,
            $seatNo,
            $travelDate,
            $bookingStatus
        );
        
        if (!$stmt->execute()) {
            $conn->rollback();
            echo json_encode([
                'success' => false,
                'message' => 'Failed to save booking: ' . $stmt->error
            ]);
            exit;
        }
        
        $bookingIds[] = $conn->insert_id;
    }
    
    $stmt->close();
    
    // Log user activity
    $activityStmt = $conn->prepare(
        "INSERT INTO user_activity_log (user_id, activity_type, activity_description, created_at) 
         VALUES (?, 'BOOKING_CREATED', ?, NOW())"
    );
    $activityDesc = "Created booking {$referenceNo} for bus {$busNo} on {$travelDate} - Seats: " . implode(', ', $selectedSeats);
    $activityStmt->bind_param("ss", $userId, $activityDesc);
    $activityStmt->execute();
    $activityStmt->close();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Booking saved successfully',
        'booking_id' => $bookingIds[0], // Return first booking ID as reference
        'booking_ids' => $bookingIds,
        'reference_no' => $referenceNo,
        'total_amount' => $totalAmount
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
