<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "", "qr_system");

if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "Database connection failed"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

/* GET - Fetch all buses */
if ($method === 'GET') {
    // Join with route table to get complete route information
    $sql = "SELECT 
                b.*,
                r.route_name,
                r.start_city,
                r.end_city,
                r.province,
                r.postal_code,
                r.price
            FROM bus b
            LEFT JOIN route r ON b.route_id = r.route_id
            ORDER BY b.bus_no";
    
    $result = $conn->query($sql);
    
    $buses = [];
    while ($row = $result->fetch_assoc()) {
        $buses[] = $row;
    }
    
    echo json_encode($buses);
    exit;
}

/* POST - Create new bus */
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['action'])) {
        echo json_encode(["status" => false, "message" => "Invalid request"]);
        exit;
    }
    
    if ($data['action'] === 'create') {
        $stmt = $conn->prepare(
            "INSERT INTO bus (bus_no, route_id, bus_route, no_of_seats, bus_service_tel, start_time, reach_time, seat_rows, seat_columns, aisle_after_column, driver_id, operator_id) 
             VALUES (?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        
        $stmt->bind_param(
            "siisssiisss",
            $data['bus_no'],
            $data['route_id'],
            $data['no_of_seats'],
            $data['bus_service_tel'],
            $data['start_time'],
            $data['reach_time'],
            $data['seat_rows'],
            $data['seat_columns'],
            $data['aisle_after_column'],
            $data['driver_id'],
            $data['operator_id']
        );
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => true,
                "message" => "Bus added successfully",
                "bus_id" => $conn->insert_id
            ]);
        } else {
            echo json_encode([
                "status" => false,
                "message" => $stmt->error
            ]);
        }
        $stmt->close();
        exit;
    }
    
    /* Handle UPDATE */
    if ($data['action'] === 'update') {
        $stmt = $conn->prepare(
            "UPDATE bus SET bus_no=?, route_id=?, no_of_seats=?, bus_service_tel=?, start_time=?, reach_time=?, seat_rows=?, seat_columns=?, aisle_after_column=?, driver_id=?, operator_id=? WHERE bus_id=?"
        );
        
        $stmt->bind_param(
            "siisssiisssi",
            $data['bus_no'],
            $data['route_id'],
            $data['no_of_seats'],
            $data['bus_service_tel'],
            $data['start_time'],
            $data['reach_time'],
            $data['seat_rows'],
            $data['seat_columns'],
            $data['aisle_after_column'],
            $data['driver_id'],
            $data['operator_id'],
            $data['bus_id']
        );
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => true,
                "message" => "Bus updated successfully"
            ]);
        } else {
            echo json_encode([
                "status" => false,
                "message" => $stmt->error
            ]);
        }
        $stmt->close();
        exit;
    }
    
    /* Handle DELETE */
    if ($data['action'] === 'delete') {
        $stmt = $conn->prepare("DELETE FROM bus WHERE bus_id=?");
        $stmt->bind_param("i", $data['bus_id']);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => true,
                "message" => "Bus deleted successfully"
            ]);
        } else {
            echo json_encode([
                "status" => false,
                "message" => $stmt->error
            ]);
        }
        $stmt->close();
        exit;
    }
    
    echo json_encode(["status" => false, "message" => "Invalid action"]);
    exit;
}

$conn->close();
?>
