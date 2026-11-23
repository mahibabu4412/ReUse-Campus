<?php
/**
 * ReUse Campus - Shared helper functions.
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

/* ------------------------------------------------------------
 * Escaping & output
 * ---------------------------------------------------------- */
function e($value)
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function nl2br_e($value)
{
    return nl2br(e($value));
}

/* ------------------------------------------------------------
 * Flash messages (one-time session messages)
 * ---------------------------------------------------------- */
function setFlash($type, $message)
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

/** Pull and clear all flash messages. */
function getFlashes()
{
    $flashes = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $flashes;
}

/** Render flash messages as Bootstrap-like alerts. */
function renderFlashes()
{
    $flashes = getFlashes();
    if (!$flashes) return;
    echo '<div class="flash-stack">';
    foreach ($flashes as $f) {
        $icon = $f['type'] === 'success' ? 'check-circle' : ($f['type'] === 'error' ? 'x-circle' : 'alert-circle');
        echo '<div class="alert alert-' . e($f['type']) . '" role="alert">' .
             '<i data-lucide="' . $icon . '" class="alert-icon"></i>' .
             '<span>' . e($f['message']) . '</span>' .
             '<button type="button" class="alert-close" aria-label="Close" data-dismiss-alert><i data-lucide="x"></i></button>' .
             '</div>';
    }
    echo '</div>';
}

/* ------------------------------------------------------------
 * CSRF protection
 * ---------------------------------------------------------- */
function csrf_token()
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field()
{
    return '<input type="hidden" name="csrf_token" value="' . csrf_token() . '">';
}

/** Verify CSRF token from POST. Dies on failure. */
function verify_csrf()
{
    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(419);
        die('Invalid security token. Please refresh the page and try again.');
    }
}

/* ------------------------------------------------------------
 * Form helpers
 * ---------------------------------------------------------- */
function old($key, $default = '')
{
    return e($_SESSION['old'][$key] ?? $default);
}

function setOld($data)
{
    $_SESSION['old'] = $data;
}

function clearOld()
{
    unset($_SESSION['old']);
}

/** Basic server-side text cleaning. */
function clean($value)
{
    return trim(strip_tags((string)$value));
}

/* ------------------------------------------------------------
 * Authentication / authorization helpers (thin wrappers)
 * ---------------------------------------------------------- */
function currentUser()
{
    return function_exists('authUser') ? authUser() : null;
}

function isLoggedIn()
{
    return !empty($_SESSION['user_id']);
}

function isAdminLoggedIn()
{
    return !empty($_SESSION['admin_id']);
}

/* ------------------------------------------------------------
 * Utilities
 * ---------------------------------------------------------- */
function generateToken($length = 32)
{
    return bin2hex(random_bytes($length));
}

function timeAgo($datetime)
{
    $ts = strtotime($datetime);
    if (!$ts) return '';
    $diff = time() - $ts;
    if ($diff < 60) return 'just now';
    $units = [
        31536000 => 'year', 2592000 => 'month', 604800 => 'week',
        86400 => 'day', 3600 => 'hour', 60 => 'minute'
    ];
    foreach ($units as $sec => $label) {
        if ($diff >= $sec) {
            $n = floor($diff / $sec);
            return $n . ' ' . $label . ($n > 1 ? 's' : '') . ' ago';
        }
    }
    return 'just now';
}

function formatMoney($amount)
{
    return '৳' . number_format((float)$amount, 2);
}

function conditionLabel($condition)
{
    return [
        'new'      => 'Brand New',
        'like_new' => 'Like New',
        'good'     => 'Good',
        'fair'     => 'Fair',
    ][$condition] ?? ucfirst($condition);
}

function exchangeLabel($type)
{
    return [
        'donation' => 'Free Donation',
        'borrow'   => 'Borrow',
        'exchange' => 'Exchange',
        'sale'     => 'For Sale',
    ][$type] ?? ucfirst($type);
}

function statusBadge($status)
{
    $label = ucfirst($status);
    return '<span class="badge badge-' . e($status) . '">' . e($label) . '</span>';
}

