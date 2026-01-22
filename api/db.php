<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "qr_system";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    die(json_encode(["status" => false, "message" => "DB Connection Failed"]));
}
