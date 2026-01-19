<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "qr_system");

if ($conn->connect_error) {
    echo json_encode(["status" => false, "message" => "DB connection failed"]);
    exit;
}

/* Read JSON safely */
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => false, "message" => "No data received"]);
    exit;
}

/* Get inputs */
$fullname = trim($data['fullname'] ?? '');
$gender   = trim($data['gender'] ?? '');
$dob      = trim($data['dob'] ?? '');
$nic      = trim($data['nic'] ?? '');
$addr1    = trim($data['address1'] ?? '');
$addr2    = trim($data['address2'] ?? '');
$city     = trim($data['city'] ?? '');
$mobile   = trim($data['mobile'] ?? '');
$usertype = trim($data['usertype'] ?? '');
$gmail    = trim($data['gmail'] ?? '');
$password = trim($data['password'] ?? '');

/* User type → prefix map */
$prefixMap = [
    'admin'        => 'ADM',
    'bus operator' => 'OPR',
    'bus driver'   => 'DRV',
    'passenger'    => 'PAS'
];

if (!isset($prefixMap[$usertype])) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid user type"
    ]);
    exit;
}

/* Start transaction */
$conn->begin_transaction();

try {

    /* Insert user without user_id */
    $stmt = $conn->prepare(
        "INSERT INTO users
        (full_name, gender, dob, nic, address1, address2, city, mobile_no, user_type, gmail, password)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)"
    );

    $stmt->bind_param(
        "sssssssssss",
        $fullname, $gender, $dob, $nic,
        $addr1, $addr2, $city, $mobile, $usertype, $gmail, $password
    );

    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    /* Get auto increment ID */
    $last_id = $conn->insert_id;

    /* Generate formatted user_id */
    $prefix  = $prefixMap[$usertype];
    $user_id = $prefix . str_pad($last_id, 6, "0", STR_PAD_LEFT);

    /* Update user_id */
    $update = $conn->prepare(
        "UPDATE users SET user_id=? WHERE id=?"
    );
    $update->bind_param("si", $user_id, $last_id);

    if (!$update->execute()) {
        throw new Exception($update->error);
    }

    /* Commit transaction */
    $conn->commit();

    echo json_encode([
        "status"  => true,
        "user_id" => $user_id
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}

/* Close connections */
$stmt->close();
$update->close();
$conn->close();
?>