<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "db.php";

$result = $conn->query("SELECT * FROM route");
$routes = [];
while ($row = $result->fetch_assoc()) {
    $routes[] = $row;
}
echo json_encode($routes);
$conn->close();

?>