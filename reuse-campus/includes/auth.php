<?php
/**
 * ReUse Campus - Authentication & role-based access control.
 */
require_once __DIR__ . '/functions.php';

/** Return the logged-in student row (cached per request) or null. */
function authUser()
{
    static $user = null;
    static $loaded = false;
    if (!$loaded) {
        $loaded = true;
        if (!empty($_SESSION['user_id'])) {
            $row = dbOne('SELECT * FROM users WHERE id = ? AND status = "active"', [(int)$_SESSION['user_id']]);
            if ($row) {
                $user = $row;
            } else {
                // Account removed / suspended while session was alive
                unset($_SESSION['user_id']);
            }
        }
    }
    return $user;
}

/** Require a logged-in student, otherwise redirect to login. */
function requireLogin()
{
    if (!authUser()) {
        setFlash('error', 'Please log in to continue.');
        $current = url($_SERVER['PHP_SELF'] . (!empty($_SERVER['QUERY_STRING']) ? '?' . $_SERVER['QUERY_STRING'] : ''));
        // store a relative redirect target
        $_SESSION['redirect_after_login'] = str_replace(base_url(), '', $current);
        redirect('auth/login.php');
    }
    return authUser();
}

/** Require guest (redirect logged-in students to dashboard). */
function requireGuest()
{
    if (authUser()) redirect('dashboard/index.php');
}

/** Require an authenticated admin. */
function requireAdmin()
{
    if (empty($_SESSION['admin_id'])) {
        setFlash('error', 'Administrator access required.');
        redirect('admin/login.php');
    }
    $admin = dbOne('SELECT * FROM admins WHERE id = ?', [(int)$_SESSION['admin_id']]);
    if (!$admin) {
        unset($_SESSION['admin_id']);
        redirect('admin/login.php');
    }
    return $admin;
}

/** Log a student in. */
function loginUser($user)
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['user_name'] = $user['full_name'];
}

/** Log a student out. */
function logoutUser()
{
    unset($_SESSION['user_id'], $_SESSION['user_name'], $_SESSION['redirect_after_login']);
    session_regenerate_id(true);
}

/** Log an admin in. */
function loginAdmin($admin)
{
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int)$admin['id'];
    $_SESSION['admin_name'] = $admin['full_name'];
}

/** Send an email verification message (architecture stub, logs to file). */
function sendVerificationEmail($user)
{
    $token = $user['verification_token'] ?: generateToken();
    if (!$user['verification_token']) {
        db('UPDATE users SET verification_token = ? WHERE id = ?', [$token, $user['id']]);
    }
    $link = base_url('auth/verify.php?token=' . urlencode($token));
    // In a production environment, mail() / SMTP would be used here.
    $log = '[' . date('Y-m-d H:i:s') . "] Verification link for {$user['email']}: {$link}\n";
    @file_put_contents(dirname(__DIR__) . '/storage/verification.log', $log, FILE_APPEND);
    return $link;
}

/** Send a password-reset link (architecture stub). */
function sendPasswordResetEmail($user)
{
    $token = generateToken();
    db('UPDATE users SET verification_token = ? WHERE id = ?', [$token, $user['id']]);
    $link = base_url('auth/reset.php?token=' . urlencode($token));
    $log = '[' . date('Y-m-d H:i:s') . "] Password reset link for {$user['email']}: {$link}\n";
    @file_put_contents(dirname(__DIR__) . '/storage/reset.log', $log, FILE_APPEND);
    return $link;
}
