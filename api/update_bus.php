<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $bus_id = $data['bus_id'] ?? '';
    $bus_service_tel = $data['bus_service_tel'] ?? '';
    $start_time = $data['start_time'] ?? '';
    $reach_time = $data['reach_time'] ?? '';
    $operator_id = $data['operator_id'] ?? '';

    if (empty($bus_id) || empty($operator_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'Bus ID and Operator ID are required'
        ]);
        exit;
    }

    try {
        // Verify that the bus belongs to this operator
        $verifyQuery = "SELECT bus_id FROM bus WHERE bus_id = ? AND operator_id = ?";
        $stmt = $conn->prepare($verifyQuery);
        $stmt->bind_param("is", $bus_id, $operator_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'You do not have permission to edit this bus'
            ]);
            exit;
        }

        // Update bus details
        $updateQuery = "
            UPDATE bus 
            SET bus_service_tel = ?, 
                start_time = ?, 
                reach_time = ?
            WHERE bus_id = ? AND operator_id = ?
        ";

        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param("sssis", $bus_service_tel, $start_time, $reach_time, $bus_id, $operator_id);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Bus updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update bus'
            ]);
        }

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error updating bus: ' . $e->getMessage()
        ]);
    }

    $conn->close();
}
?>
