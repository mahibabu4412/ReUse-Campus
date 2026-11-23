<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Invalid request']); exit;
}
verify_csrf();
if (!authUser()) {
    echo json_encode(['ok' => false, 'login_required' => true, 'redirect' => url('auth/login.php')]); exit;
}
$uid = (int)authUser()['id'];
$lid = (int)($_POST['listing_id'] ?? 0);
if (!$lid) { echo json_encode(['ok'=>false,'message'=>'Invalid item']); exit; }

$exists = dbOne('SELECT id FROM favorites WHERE user_id=? AND listing_id=?', [$uid, $lid]);
if ($exists) {
    db('DELETE FROM favorites WHERE id=?', [$exists['id']]);
    $saved = false;
} else {
    db('INSERT INTO favorites (user_id,listing_id) VALUES (?,?)', [$uid, $lid]);
    $saved = true;
}
$count = (int)dbOne('SELECT COUNT(*) c FROM favorites WHERE user_id=?', [$uid])['c'];
echo json_encode(['ok' => true, 'saved' => $saved, 'count' => $count]);
