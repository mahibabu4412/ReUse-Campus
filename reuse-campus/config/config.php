<?php
/**
 * ReUse Campus - Application configuration & bootstrap.
 * Included at the top of every entry point.
 */

// ---- Error reporting (set display_errors to 0 in production) ----
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('session.use_strict_mode', '1');

// ---- Timezone ----
date_default_timezone_set('UTC');

// ---- Application constants ----
define('APP_NAME', 'ReUse Campus');
define('APP_TAGLINE', 'Share More. Waste Less. Learn Together.');
define('APP_VERSION', '1.0.0');
define('UPLOAD_DIR', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR);

// ---- Session ----
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Regenerate session id periodically to reduce fixation risk
if (empty($_SESSION['__last_regen'])) {
    $_SESSION['__last_regen'] = time();
} elseif (time() - $_SESSION['__last_regen'] > 1800) {
    session_regenerate_id(true);
    $_SESSION['__last_regen'] = time();
}

/**
 * Build a URL relative to the application root.
 * Works whether the app is installed in a subfolder (e.g. /reuse-campus)
 * or directly at the web root.
 */
function base_url($path = '')
{
    static $base = null;
    if ($base === null) {
        $script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
        $rootFolder = basename(dirname(__DIR__)); // folder containing /config
        $pos = strripos($script, '/' . $rootFolder);
        $base = ($pos !== false) ? substr($script, 0, $pos) . '/' . $rootFolder : '';
    }
    return $base . '/' . ltrim($path, '/');
}

/** Alias for base_url() */
function url($path = '')
{
    return base_url($path);
}

/** URL to an asset in /assets */
function asset($path)
{
    return base_url('assets/' . ltrim($path, '/'));
}

/** Redirect to a local path and stop execution. */
function redirect($path)
{
    header('Location: ' . url($path));
    exit;
}

/** Redirect to an absolute external URL and stop execution. */
function redirect_url($fullUrl)
{
    header('Location: ' . $fullUrl);
    exit;
}
