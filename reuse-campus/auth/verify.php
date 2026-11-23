<?php
require_once __DIR__ . '/../includes/auth.php';

$token = clean($_GET['token'] ?? '');
$user = $token ? dbOne('SELECT * FROM users WHERE verification_token=?', [$token]) : null;
if ($user) {
    db('UPDATE users SET email_verified=1, verification_token=NULL WHERE id=?', [$user['id']]);
    setFlash('success', 'Email verified. Your account is fully set up.');
} else {
    setFlash('error', 'Invalid or expired verification link.');
}
redirect(isLoggedIn() ? 'dashboard/index.php' : 'auth/login.php');
