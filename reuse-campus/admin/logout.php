<?php
require_once __DIR__ . '/../includes/auth.php';
if (isAdminLoggedIn()) {
    unset($_SESSION['admin_id'], $_SESSION['admin_name']);
    session_regenerate_id(true);
    setFlash('success','Administrator logged out.');
}
redirect('admin/login.php');
