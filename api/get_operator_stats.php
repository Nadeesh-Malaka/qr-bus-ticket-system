<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $operator_id = $_GET['operator_id'] ?? '';

    error_log("Stats - Operator ID received: " . $operator_id);

    if (empty($operator_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'Operator ID is required',
            'received_id' => $operator_id
        ]);
        exit;
    }

    try {
        // Get total buses
        $busQuery = "SELECT COUNT(*) as total_buses FROM bus WHERE operator_id = ?";
        $stmt = $conn->prepare($busQuery);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("s", $operator_id);
        $stmt->execute();
        $busResult = $stmt->get_result()->fetch_assoc();
        $totalBuses = $busResult['total_buses'];

        error_log("Total buses for operator: " . $totalBuses);

        // Get today's bookings and revenue
        $todayQuery = "
            SELECT 
                COUNT(DISTINCT sb.seat_booking_id) as today_bookings,
                COALESCE(SUM(r.price), 0) as today_revenue
            FROM seat_booking sb
            INNER JOIN bus b ON sb.bus_no = b.bus_no
            LEFT JOIN route r ON b.route_id = r.route_id
            WHERE b.operator_id = ?
            AND sb.travel_date = CURDATE()
            AND sb.booking_status IN ('confirmed', 'pending')
        ";
        $stmt = $conn->prepare($todayQuery);
        $stmt->bind_param("s", $operator_id);
        $stmt->execute();
        $todayResult = $stmt->get_result()->fetch_assoc();

        // Get monthly bookings and revenue
        $monthlyQuery = "
            SELECT 
                COUNT(DISTINCT sb.seat_booking_id) as monthly_bookings,
                COALESCE(SUM(r.price), 0) as monthly_revenue
            FROM seat_booking sb
            INNER JOIN bus b ON sb.bus_no = b.bus_no
            LEFT JOIN route r ON b.route_id = r.route_id
            WHERE b.operator_id = ?
            AND MONTH(sb.travel_date) = MONTH(CURDATE())
            AND YEAR(sb.travel_date) = YEAR(CURDATE())
            AND sb.booking_status IN ('confirmed', 'pending')
        ";
        $stmt = $conn->prepare($monthlyQuery);
        $stmt->bind_param("s", $operator_id);
        $stmt->execute();
        $monthlyResult = $stmt->get_result()->fetch_assoc();

        echo json_encode([
            'success' => true,
            'data' => [
                'totalBuses' => (int)$totalBuses,
                'todayBookings' => (int)$todayResult['today_bookings'],
                'todayRevenue' => (float)$todayResult['today_revenue'],
                'monthlyBookings' => (int)$monthlyResult['monthly_bookings'],
                'monthlyRevenue' => (float)$monthlyResult['monthly_revenue']
            ]
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching stats: ' . $e->getMessage()
        ]);
    }

    $conn->close();
}
?>
