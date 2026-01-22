<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $operator_id = $_GET['operator_id'] ?? '';

    if (empty($operator_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'Operator ID is required'
        ]);
        exit;
    }

    try {
        $query = "
            SELECT 
                b.*,
                r.route_name,
                r.start_city,
                r.end_city
            FROM bus b
            LEFT JOIN route r ON b.route_id = r.route_id
            WHERE b.operator_id = ?
            ORDER BY b.bus_no ASC
        ";

        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("s", $operator_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();

        $buses = [];
        while ($row = $result->fetch_assoc()) {
            $buses[] = $row;
        }

        echo json_encode([
            'success' => true,
            'buses' => $buses,
            'count' => count($buses)
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }

    $conn->close();
}
?>
