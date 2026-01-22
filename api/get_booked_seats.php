<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

include 'db.php';

try {
    $busId = isset($_GET['bus_id']) ? intval($_GET['bus_id']) : 0;
    $travelDate = isset($_GET['travel_date']) ? $_GET['travel_date'] : '';
    
    if ($busId === 0 || empty($travelDate)) {
        echo json_encode([
            'success' => false,
            'message' => 'Bus ID and travel date are required'
        ]);
        exit;
    }
    
    // Get the bus_no for this bus_id
    $busQuery = "SELECT bus_no FROM bus WHERE bus_id = ?";
    $stmt = $conn->prepare($busQuery);
    $stmt->bind_param("i", $busId);
    $stmt->execute();
    $busResult = $stmt->get_result();
    
    if ($busResult->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Bus not found'
        ]);
        exit;
    }
    
    $busRow = $busResult->fetch_assoc();
    $busNo = $busRow['bus_no'];
    $stmt->close();
    
    // Query to get all booked seats for this bus and date
    // Only count confirmed bookings (not pending or cancelled)
    $sql = "SELECT 
                seat_no,
                passenger_name,
                booking_status
            FROM seat_booking 
            WHERE bus_no = ? 
            AND travel_date = ?
            AND (booking_status = 'confirmed' OR booking_status = 'pending')
            AND (legacy_status IS NULL OR legacy_status != 'CANCELLED')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $busNo, $travelDate);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookedSeats = [];
    $bookingDetails = [];
    
    while ($row = $result->fetch_assoc()) {
        $bookedSeats[] = $row['seat_no'];
        $bookingDetails[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'bus_id' => $busId,
        'bus_no' => $busNo,
        'travel_date' => $travelDate,
        'booked_seats' => $bookedSeats,
        'booking_count' => count($bookedSeats),
        'details' => $bookingDetails
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
