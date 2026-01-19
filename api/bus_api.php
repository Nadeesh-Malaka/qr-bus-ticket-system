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
    $result = $conn->query("SELECT * FROM bus ORDER BY bus_no");
    
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
            "INSERT INTO bus (bus_no, bus_type, capacity, operator_id) VALUES (?, ?, ?, ?)"
        );
        
        $stmt->bind_param(
            "ssis",
            $data['bus_no'],
            $data['bus_type'],
            $data['capacity'],
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
    }
    exit;
}

/* PUT - Update bus */
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['action']) || $data['action'] !== 'update') {
        echo json_encode(["status" => false, "message" => "Invalid request"]);
        exit;
    }
    
    $stmt = $conn->prepare(
        "UPDATE bus SET bus_no=?, bus_type=?, capacity=?, operator_id=? WHERE bus_id=?"
    );
    
    $stmt->bind_param(
        "ssisi",
        $data['bus_no'],
        $data['bus_type'],
        $data['capacity'],
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

/* DELETE - Delete bus */
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['action']) || $data['action'] !== 'delete') {
        echo json_encode(["status" => false, "message" => "Invalid request"]);
        exit;
    }
    
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

$conn->close();
?>
