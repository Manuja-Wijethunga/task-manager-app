<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include "auth.php";

mysqli_query($conn, "UPDATE users SET token=NULL WHERE id=".$user['id']);

echo json_encode([
    "status" => "success",
    "message" => "Logged out successfully"
]);
?>
