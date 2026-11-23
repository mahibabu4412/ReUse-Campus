<?php
require_once __DIR__ . '/../includes/auth.php';
requireGuest();

$token = clean($_GET['token'] ?? '');
$user = $token ? dbOne('SELECT * FROM users WHERE verification_token=?', [$token]) : null;
$error = '';
$done = false;

if (!$user) {
    $error = 'This reset link is invalid or has expired.';
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $pass = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    if (mb_strlen($pass) < 8) $error = 'Password must be at least 8 characters.';
    elseif ($pass !== $confirm) $error = 'Passwords do not match.';
    else {
        db('UPDATE users SET password=?, verification_token=NULL WHERE id=?', [password_hash($pass, PASSWORD_DEFAULT), $user['id']]);
        $done = true;
    }
}

$pageTitle = 'Choose a new password';
require_once __DIR__ . '/../includes/icons.php';
require_once __DIR__ . '/../includes/header.php';
?>
<div class="auth-wrap">
  <div class="auth-card">
    <div class="auth-brand"><a href="<?= url('index.php') ?>" class="brand-mark"><img src="<?= asset('images/logo.svg') ?>" alt="" style="width:28px;height:28px"></a></div>
    <h1>Choose a new password</h1>
    <p class="sub">Pick a strong password you haven't used before.</p>
    <?php if ($error): ?><div class="alert alert-error" style="position:static;width:auto;margin-bottom:18px;box-shadow:none"><?= icon('alert-circle',18) ?><span><?= e($error) ?></span></div><?php endif; ?>
    <?php if ($done): ?>
      <div class="form-note">Your password has been updated. You can now log in.</div>
      <a href="<?= url('auth/login.php') ?>" class="btn btn-primary btn-block">Go to login</a>
    <?php elseif ($user): ?>
      <form method="post" action="">
        <?= csrf_field() ?>
        <div class="form-group"><label>New password</label><div class="password-wrap"><input class="input" type="password" id="rPass" name="password" required minlength="8"><button type="button" class="pw-toggle" data-target="rPass"><?= icon('lock',18) ?></button></div></div>
        <div class="form-group"><label>Confirm password</label><input class="input" type="password" name="confirm_password" required minlength="8"></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Update password</button>
      </form>
    <?php endif; ?>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