/** Resolve an image path stored in DB to a public URL. */
function imageUrl($filename)
{
    if (!$filename) return asset('images/placeholder.svg');
    if (preg_match('#^https?://#i', $filename)) return $filename;
    return asset($filename);
}

/** Default avatar with initials. */
function avatarUrl($user)
{
    if (!empty($user['profile_picture'])) return imageUrl($user['profile_picture']);
    return asset('images/avatar-default.svg');
}

function initials($name)
{
    $parts = preg_split('/\s+/', trim((string)$name));
    $out = '';
    foreach (array_slice($parts, 0, 2) as $p) {
        $out .= strtoupper(mb_substr($p, 0, 1));
    }
    return $out ?: '?';
}

/* ------------------------------------------------------------
 * Categories, listings & notifications
 * ---------------------------------------------------------- */
function getCategories($onlyActive = true)
{
    $sql = 'SELECT * FROM categories';
    if ($onlyActive) $sql .= ' WHERE status = "active"';
    $sql .= ' ORDER BY name ASC';
    return dbAll($sql);
}

function getCategory($id)
{
    return dbOne('SELECT * FROM categories WHERE id = ?', [(int)$id]);
}

function getListing($id)
{
    return dbOne('SELECT l.*, c.name AS category_name, c.slug AS category_slug,
                         u.full_name AS owner_name, u.college AS owner_college,
                         u.department AS owner_department, u.profile_picture AS owner_avatar
                  FROM listings l
                  JOIN categories c ON c.id = l.category_id
                  JOIN users u ON u.id = l.user_id
                  WHERE l.id = ?', [(int)$id]);
}

function getListingImages($listingId)
{
    return dbAll('SELECT * FROM listing_images WHERE listing_id = ? ORDER BY is_primary DESC, id ASC', [(int)$listingId]);
}

function getListingImage($listingId)
{
    $img = dbOne('SELECT filename FROM listing_images WHERE listing_id = ? ORDER BY is_primary DESC, id ASC LIMIT 1', [(int)$listingId]);
    return $img['filename'] ?? null;
}

function isFavorite($userId, $listingId)
{
    if (!$userId) return false;
    return (bool)dbOne('SELECT 1 FROM favorites WHERE user_id = ? AND listing_id = ?', [(int)$userId, (int)$listingId]);
}

function notificationCount($userId)
{
    $row = dbOne('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0', [(int)$userId]);
    return (int)($row['c'] ?? 0);
}

function addNotification($userId, $title, $message, $type = 'system', $link = null)
{
    db('INSERT INTO notifications (user_id,title,message,type,link) VALUES (?,?,?,?,?)',
        [(int)$userId, $title, $message, $type, $link]);
}

/* ------------------------------------------------------------
 * Image upload with validation
 * ---------------------------------------------------------- */
function uploadImage($file, $subDir = '', $maxSize = 5 * 1024 * 1024)
{
    if (!isset($file['error']) || is_array($file['error'])) return false;
    if ($file['error'] !== UPLOAD_ERR_OK) return false;
    if ($file['size'] <= 0 || $file['size'] > $maxSize) return false;

    // Verify it is really an image
    $info = @getimagesize($file['tmp_name']);
    if ($info === false) return false;
    $allowed = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_GIF => 'gif', IMAGETYPE_WEBP => 'webp'];
    if (!isset($allowed[$info[2]])) return false;

    $dir = UPLOAD_DIR . ($subDir ? trim($subDir, '/\\') . DIRECTORY_SEPARATOR : '');
    if (!is_dir($dir)) @mkdir($dir, 0755, true);

    $name = bin2hex(random_bytes(16)) . '.' . $allowed[$info[2]];
    if (!move_uploaded_file($file['tmp_name'], $dir . $name)) return false;
    return 'uploads/' . ($subDir ? trim($subDir, '/\\') . '/' : '') . $name;
}

