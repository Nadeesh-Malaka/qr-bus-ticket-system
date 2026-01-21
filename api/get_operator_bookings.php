<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $operator_id = $_GET['operator_id'] ?? '';
    $filter = $_GET['filter'] ?? 'all';
    $start_date = $_GET['start_date'] ?? '';
    $end_date = $_GET['end_date'] ?? '';

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
                sb.*,
                b.bus_route,
                r.route_name,
                r.price as route_price,
                t.total_amount,
                t.ticket_number
            FROM seat_booking sb
            INNER JOIN bus b ON sb.bus_no = b.bus_no
            LEFT JOIN route r ON b.route_id = r.route_id
            LEFT JOIN ticket t ON sb.reference_no IN (
                SELECT JSON_UNQUOTE(JSON_EXTRACT(qr_code_data, '$.booking_ref'))
                FROM ticket
                WHERE user_id = sb.user_id
            )
            WHERE b.operator_id = ?
        ";

        $params = [$operator_id];
        $types = "s";

        // Apply filters
        if ($filter === 'today') {
            $query .= " AND sb.travel_date = CURDATE()";
        } elseif ($filter === 'month') {
            $query .= " AND MONTH(sb.travel_date) = MONTH(CURDATE()) AND YEAR(sb.travel_date) = YEAR(CURDATE())";
        }

        // Custom date range
        if (!empty($start_date) && !empty($end_date)) {
            $query .= " AND sb.travel_date BETWEEN ? AND ?";
            $params[] = $start_date;
            $params[] = $end_date;
            $types .= "ss";
        }

        $query .= " ORDER BY sb.created_at DESC";

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $bookings = [];
        while ($row = $result->fetch_assoc()) {
            $bookings[] = $row;
        }

        echo json_encode([
            'success' => true,
            'bookings' => $bookings,
            'count' => count($bookings)
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching bookings: ' . $e->getMessage()
        ]);
    }

    $conn->close();
}
?>
