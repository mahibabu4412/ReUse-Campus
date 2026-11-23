<?php
require_once __DIR__ . '/../includes/auth.php';

if (isAdminLoggedIn()) redirect('admin/index.php');

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $username = clean($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $admin = dbOne('SELECT * FROM admins WHERE username=? OR email=?', [$username,$username]);
    if (!$admin || !password_verify($password, $admin['password'])) {
        $error = 'Invalid administrator credentials.';
    } else {
        loginAdmin($admin);
        setFlash('success','Welcome to the admin panel.');
        redirect('admin/index.php');
    }
}
$pageTitle = 'Admin login';
require_once __DIR__ . '/../includes/icons.php';
require_once __DIR__ . '/../includes/header.php';
?>
<div class="auth-wrap">
  <div class="auth-card">
    <div class="auth-brand"><a href="<?= url('index.php') ?>" class="brand-mark"><img src="<?= asset('images/logo.svg') ?>" alt="" style="width:28px;height:28px"></a></div>
    <h1>Admin portal</h1>
    <p class="sub">Restricted area — authorised administrators only.</p>
    <?php if ($error): ?><div class="alert alert-error" style="position:static;width:auto;margin-bottom:18px;box-shadow:none"><?= icon('alert-circle',18) ?><span><?= e($error) ?></span></div><?php endif; ?>
    <form method="post" action="">
      <?= csrf_field() ?>
      <div class="form-group"><label>Username or email</label><div class="input-icon"><?= icon('user',17) ?><input class="input" name="username" required value="<?= old('username') ?>" placeholder="admin"></div></div>
      <div class="form-group"><label>Password</label><div class="password-wrap"><input class="input" type="password" id="aPass" name="password" required><button type="button" class="pw-toggle" data-target="aPass"><?= icon('lock',18) ?></button></div></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit"><?= icon('shield',17) ?> Sign in securely</button>
    </form>
    <div class="auth-alt"><a href="<?= url('index.php') ?>">← Back to website</a></div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
