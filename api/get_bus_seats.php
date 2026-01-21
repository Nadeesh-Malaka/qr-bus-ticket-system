<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include 'db.php';

try {
    $busId = isset($_GET['bus_id']) ? intval($_GET['bus_id']) : 0;
    
    if ($busId === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Bus ID is required'
        ]);
        exit;
    }
    
    // Get bus details including seat configuration
    $busQuery = "SELECT bus_no, no_of_seats, seat_rows, seat_columns, aisle_after_column FROM bus WHERE bus_id = ?";
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
    
    $bus = $busResult->fetch_assoc();
    $stmt->close();
    
    // Generate seat layout using bus configuration
    $totalSeats = (int)$bus['no_of_seats'];
    $configRows = (int)$bus['seat_rows'];
    $configCols = (int)$bus['seat_columns'];
    
    // Use configured values or fallback to defaults
    $seatsPerRow = ($configCols > 0) ? $configCols : 4;
    $totalRows = ($configRows > 0) ? $configRows : ceil($totalSeats / $seatsPerRow);
    
    $seats = [];
    $seatCounter = 1;
    
    for ($row = 1; $row <= $totalRows && $seatCounter <= $totalSeats; $row++) {
        for ($col = 1; $col <= $seatsPerRow && $seatCounter <= $totalSeats; $col++) {
            $seats[] = [
                'seat_id' => $seatCounter,
                'bus_id' => $busId,
                'seat_no' => $seatCounter,
                'row_no' => $row,
                'col_no' => $col,
                'is_large_seat' => 0
            ];
            $seatCounter++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $seats,
        'bus_no' => $bus['bus_no'],
        'total_seats' => count($seats)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>