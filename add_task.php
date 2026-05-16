<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include "auth.php";

$data = json_decode(file_get_contents("php://input"), true);

$task = $data['task'];

mysqli_query($conn, "INSERT INTO tasks (user_id, task) VALUES (".$user['id'].", '$task')");

echo json_encode(["status" => "task added"]);
?>
