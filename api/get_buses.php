<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "qr_system");

if ($conn->connect_error) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT bus_id, bus_no FROM bus ORDER BY bus_no";
$res = $conn->query($sql);

$buses = [];
while ($row = $res->fetch_assoc()) {
    $buses[] = $row;
}

echo json_encode($buses);

?>