<?php
require_once __DIR__ . '/includes/components.php';
$pageTitle = 'How It Works';
$active = 'how';
require_once __DIR__ . '/includes/header.php';
?>

<div class="page-head">
  <div class="container">
    <div class="breadcrumb"><a href="<?= url('index.php') ?>">Home</a><span class="sep"><?= icon('chevron-right',13) ?></span><span>How it works</span></div>
    <h1>How ReUse Campus works</h1>
    <p>A simple, safe workflow built for busy students.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="steps">
      <div class="step"><div class="step-num">1</div><h3>Create your profile</h3><p>Register with your student ID, college and department. We verify accounts and keep your private details hidden from other students.</p></div>
      <div class="step"><div class="step-num">2</div><h3>List or search</h3><p>Post an item with photos, condition and pickup location — or search and filter the marketplace to find exactly what you need.</p></div>
      <div class="step"><div class="step-num">3</div><h3>Send a request</h3><p>Choose donation, borrow, exchange or sale. Add a short message and, for borrowing, an expected return date.</p></div>
      <div class="step"><div class="step-num">4</div><h3>Exchange & complete</h3><p>Owners accept or reject requests. Once the handover happens, mark it complete and build your exchange history.</p></div>
    </div>
  </div>
</section>

<section class="section-sm" style="background:var(--surface);border-block:1px solid var(--border)">
  <div class="container">
    <div class="section-head"><div><div class="eyebrow-line">Four ways to share</div><h2>Choose how you want to exchange</h2></div></div>
    <div class="feature-tiles">
      <div class="feature-tile"><div class="icon-box"><?= icon('gift',22) ?></div><h3>Free donation</h3><p>Give items away for free to students who need them. Perfect for notes and supplies you no longer use.</p></div>
      <div class="feature-tile"><div class="icon-box"><?= icon('calendar',22) ?></div><h3>Borrow</h3><p>Lend or borrow temporarily with an agreed return date. Owners can confirm when items come back.</p></div>
      <div class="feature-tile"><div class="icon-box"><?= icon('repeat',22) ?></div><h3>Exchange</h3><p>Swap resources with another student. Great for trading gear you have for something you actually need.</p></div>
      <div class="feature-tile"><div class="icon-box"><?= icon('tag',22) ?></div><h3>Sale</h3><p>Set a fair asking price and sell to classmates. Keep textbooks affordable and out of the bin.</p></div>
      <div class="feature-tile"><div class="icon-box"><?= icon('bell',22) ?></div><h3>Track &amp; get notified</h3><p>Every status change triggers a notification for both students. No more guessing where a request stands.</p></div>
      <div class="feature-tile"><div class="icon-box"><?= icon('shield',22) ?></div><h3>Stay safe</h3><p>Meet on campus, review reports and let moderators step in. Your contact details are never shown publicly.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta">
      <div><h2>Ready to get started?</h2><p>Create your free student account and post your first listing in minutes.</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a href="<?= url('auth/register.php') ?>" class="btn btn-dark btn-lg">Sign up</a>
        <a href="<?= url('explore.php') ?>" class="btn btn-outline btn-lg" style="border-color:rgba(255,255,255,.5);color:#fff">Browse items</a>
      </div>
    </div>
  </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
