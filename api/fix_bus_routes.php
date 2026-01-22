<?php
/**
 * Migration Script: Fix Bus Route Names
 * 
 * This script updates all buses that have empty bus_route fields
 * by populating them with the route_name from the route table
 * based on the route_id.
 */

header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);

$conn = new mysqli("localhost", "root", "", "qr_system");

if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Find all buses with empty bus_route but valid route_id
    $selectSql = "SELECT b.bus_id, b.bus_no, b.route_id, r.route_name 
                  FROM bus b
                  LEFT JOIN route r ON b.route_id = r.route_id
                  WHERE (b.bus_route IS NULL OR b.bus_route = '') 
                  AND b.route_id IS NOT NULL
                  AND r.route_name IS NOT NULL";
    
    $result = $conn->query($selectSql);
    
    if (!$result) {
        throw new Exception("Failed to fetch buses: " . $conn->error);
    }
    
    $updated = 0;
    $failed = 0;
    $details = [];
    
    while ($row = $result->fetch_assoc()) {
        $updateStmt = $conn->prepare(
            "UPDATE bus SET bus_route = ? WHERE bus_id = ?"
        );
        
        $updateStmt->bind_param("si", $row['route_name'], $row['bus_id']);
        
        if ($updateStmt->execute()) {
            $updated++;
            $details[] = [
                "bus_id" => $row['bus_id'],
                "bus_no" => $row['bus_no'],
                "route_id" => $row['route_id'],
                "route_name" => $row['route_name'],
                "status" => "updated"
            ];
        } else {
            $failed++;
            $details[] = [
                "bus_id" => $row['bus_id'],
                "bus_no" => $row['bus_no'],
                "status" => "failed",
                "error" => $updateStmt->error
            ];
        }
        
        $updateStmt->close();
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Migration completed successfully",
        "updated" => $updated,
        "failed" => $failed,
        "details" => $details
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    
    echo json_encode([
        "success" => false,
        "message" => "Migration failed: " . $e->getMessage()
    ]);
}

$conn->close();
?>