/** Handle multiple image inputs named images[] . */
function uploadMultipleImages($files, $subDir = '', $max = 5)
{
    $paths = [];
    if (empty($files['name'])) return $paths;
    $count = min(count($files['name']), $max);
    for ($i = 0; $i < $count; $i++) {
        $single = [
            'name'     => $files['name'][$i],
            'type'     => $files['type'][$i],
            'tmp_name' => $files['tmp_name'][$i],
            'error'    => $files['error'][$i],
            'size'     => $files['size'][$i],
        ];
        $path = uploadImage($single, $subDir);
        if ($path) $paths[] = $path;
    }
    return $paths;
}

/* ------------------------------------------------------------
 * Pagination helper
 * ---------------------------------------------------------- */
function paginate($total, $perPage, $current)
{
    $pages = max(1, (int)ceil($total / $perPage));
    $current = max(1, min($current, $pages));
    return [
        'total'   => $total,
        'pages'   => $pages,
        'current' => $current,
        'offset'  => ($current - 1) * $perPage,
    ];
}

/** Build pagination query-string link. */
function pageLink($page, $extra = [])
{
    $params = array_merge($_GET, $extra, ['page' => $page]);
    $script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
    $base = base_url();
    if ($base !== '' && strpos($script, $base) === 0) {
        $script = substr($script, strlen($base));
    }
    return url(ltrim($script, '/')) . '?' . http_build_query($params);
}

/* ------------------------------------------------------------
 * Simple rule-based matching engine (no AI)
 * ---------------------------------------------------------- */
function matchListings($target, $limit = 4, $excludeId = null, $userId = null)
{
    // $target: listing row (with category_id, exchange_type, title, college via owner_college)
    $candidates = dbAll('SELECT l.*, c.name AS category_name, u.college AS owner_college,
                                (SELECT filename FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.is_primary DESC, li.id ASC LIMIT 1) AS image
                         FROM listings l
                         JOIN categories c ON c.id = l.category_id
                         JOIN users u ON u.id = l.user_id
                         WHERE l.status = "active" AND l.availability = "available"');
    $scored = [];
    $keywords = preg_split('/\W+/', mb_strtolower($target['title'] ?? ''));
    $keywords = array_filter($keywords, fn($w) => mb_strlen($w) > 3);
    foreach ($candidates as $c) {
        if ($excludeId && $c['id'] == $excludeId) continue;
        $score = 0;
        $reasons = [];
        if ($c['category_id'] == $target['category_id']) {
            $score += 40;
            $reasons[] = 'Same category';
        }
        if ($c['exchange_type'] === $target['exchange_type']) {
            $score += 25;
            $reasons[] = 'Same exchange type';
        }
        if (!empty($target['owner_college']) && $c['owner_college'] === $target['owner_college']) {
            $score += 20;
            $reasons[] = 'Same college';
        }
        $titleL = mb_strtolower($c['title']);
        foreach ($keywords as $kw) {
            if (mb_strpos($titleL, $kw) !== false) {
                $score += 8;
                $reasons[] = 'Keyword: ' . $kw;
                break;
            }
        }
        if (!$reasons) $reasons[] = 'Available now';
        $c['match_score'] = min(100, $score);
        $c['match_reasons'] = array_slice($reasons, 0, 3);
        $scored[] = $c;
    }
    usort($scored, fn($a, $b) => $b['match_score'] <=> $a['match_score']);
    return array_slice($scored, 0, $limit);
}

/* ------------------------------------------------------------
 * Platform statistics (live from DB)
 * ---------------------------------------------------------- */
function platformStats()
{
    return [
        'students'  => (int)(dbOne('SELECT COUNT(*) c FROM users WHERE status="active"')['c'] ?? 0),
        'listings'  => (int)(dbOne('SELECT COUNT(*) c FROM listings WHERE status="active"')['c'] ?? 0),
        'exchanges' => (int)(dbOne('SELECT COUNT(*) c FROM exchange_history')['c'] ?? 0),
        'categories'=> (int)(dbOne('SELECT COUNT(*) c FROM categories WHERE status="active"')['c'] ?? 0),
    ];
}
