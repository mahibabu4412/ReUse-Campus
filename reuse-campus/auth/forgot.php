<?php
require_once __DIR__ . '/../includes/auth.php';
requireGuest();

$sent = false;
$link = '';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $email = clean($_POST['email'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Enter a valid email address.';
    } else {
        $user = dbOne('SELECT * FROM users WHERE email=?', [$email]);
        if ($user) {
            $link = sendPasswordResetEmail($user);
            $sent = true;
        } else {
            // Do not reveal whether an account exists.
            $sent = true;
        }
    }
}
$pageTitle = 'Forgot password';
require_once __DIR__ . '/../includes/icons.php';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="auth-wrap">
  <div class="auth-card">
    <div class="auth-brand"><a href="<?= url('index.php') ?>" class="brand-mark"><img src="<?= asset('images/logo.svg') ?>" alt="" style="width:28px;height:28px"></a></div>
    <h1>Reset your password</h1>
    <p class="sub">Enter your email and we'll create a secure reset link.</p>

    <?php if ($error): ?><div class="alert alert-error" style="position:static;width:auto;margin-bottom:18px;box-shadow:none"><?= icon('alert-circle',18) ?><span><?= e($error) ?></span></div><?php endif; ?>

    <?php if ($sent): ?>
      <div class="form-note">
        If an account exists for that address, a reset link has been generated.
        <?php if ($link): ?><br><br><b>Demo mode:</b> <a href="<?= e($link) ?>" target="_blank">Open your reset link</a><?php endif; ?>
      </div>
      <a href="<?= url('auth/login.php') ?>" class="btn btn-outline btn-block">Back to login</a>
    <?php else: ?>
      <form method="post" action="">
        <?= csrf_field() ?>
        <div class="form-group"><label>Email address</label><div class="input-icon"><?= icon('mail',17) ?><input class="input" type="email" name="email" required placeholder="you@student.edu"></div></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Send reset link</button>
      </form>
    <?php endif; ?>
    <div class="auth-alt"><a href="<?= url('auth/login.php') ?>">← Back to login</a></div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
