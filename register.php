<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

$query = "INSERT INTO users (username, password) VALUES ('$username', '$password')";

if (mysqli_query($conn, $query)) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>
