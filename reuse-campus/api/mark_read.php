<?php
require_once __DIR__ . '/../includes/auth.php';
requireLogin();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $uid = (int)authUser()['id'];
    if (clean($_POST['scope'] ?? '') === 'one') {
        $nid = (int)($_POST['id'] ?? 0);
        db('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [$nid,$uid]);
    } else {
        db('UPDATE notifications SET is_read=1 WHERE user_id=?', [$uid]);
    }
    setFlash('success','Notifications marked as read.');
}
redirect('dashboard/notifications.php');
