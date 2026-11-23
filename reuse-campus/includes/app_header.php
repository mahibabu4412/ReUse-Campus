<?php
/**
 * App shell header (student dashboard + admin panel).
 * Expects: $appTitle, $active, $isAdminLayout (bool), and optionally $admin.
 */
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/icons.php';

$appTitle = $appTitle ?? APP_NAME;
$active   = $active ?? '';
$isAdminLayout = !empty($isAdminLayout);
$student  = $isAdminLayout ? null : authUser();
$admin    = $isAdminLayout ? ($admin ?? null) : null;
$notifCount = (!$isAdminLayout && $student) ? notificationCount($student['id']) : 0;
$pendingReports = 0;
if ($isAdminLayout) {
    $pendingReports = (int)(dbOne('SELECT COUNT(*) c FROM reports WHERE status="pending"')['c'] ?? 0);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($appTitle) ?> · <?= APP_NAME ?></title>
  <meta name="theme-color" content="#04261c">
  <meta name="csrf-token" content="<?= csrf_token() ?>">
  <link rel="icon" type="image/svg+xml" href="<?= asset('images/logo.svg') ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= asset('css/style.css') ?>">
</head>
<body>
<?php iconSprite(); ?>
<?php renderFlashes(); ?>

<div class="app">
  <div class="sidebar-overlay" id="sidebarOverlay"></div>
  <?php require_once __DIR__ . '/sidebar.php'; ?>

  <div class="app-main">
    <header class="app-topbar">
      <button class="topbar-menu" id="sidebarToggle" aria-label="Toggle sidebar"><?= icon('menu',21) ?></button>
      <span class="topbar-title"><?= e($appTitle) ?></span>
      <div style="margin-left:auto;display:flex;align-items:center;gap:12px">
        <?php if (!$isAdminLayout): ?>
          <a href="<?= url('dashboard/notifications.php') ?>" class="nav-icon-btn" title="Notifications"><?= icon('bell',18) ?><?php if ($notifCount): ?><span class="notif-dot"></span><?php endif; ?></a>
        <?php endif; ?>
        <a href="<?= $isAdminLayout ? url('admin/index.php') : url('profile/index.php') ?>" class="avatar" style="width:34px;height:34px;font-size:12px"><?= e(initials($isAdminLayout ? ($admin['full_name']??'A') : ($student['full_name']??'S'))) ?></a>
      </div>
    </header>
    <main class="app-content">
