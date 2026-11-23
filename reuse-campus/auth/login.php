<?php
require_once __DIR__ . '/../includes/auth.php';
requireGuest();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $email = clean($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';
    setOld(['email' => $email]);

    $user = dbOne('SELECT * FROM users WHERE email = ?', [$email]);
    if (!$user || !password_verify($pass, $user['password'])) {
        $error = 'Incorrect email or password.';
    } elseif ($user['status'] !== 'active') {
        $error = 'This account has been suspended. Please contact support.';
    } else {
        clearOld();
        loginUser($user);
        if (!empty($_POST['remember'])) {
            // Extend the session cookie for 30 days when "Remember me" is selected.
            setcookie(session_name(), session_id(), time() + 60 * 60 * 24 * 30, '/', '', false, true);
        }
        $target = $_SESSION['redirect_after_login'] ?? 'dashboard/index.php';
        unset($_SESSION['redirect_after_login']);
        setFlash('success', 'Welcome back, ' . explode(' ', $user['full_name'])[0] . '!');
        redirect($target);
    }
}

$pageTitle = 'Log in';
require_once __DIR__ . '/../includes/icons.php';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="auth-wrap">
  <div class="auth-card">
    <div class="auth-brand"><a href="<?= url('index.php') ?>" class="brand-mark"><img src="<?= asset('images/logo.svg') ?>" alt="" style="width:28px;height:28px"></a></div>
    <h1>Welcome back</h1>
    <p class="sub">Log in to your ReUse Campus account.</p>

    <?php if ($error): ?>
      <div class="alert alert-error" style="position:static;width:auto;margin-bottom:18px;box-shadow:none"><?= icon('alert-circle',18) ?><span><?= e($error) ?></span></div>
    <?php endif; ?>

    <form method="post" action="">
      <?= csrf_field() ?>
      <div class="form-group"><label>Email address</label><div class="input-icon"><?= icon('mail',17) ?><input class="input" type="email" name="email" required value="<?= old('email') ?>" placeholder="you@student.edu"></div></div>
      <div class="form-group"><label>Password</label><div class="password-wrap"><input class="input" type="password" id="loginPass" name="password" required placeholder="Your password"><button type="button" class="pw-toggle" data-target="loginPass" aria-label="Show password"><?= icon('lock',18) ?></button></div></div>
      <div class="form-links">
        <label class="form-check"><input type="checkbox" name="remember"> Remember me</label>
        <a href="<?= url('auth/forgot.php') ?>">Forgot password?</a>
      </div>
      <button class="btn btn-primary btn-lg btn-block" type="submit">Log in</button>
    </form>
    <div class="auth-alt">New to ReUse Campus? <a href="<?= url('auth/register.php') ?>">Create an account</a></div>
    <div class="divider-text">or</div>
    <a href="<?= url('admin/login.php') ?>" class="btn btn-outline btn-block"><?= icon('shield',16) ?> Admin portal</a>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
