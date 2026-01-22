<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

include 'db.php';

try {
    // Get search parameters
    $fromCity = isset($_GET['from']) ? trim($_GET['from']) : '';
    $toCity = isset($_GET['to']) ? trim($_GET['to']) : '';
    
    if (empty($fromCity) || empty($toCity)) {
        echo json_encode([
            'success' => false,
            'message' => 'From and To cities are required'
        ]);
        exit;
    }
    
    // Search for buses that match the route
    // Using start_city and end_city from route table
    // Price is stored in route table, not bus table
    // Using LOWER() and TRIM() for case-insensitive and whitespace-tolerant comparison
    $sql = "SELECT 
                b.bus_id,
                b.bus_no,
                b.bus_route,
                b.no_of_seats,
                b.seat_rows,
                b.seat_columns,
                b.bus_service_tel,
                b.start_time,
                b.reach_time,
                r.route_id,
                r.route_name,
                r.start_city,
                r.end_city,
                r.province,
                r.price as base_fare
            FROM bus b
            JOIN route r ON b.route_id = r.route_id
            WHERE LOWER(TRIM(r.start_city)) = LOWER(?) 
            AND LOWER(TRIM(r.end_city)) = LOWER(?)
            ORDER BY b.start_time";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $fromCity, $toCity);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $buses = [];
    while ($row = $result->fetch_assoc()) {
        $buses[] = $row;
    }
    
    if (count($buses) > 0) {
        echo json_encode([
            'success' => true,
            'data' => $buses,
            'count' => count($buses)
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No buses found for this route',
            'data' => []
        ]);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
