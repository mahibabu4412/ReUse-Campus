<?php
require_once __DIR__ . '/../includes/auth.php';
if (isLoggedIn()) {
    logoutUser();
    setFlash('success', 'You have been logged out.');
}
redirect('index.php');
