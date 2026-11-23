<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/icons.php';
requireLogin();
$user = authUser();
$uid = (int)$user['id'];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = clean($_POST['action'] ?? 'save');

    if ($action === 'resend_verification') {
        sendVerificationEmail($user);
        setFlash('success','A new verification link has been generated. Open the link shown after sign-up, or check storage/verification.log in demo mode.');
        redirect('profile/index.php');
    }

    $fullName = clean($_POST['full_name'] ?? '');
    $college = clean($_POST['college'] ?? '');
    $department = clean($_POST['department'] ?? '');
    $semester = clean($_POST['semester'] ?? '');
    $phone = clean($_POST['phone'] ?? '');
    $pref = in_array($_POST['contact_preferences'] ?? '', ['email','phone','both'], true) ? $_POST['contact_preferences'] : 'email';
    $bio = clean($_POST['bio'] ?? '');

    if (mb_strlen($fullName) < 3 || mb_strlen($fullName) > 120) $errors[] = 'Enter a valid full name.';
    if ($college === '' || $department === '') $errors[] = 'College and department are required.';
    if (mb_strlen($bio) > 500) $errors[] = 'Bio is too long.';

    if (!$errors) {
        db('UPDATE users SET full_name=?,college=?,department=?,semester=?,phone=?,contact_preferences=?,bio=? WHERE id=?',
           [$fullName,$college,$department,$semester,$phone,$pref,$bio,$uid]);
        if (!empty($_FILES['profile_picture']['name'])) {
            $path = uploadImage($_FILES['profile_picture'], 'profiles');
            if ($path) {
                db('UPDATE users SET profile_picture=? WHERE id=?', [$path,$uid]);
            } else {
                setFlash('error','Profile picture must be a valid image under 5 MB.');
                redirect('profile/index.php');
            }
        }
        setFlash('success','Profile updated successfully.');
        redirect('profile/index.php');
    }
    $user = array_merge($user, [
        'full_name' => $fullName, 'college' => $college, 'department' => $department,
        'semester' => $semester, 'phone' => $phone, 'bio' => $bio,
        'contact_preferences' => $pref
    ]);
}

$appTitle = 'Profile settings';
$active = 'profile';
require_once __DIR__ . '/../includes/app_header.php';
?>

<div class="profile-head">
  <span class="avatar avatar-lg"><?= e(initials($user['full_name'])) ?></span>
  <div><h2><?= e($user['full_name']) ?></h2><p><?= e($user['department']) ?> · <?= e($user['semester'] ?: 'Semester not set') ?></p>
    <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
      <?= $user['email_verified'] ? '<span class="badge badge-completed">'.icon('check-circle',13).' Email verified</span>' : '<span class="badge badge-pending">Email not verified</span>' ?>
      <span class="badge badge-active">Active student</span>
    </div>
  </div>
</div>

<?php if ($errors): ?><div class="alert alert-error" style="position:static;width:auto;margin-bottom:18px;box-shadow:none"><?= icon('alert-circle',18) ?><div><?php foreach ($errors as $err) echo '• '.e($err).'<br>'; ?></div></div><?php endif; ?>

<div class="two-col">
  <div class="panel">
    <div class="panel-head"><h2>Personal information</h2></div>
    <div class="panel-body">
      <form method="post" enctype="multipart/form-data" action="">
        <?= csrf_field() ?>
        <div class="form-group"><label>Profile picture</label>
          <div style="display:flex;align-items:center;gap:14px">
            <span class="avatar" style="width:64px;height:64px;font-size:20px"><img src="<?= e(avatarUrl($user)) ?>" alt="" style="width:100%;height:100%;object-fit:cover"></span>
            <div><input type="file" name="profile_picture" accept="image/*" class="input" style="padding:8px"><div class="hint">JPG, PNG, GIF or WEBP · max 5 MB</div></div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Full name</label><input class="input" name="full_name" required maxlength="120" value="<?= e($user['full_name']) ?>"></div>
          <div class="form-group"><label>Student ID</label><input class="input" value="<?= e($user['student_id']) ?>" readonly><div class="hint">Cannot be changed.</div></div>
        </div>
        <div class="form-group"><label>Email</label><input class="input" value="<?= e($user['email']) ?>" readonly><div class="hint">Contact your admin to change your email.</div></div>
        <div class="form-group"><label>College</label><input class="input" name="college" required maxlength="190" value="<?= e($user['college']) ?>"></div>
        <div class="form-row">
          <div class="form-group"><label>Department / Technology</label><input class="input" name="department" required maxlength="190" value="<?= e($user['department']) ?>"></div>
          <div class="form-group"><label>Semester</label><select class="select" name="semester"><option value="">Select</option>
            <?php foreach (['1st','2nd','3rd','4th','5th','6th','7th','8th'] as $s): ?><option value="<?= $s ?> Semester" <?= $user['semester']===$s.' Semester'?'selected':'' ?>><?= $s ?> Semester</option><?php endforeach; ?>
          </select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input class="input" name="phone" maxlength="30" value="<?= e($user['phone']) ?>"></div>
          <div class="form-group"><label>Contact preference</label><select class="select" name="contact_preferences">
            <option value="email" <?= $user['contact_preferences']==='email'?'selected':'' ?>>Email</option>
            <option value="phone" <?= $user['contact_preferences']==='phone'?'selected':'' ?>>Phone</option>
            <option value="both" <?= $user['contact_preferences']==='both'?'selected':'' ?>>Both</option>
          </select></div>
        </div>
        <div class="form-group"><label>Short bio</label><textarea class="textarea" name="bio" maxlength="500" style="min-height:90px" placeholder="A little about yourself..."><?= e($user['bio']) ?></textarea></div>
        <button class="btn btn-primary" type="submit"><?= icon('check',16) ?> Save changes</button>
      </form>
    </div>
  </div>

  <div>
    <div class="panel">
      <div class="panel-head"><h2>Privacy &amp; security</h2></div>
      <div class="panel-body">
        <div class="form-note" style="margin-bottom:16px"><?= icon('shield',15) ?> Your student ID, email, phone and profile details are never shown on public listing pages. Other students only see the display name you choose.</div>
        <?php if (!$user['email_verified']): ?>
          <form method="post" action=""><?= csrf_field() ?><input type="hidden" name="action" value="resend_verification"><button class="btn btn-outline btn-block" type="submit"><?= icon('mail',15) ?> Generate verification link</button></form>
        <?php else: ?>
          <div class="badge badge-completed"><?= icon('check-circle',14) ?> Verified account</div>
        <?php endif; ?>
        <a href="<?= url('auth/forgot.php') ?>" class="btn btn-ghost btn-block" style="margin-top:8px"><?= icon('lock',15) ?> Change password</a>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><h2>Account activity</h2></div>
      <div class="panel-body" style="font-size:13px;color:var(--text-2);line-height:1.9">
        <div>Member since: <b><?= e(date('d M Y', strtotime($user['created_at']))) ?></b></div>
        <div>Account status: <b><?= e(ucfirst($user['status'])) ?></b></div>
        <div>Total listings: <b><?= (int)dbOne('SELECT COUNT(*) c FROM listings WHERE user_id=?',[$uid])['c'] ?></b></div>
        <div>Completed exchanges: <b><?= (int)dbOne('SELECT COUNT(*) c FROM exchange_history WHERE requester_id=? OR owner_id=?',[$uid,$uid])['c'] ?></b></div>
      </div>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
