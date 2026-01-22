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
    $result = $conn->query("SELECT * FROM users ORDER BY id DESC");
    
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
        
        // Generate user_id prefix based on role
        $prefixMap = [
            'admin'        => 'ADM',
            'bus_operator' => 'OPR',
            'bus operator' => 'OPR',
            'bus_driver'   => 'DRV',
            'bus driver'   => 'DRV',
            'passenger'    => 'PAS'
        ];
        
        // Convert role to database format (replace spaces with underscores)
        $userType = str_replace(' ', '_', $data['user_type']);
        
        $conn->begin_transaction();
        
        try {
            // Insert user
            $stmt = $conn->prepare(
                "INSERT INTO users (full_name, gender, nic, city, mobile_no, gmail, password, user_type, dob, address1, address2) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', '', '')"
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
                $userType
            );
            
            if (!$stmt->execute()) {
                throw new Exception($stmt->error);
            }
            
            $lastId = $conn->insert_id;
            
            // Generate formatted user_id
            $prefix = $prefixMap[$userType] ?? 'PAS';
            $userId = $prefix . str_pad($lastId, 6, "0", STR_PAD_LEFT);
            
            // Update user_id
            $updateStmt = $conn->prepare("UPDATE users SET user_id=? WHERE id=?");
            $updateStmt->bind_param("si", $userId, $lastId);
            
            if (!$updateStmt->execute()) {
                throw new Exception($updateStmt->error);
            }
            
            $conn->commit();
            
            echo json_encode([
                "status" => true,
                "message" => "User created successfully",
                "user_id" => $userId
            ]);
            
            $stmt->close();
            $updateStmt->close();
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode([
                "status" => false,
                "message" => $e->getMessage()
            ]);
        }
        exit;
    }
    
    /* UPDATE USER */
    if ($data['action'] === 'update') {
        // Convert role to database format (replace spaces with underscores)
        $db_user_type = str_replace(' ', '_', $data['user_type']);
        
        if (empty($data['password'])) {
            // Update without changing password
            $stmt = $conn->prepare(
                "UPDATE users SET full_name=?, gender=?, nic=?, city=?, mobile_no=?, gmail=?, user_type=? WHERE id=?"
            );
            
            $stmt->bind_param(
                "sssssssi",
                $data['full_name'],
                $data['gender'],
                $data['nic'],
                $data['city'],
                $data['mobile_no'],
                $data['gmail'],
                $db_user_type,
                $data['id']
            );
        } else {
            // Update with new password
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            
            $stmt = $conn->prepare(
                "UPDATE users SET full_name=?, gender=?, nic=?, city=?, mobile_no=?, gmail=?, password=?, user_type=? WHERE id=?"
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
                $db_user_type,
                $data['id']
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
        if (!isset($data['id']) || empty($data['id'])) {
            echo json_encode([
                "status" => false,
                "message" => "User ID is required"
            ]);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
        $stmt->bind_param("i", $data['id']);
        
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
