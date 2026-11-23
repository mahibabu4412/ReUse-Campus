<?php
require_once __DIR__ . '/includes/components.php';
$pageTitle = 'Contact Us';
$active = 'contact';
$user = authUser();
require_once __DIR__ . '/includes/header.php';
?>

<div class="page-head">
  <div class="container">
    <div class="breadcrumb"><a href="<?= url('index.php') ?>">Home</a><span class="sep"><?= icon('chevron-right',13) ?></span><span>Contact</span></div>
    <h1>Contact us</h1>
    <p>Questions, feedback or need a hand? We're here to help.</p>
  </div>
</div>

<section class="section">
  <div class="container contact-grid">
    <div class="panel">
      <div class="panel-head"><h2>Send us a message</h2><span class="sub" style="margin:0">We usually reply within 1–2 working days.</span></div>
      <div class="panel-body">
        <form method="post" action="<?= url('api/contact.php') ?>" id="contactForm">
          <?= csrf_field() ?>
          <div class="form-row">
            <div class="form-group"><label for="name">Your name</label><input class="input" id="name" name="name" required maxlength="120" value="<?= $user ? e($user['full_name']) : old('name') ?>" <?= $user ? 'readonly' : '' ?>></div>
            <div class="form-group"><label for="email">Email address</label><input class="input" type="email" id="email" name="email" required maxlength="190" value="<?= $user ? e($user['email']) : old('email') ?>" <?= $user ? 'readonly' : '' ?>></div>
          </div>
          <div class="form-group"><label for="subject">Subject</label>
            <select class="select" id="subject" name="subject" required>
              <option value="">Choose a topic</option>
              <option value="General question">General question</option>
              <option value="Account help">Account help</option>
              <option value="Listing issue">Listing issue</option>
              <option value="Report a problem">Report a problem</option>
              <option value="Partnership">Partnership / collaboration</option>
            </select>
          </div>
          <div class="form-group"><label for="message">Message</label><textarea class="textarea" id="message" name="message" required minlength="10" maxlength="2000" placeholder="Tell us how we can help..."><?= old('message') ?></textarea><div class="hint">Minimum 10 characters.</div></div>
          <button class="btn btn-primary" type="submit"><?= icon('send',17) ?> Send message</button>
        </form>
      </div>
    </div>

    <div>
      <div class="contact-info-card">
        <h3 style="font-size:16px;margin-bottom:20px">Other ways to reach us</h3>
        <ul style="list-style:none;padding:0;margin:0">
          <li><?= icon('mail',18) ?><div><b>Email</b><br>hello@reusecampus.edu<br>support@reusecampus.edu</div></li>
          <li><?= icon('map-pin',18) ?><div><b>Campus office</b><br>Rajshahi Polytechnic Institute<br>Rajshahi, Bangladesh</div></li>
          <li><?= icon('clock',18) ?><div><b>Support hours</b><br>Saturday – Thursday<br>9:00 am – 6:00 pm</div></li>
          <li><?= icon('shield',18) ?><div><b>Safety</b><br>To report an inappropriate listing, use the “Report” button on that listing so moderators can review it.</div></li>
        </ul>
      </div>
      <div class="panel" style="margin-top:18px">
        <div class="panel-body" style="font-size:13px;color:var(--muted)">
          <b style="color:var(--text)">Student-only platform.</b> Access to marketplace and dashboard features requires a verified student account.
        </div>
      </div>
    </div>
  </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
