<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include "db.php";

$headers = getallheaders();
$token = $headers['Authorization'];

$result = mysqli_query($conn, "SELECT * FROM users WHERE token='$token'");
$user = mysqli_fetch_assoc($result);

if (!$user) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}
?>
