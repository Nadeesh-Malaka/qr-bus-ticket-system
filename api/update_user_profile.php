<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

// Ensure no output before JSON
ob_start();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || empty($data['user_id'])) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }
    
    $user_id = trim($data['user_id']);
    
    // Get current user data
    $stmt = $conn->prepare("SELECT id FROM users WHERE user_id = ?");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        $stmt->close();
        exit;
    }
    
    $user = $result->fetch_assoc();
    $internal_id = $user['id'];
    $stmt->close();
    
    // Prepare update data
    $full_name = trim($data['full_name'] ?? '');
    $gender = trim($data['gender'] ?? '');
    $dob = trim($data['dob'] ?? '');
    $nic = trim($data['nic'] ?? '');
    $address1 = trim($data['address1'] ?? '');
    $address2 = trim($data['address2'] ?? '');
    $city = trim($data['city'] ?? '');
    $mobile_no = trim($data['mobile_no'] ?? '');
    $gmail = trim($data['gmail'] ?? '');
    
    // Update query
    $update_stmt = $conn->prepare("
        UPDATE users SET 
            full_name = ?,
            gender = ?,
            dob = ?,
            nic = ?,
            address1 = ?,
            address2 = ?,
            city = ?,
            mobile_no = ?,
            gmail = ?
        WHERE id = ?
    ");
    
    $update_stmt->bind_param(
        "sssssssssi",
        $full_name,
        $gender,
        $dob,
        $nic,
        $address1,
        $address2,
        $city,
        $mobile_no,
        $gmail,
        $internal_id
    );
    
    if ($update_stmt->execute()) {
        // Log activity
        try {
            $log_stmt = $conn->prepare("
                INSERT INTO user_activity_log (user_id, activity_type, activity_description) 
                VALUES (?, 'PROFILE_UPDATED', 'User updated their profile information')
            ");
            $log_stmt->bind_param("s", $user_id);
            $log_stmt->execute();
            $log_stmt->close();
        } catch (Exception $e) {
            // Ignore log errors
        }
        
        ob_end_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
    } else {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update profile'
        ]);
    }
    
    $update_stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
