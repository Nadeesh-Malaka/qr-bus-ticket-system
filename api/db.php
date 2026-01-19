<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "qr_system";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["status" => false, "message" => "DB Connection Failed"]));
}
?>