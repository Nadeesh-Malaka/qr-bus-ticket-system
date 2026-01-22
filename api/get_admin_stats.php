<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get total users
        $userQuery = "SELECT COUNT(*) as total_users FROM users";
        $userResult = $conn->query($userQuery);
        $totalUsers = $userResult->fetch_assoc()['total_users'];

        // Get total buses
        $busQuery = "SELECT COUNT(*) as total_buses FROM bus";
        $busResult = $conn->query($busQuery);
        $totalBuses = $busResult->fetch_assoc()['total_buses'];

        // Get today's bookings and revenue
        $todayQuery = "
            SELECT 
                COUNT(DISTINCT sb.seat_booking_id) as today_bookings,
                COALESCE(SUM(pt.amount), 0) as today_revenue
            FROM seat_booking sb
            LEFT JOIN payment_transaction pt ON sb.seat_booking_id = pt.booking_id
            WHERE sb.travel_date = CURDATE()
            AND sb.booking_status IN ('confirmed', 'pending')
        ";
        $todayResult = $conn->query($todayQuery);
        $todayData = $todayResult->fetch_assoc();

        // Get monthly bookings and revenue
        $monthlyQuery = "
            SELECT 
                COUNT(DISTINCT sb.seat_booking_id) as monthly_bookings,
                COALESCE(SUM(pt.amount), 0) as monthly_revenue
            FROM seat_booking sb
            LEFT JOIN payment_transaction pt ON sb.seat_booking_id = pt.booking_id
            WHERE MONTH(sb.travel_date) = MONTH(CURDATE())
            AND YEAR(sb.travel_date) = YEAR(CURDATE())
            AND sb.booking_status IN ('confirmed', 'pending')
        ";
        $monthlyResult = $conn->query($monthlyQuery);
        $monthlyData = $monthlyResult->fetch_assoc();

        echo json_encode([
            'success' => true,
            'data' => [
                'totalUsers' => (int)$totalUsers,
                'totalBuses' => (int)$totalBuses,
                'todayBookings' => (int)$todayData['today_bookings'],
                'todayRevenue' => (float)$todayData['today_revenue'],
                'monthlyBookings' => (int)$monthlyData['monthly_bookings'],
                'monthlyRevenue' => (float)$monthlyData['monthly_revenue']
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
