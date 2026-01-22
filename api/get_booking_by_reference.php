<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

include 'db.php';

try {
    $referenceNo = isset($_GET['reference_no']) ? $_GET['reference_no'] : '';
    
    if (empty($referenceNo)) {
        echo json_encode([
            'success' => false,
            'message' => 'Reference number required'
        ]);
        exit;
    }
    
    // Get all bookings with this reference number
    $sql = "SELECT * FROM seat_booking WHERE reference_no = ? ORDER BY seat_no";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $referenceNo);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
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
