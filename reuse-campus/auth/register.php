<?php
require_once __DIR__ . '/../includes/auth.php';
requireGuest();

$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $fullName   = clean($_POST['full_name'] ?? '');
    $studentId  = clean($_POST['student_id'] ?? '');
    $email      = clean($_POST['email'] ?? '');
    $college    = clean($_POST['college'] ?? '');
    $department = clean($_POST['department'] ?? '');
    $semester   = clean($_POST['semester'] ?? '');
    $phone      = clean($_POST['phone'] ?? '');
    $pref       = in_array($_POST['contact_preferences'] ?? '', ['email','phone','both'], true) ? $_POST['contact_preferences'] : 'email';
    $password   = $_POST['password'] ?? '';
    $confirm    = $_POST['confirm_password'] ?? '';

    setOld(compact('full_name','student_id','email','college','department','semester','phone','contact_preferences'));

    if (mb_strlen($fullName) < 3 || mb_strlen($fullName) > 120) $errors[] = 'Enter your full name (3–120 characters).';
    if (!preg_match('/^[A-Za-z0-9\-\/]{3,50}$/', $studentId)) $errors[] = 'Enter a valid student ID (letters, numbers, - or /).';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Enter a valid email address.';
    if ($college === '' || mb_strlen($college) > 190) $errors[] = 'Enter your college name.';
    if ($department === '' || mb_strlen($department) > 190) $errors[] = 'Enter your department.';
    if (mb_strlen($password) < 8) $errors[] = 'Password must be at least 8 characters.';
    if ($password !== $confirm) $errors[] = 'Passwords do not match.';

    if (!$errors) {
        $dup = dbOne('SELECT 1 FROM users WHERE email=? OR student_id=?', [$email, $studentId]);
        if ($dup) {
            $errors[] = 'An account with that email or student ID already exists.';
        } else {
            $token = generateToken();
            db('INSERT INTO users (full_name,student_id,email,password,college,department,semester,phone,contact_preferences,email_verified,verification_token)
                VALUES (?,?,?,?,?,?,?,?,?,0,?)',
                [$fullName,$studentId,$email,password_hash($password, PASSWORD_DEFAULT),$college,$department,$semester,$phone,$pref,$token]);
            $newId = dbId();
            $user = dbOne('SELECT * FROM users WHERE id=?', [$newId]);
            $link = sendVerificationEmail($user);
            clearOld();
            setFlash('success', 'Account created! Verify your email to complete setup.');
            loginUser($user);
            redirect('dashboard/index.php?welcome=1&verify=1');
        }
    }
}

$pageTitle = 'Create account';
require_once __DIR__ . '/../includes/icons.php';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="auth-wrap">
  <div class="auth-card wide">
    <div class="auth-brand"><a href="<?= url('index.php') ?>" class="brand-mark"><img src="<?= asset('images/logo.svg') ?>" alt="" style="width:28px;height:28px"></a></div>
    <h1>Join ReUse Campus</h1>
    <p class="sub">Create your free student account. It only takes a minute.</p>

    <?php if ($errors): ?>
      <div class="alert alert-error" style="position:static;width:auto;margin-bottom:18px;box-shadow:none">
        <?= icon('alert-circle',18) ?><div><?php foreach ($errors as $err) echo '• '.e($err).'<br>'; ?></div>
      </div>
    <?php endif; ?>

    <form method="post" action="">
      <?= csrf_field() ?>
      <div class="form-row">
        <div class="form-group"><label>Full name</label><input class="input" name="full_name" required maxlength="120" value="<?= old('full_name') ?>" placeholder="e.g. Ayesha Rahman"></div>
        <div class="form-group"><label>Student ID</label><input class="input" name="student_id" required maxlength="50" value="<?= old('student_id') ?>" placeholder="e.g. STU-2021-0142"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email address</label><input class="input" type="email" name="email" required maxlength="190" value="<?= old('email') ?>" placeholder="you@student.edu"></div>
        <div class="form-group"><label>Phone (optional)</label><input class="input" name="phone" maxlength="30" value="<?= old('phone') ?>" placeholder="01XXXXXXXXX"></div>
      </div>
      <div class="form-group"><label>College / Institute</label><input class="input" name="college" required maxlength="190" value="<?= old('college') ?>" placeholder="Your college name"></div>
      <div class="form-row">
        <div class="form-group"><label>Department / Technology</label><input class="input" name="department" required maxlength="190" value="<?= old('department') ?>" placeholder="e.g. Computer Science"></div>
        <div class="form-group"><label>Semester</label>
          <select class="select" name="semester"><option value="">Select semester</option>
            <?php foreach (['1st','2nd','3rd','4th','5th','6th','7th','8th'] as $s): ?>
              <option value="<?= $s ?> Semester" <?= old('semester') === $s.' Semester' ? 'selected' : '' ?>><?= $s ?> Semester</option>
            <?php endforeach; ?>
          </select>
        </div>
      </div>
      <div class="form-group"><label>Contact preference</label>
        <select class="select" name="contact_preferences"><option value="email">Email</option><option value="phone" <?= old('contact_preferences')==='phone'?'selected':'' ?>>Phone</option><option value="both" <?= old('contact_preferences')==='both'?'selected':'' ?>>Both</option></select>
        <div class="hint">Other students will never see your direct contact details on public pages.</div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Password</label><div class="password-wrap"><input class="input" type="password" id="regPass" name="password" required minlength="8" placeholder="At least 8 characters"><button type="button" class="pw-toggle" data-target="regPass" aria-label="Show password"><?= icon('lock',18) ?></button></div></div>
        <div class="form-group"><label>Confirm password</label><input class="input" type="password" name="confirm_password" required minlength="8" placeholder="Repeat password"></div>
      </div>
      <button class="btn btn-primary btn-lg btn-block" type="submit"><?= icon('user-plus',17) ?> Create account</button>
    </form>
    <div class="auth-alt">Already have an account? <a href="<?= url('auth/login.php') ?>">Log in</a></div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
