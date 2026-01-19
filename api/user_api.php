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

/* GET - Fetch all users */
if ($method === 'GET') {
    $result = $conn->query("SELECT user_id, full_name, gender, nic, city, mobile_no, gmail, user_type FROM users ORDER BY user_id DESC");
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    echo json_encode($users);
    exit;
}

/* POST - Create, Update, or Delete user */
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['action'])) {
        echo json_encode(["status" => false, "message" => "Invalid request"]);
        exit;
    }
    
    /* CREATE USER */
    if ($data['action'] === 'create') {
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt = $conn->prepare(
            "INSERT INTO users (full_name, gender, nic, city, mobile_no, gmail, password, user_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        
        $stmt->bind_param(
            "ssssssss",
            $data['full_name'],
            $data['gender'],
            $data['nic'],
            $data['city'],
            $data['mobile_no'],
            $data['gmail'],
            $hashedPassword,
            $data['user_type']
        );
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => true,
                "message" => "User created successfully",
                "user_id" => $conn->insert_id
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
    
    /* UPDATE USER */
    if ($data['action'] === 'update') {
        if (empty($data['password'])) {
            // Update without changing password
            $stmt = $conn->prepare(
                "UPDATE users SET full_name=?, gender=?, nic=?, city=?, mobile_no=?, gmail=?, user_type=? WHERE user_id=?"
            );
            
            $stmt->bind_param(
                "sssssssi",
                $data['full_name'],
                $data['gender'],
                $data['nic'],
                $data['city'],
                $data['mobile_no'],
                $data['gmail'],
                $data['user_type'],
                $data['user_id']
            );
        } else {
            // Update with new password
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            
            $stmt = $conn->prepare(
                "UPDATE users SET full_name=?, gender=?, nic=?, city=?, mobile_no=?, gmail=?, password=?, user_type=? WHERE user_id=?"
            );
            
            $stmt->bind_param(
                "ssssssssi",
                $data['full_name'],
                $data['gender'],
                $data['nic'],
                $data['city'],
                $data['mobile_no'],
                $data['gmail'],
                $hashedPassword,
                $data['user_type'],
                $data['user_id']
            );
        }
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => true,
                "message" => "User updated successfully"
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
    
    /* DELETE USER */
    if ($data['action'] === 'delete') {
        $stmt = $conn->prepare("DELETE FROM users WHERE user_id=?");
        $stmt->bind_param("i", $data['user_id']);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => true,
                "message" => "User deleted successfully"
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
