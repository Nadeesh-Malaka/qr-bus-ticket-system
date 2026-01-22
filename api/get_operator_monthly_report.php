<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $operator_id = $_GET['operator_id'] ?? '';
    $month = $_GET['month'] ?? date('m');
    $year = $_GET['year'] ?? date('Y');

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
                b.bus_no,
                b.bus_route,
                r.route_name,
                COUNT(DISTINCT sb.seat_booking_id) as total_bookings,
                COALESCE(SUM(DISTINCT t.total_amount), 0) as total_revenue,
                CASE 
                    WHEN COUNT(DISTINCT sb.seat_booking_id) > 0 
                    THEN COALESCE(SUM(DISTINCT t.total_amount), 0) / COUNT(DISTINCT sb.seat_booking_id)
                    ELSE 0 
                END as avg_per_booking
            FROM bus b
            LEFT JOIN route r ON b.route_id = r.route_id
            LEFT JOIN seat_booking sb ON b.bus_no = sb.bus_no 
                AND MONTH(sb.travel_date) = ? 
                AND YEAR(sb.travel_date) = ?
                AND sb.booking_status != 'cancelled'
            LEFT JOIN ticket t ON sb.user_id = t.user_id 
                AND MONTH(t.created_at) = ? 
                AND YEAR(t.created_at) = ?
                AND JSON_UNQUOTE(JSON_EXTRACT(t.qr_code_data, '$.bus_no')) = b.bus_no
            WHERE b.operator_id = ?
            GROUP BY b.bus_id, b.bus_no, b.bus_route, r.route_name
            ORDER BY total_revenue DESC
        ";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("iiiis", $month, $year, $month, $year, $operator_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $report = [];
        while ($row = $result->fetch_assoc()) {
            $report[] = [
                'bus_no' => $row['bus_no'],
                'route_name' => $row['route_name'] ?: $row['bus_route'],
                'total_bookings' => (int)$row['total_bookings'],
                'total_revenue' => (float)$row['total_revenue'],
                'avg_per_booking' => (float)$row['avg_per_booking']
            ];
        }

        echo json_encode([
            'success' => true,
            'report' => $report,
            'period' => [
                'month' => $month,
                'year' => $year
            ]
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error generating report: ' . $e->getMessage()
        ]);
    }

    $conn->close();
}
?>
