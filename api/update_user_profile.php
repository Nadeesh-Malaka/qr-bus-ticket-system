<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include 'db.php';

try {
    // Parse incoming JSON data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate user_id presence
    if (!isset($data['user_id']) || empty($data['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }
    
    $string_user_id = trim($data['user_id']); // String format like 'PAS000027'
    
    // STEP 1: Get the internal integer ID and current user data
    $user_query = "SELECT id, user_id, full_name, gender, dob, nic, address1, address2, city, mobile_no, gmail 
                   FROM users 
                   WHERE user_id = ?";
    $user_stmt = $conn->prepare($user_query);
    $user_stmt->bind_param("s", $string_user_id);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    
    if ($user_result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found with ID: ' . $string_user_id
        ]);
        $user_stmt->close();
        $conn->close();
        exit;
    }
    
    $current_user = $user_result->fetch_assoc();
    $internal_id = (int)$current_user['id']; // This is the integer primary key
    $user_stmt->close();
    
    // STEP 2: Sanitize and prepare incoming data
    $full_name = trim($data['full_name'] ?? '');
    $gender = trim($data['gender'] ?? '');
    $dob = trim($data['dob'] ?? '');
    $nic = trim($data['nic'] ?? '');
    $address1 = trim($data['address1'] ?? '');
    $address2 = trim($data['address2'] ?? '');
    $city = trim($data['city'] ?? '');
    $mobile_no = trim($data['mobile_no'] ?? '');
    $gmail = trim($data['gmail'] ?? '');
    
    // Handle date of birth - convert empty or invalid dates to NULL
    if (empty($dob) || $dob === '0000-00-00' || $dob === 'mm/dd/yyyy') {
        $dob = NULL;
    }
    
    // STEP 3: Check for duplicate NIC (only if being changed)
    $current_nic = trim(strtolower(strval($current_user['nic'])));
    $new_nic = trim(strtolower(strval($nic)));
    
    // Only check if NIC is actually different (case-insensitive comparison)
    if (!empty($new_nic) && $current_nic !== $new_nic) {
        $nic_check = "SELECT id FROM users WHERE LOWER(TRIM(nic)) = LOWER(TRIM(?)) AND id != ?";
        $nic_stmt = $conn->prepare($nic_check);
        $nic_stmt->bind_param("si", $nic, $internal_id);
        $nic_stmt->execute();
        $nic_result = $nic_stmt->get_result();
        
        if ($nic_result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'This NIC is already registered with another account'
            ]);
            $nic_stmt->close();
            $conn->close();
            exit;
        }
        $nic_stmt->close();
    }
    
    // STEP 4: Check for duplicate Email (only if being changed)
    $current_gmail = trim(strtolower(strval($current_user['gmail'])));
    $new_gmail = trim(strtolower(strval($gmail)));
    
    // Only check if email is actually different (case-insensitive comparison)
    if (!empty($new_gmail) && $current_gmail !== $new_gmail) {
        $gmail_check = "SELECT id FROM users WHERE LOWER(TRIM(gmail)) = LOWER(TRIM(?)) AND id != ?";
        $gmail_stmt = $conn->prepare($gmail_check);
        $gmail_stmt->bind_param("si", $gmail, $internal_id);
        $gmail_stmt->execute();
        $gmail_result = $gmail_stmt->get_result();
        
        if ($gmail_result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'This email is already registered with another account'
            ]);
            $gmail_stmt->close();
            $conn->close();
            exit;
        }
        $gmail_stmt->close();
    }
    
    // STEP 5: Update user profile
    $update_query = "UPDATE users SET 
                     full_name = ?,
                     gender = ?,
                     dob = ?,
                     nic = ?,
                     address1 = ?,
                     address2 = ?,
                     city = ?,
                     mobile_no = ?,
                     gmail = ?
                     WHERE id = ?";
    
    $update_stmt = $conn->prepare($update_query);
    
    // Bind parameters - use NULL for dob if empty
    if ($dob === NULL) {
        $update_stmt->bind_param(
            "ssssssssi",
            $full_name,
            $gender,
            $null_value,
            $nic,
            $address1,
            $address2,
            $city,
            $mobile_no,
            $gmail,
            $internal_id
        );
        $null_value = NULL;
        $update_stmt->send_long_data(2, ''); // Send NULL for dob
    } else {
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
    }
    
    if ($update_stmt->execute()) {
        // STEP 6: Log the activity (optional)
        if ($update_stmt->affected_rows >= 0) {
            try {
                $log_query = "INSERT INTO user_activity_log (user_id, activity_type, activity_description) 
                              VALUES (?, 'PROFILE_UPDATED', 'User updated their profile information')";
                $log_stmt = $conn->prepare($log_query);
                $log_stmt->bind_param("s", $string_user_id);
                $log_stmt->execute();
                $log_stmt->close();
            } catch (Exception $log_error) {
                // Don't fail the main operation if logging fails
                error_log("Activity log error: " . $log_error->getMessage());
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update profile: ' . $update_stmt->error
        ]);
    }
    
    $update_stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
    if (isset($conn)) {
        $conn->close();
    }
}
?>
