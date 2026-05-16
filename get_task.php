<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include "auth.php";

$result = mysqli_query($conn, "SELECT * FROM tasks WHERE user_id=".$user['id']);

$tasks = [];

while ($row = mysqli_fetch_assoc($result)) {
    $tasks[] = $row;
}

echo json_encode($tasks);
?>
