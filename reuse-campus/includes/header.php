<?php
/**
 * Public header + navigation. Expects optional $pageTitle and $active.
 */
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/icons.php';

$pageTitle = $pageTitle ?? APP_NAME;
$active    = $active ?? '';
$user      = authUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?> · <?= APP_NAME ?></title>
  <meta name="description" content="ReUse Campus — a student-to-student platform to share, donate, borrow and exchange educational resources. Share More. Waste Less. Learn Together.">
  <meta name="theme-color" content="#0d6046">
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

<?php require_once __DIR__ . '/navbar.php'; ?>
