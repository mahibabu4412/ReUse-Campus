<?php
require_once __DIR__ . '/includes/components.php';
$pageTitle = 'About Us';
$active = 'about';
require_once __DIR__ . '/includes/header.php';
?>

<div class="page-head">
  <div class="container">
    <div class="breadcrumb"><a href="<?= url('index.php') ?>">Home</a><span class="sep"><?= icon('chevron-right',13) ?></span><span>About</span></div>
    <h1>About ReUse Campus</h1>
    <p>Share More. Waste Less. Learn Together.</p>
  </div>
</div>

<section class="section">
  <div class="container prose" style="max-width:900px">
    <h2 style="margin-top:0">Why we exist</h2>
    <p>Educational materials are expensive, yet every semester countless textbooks, calculators, drawing tools and notes are thrown away or left to gather dust. Students pay full price for things that another student down the hall is happy to pass on.</p>
    <p>ReUse Campus is a student-to-student resource exchange platform built to close that gap. We make it easy to list what you no longer need and find what you do need — whether that means donating, borrowing, exchanging or buying at a fair price.</p>

    <h2>Our mission</h2>
    <p>To reduce educational expenses and minimise waste by making resource sharing the easiest and most natural choice for every college and polytechnic student.</p>

    <h2>Our objectives</h2>
    <div class="feature-tiles" style="margin-top:18px">
      <div class="feature-tile"><div class="icon-box"><?= icon('wallet',22) ?></div><h3>Lower costs</h3><p>Help students save money by reusing and sharing materials instead of buying new.</p></div>
      <div class="feature-tile"><div class="icon-box"><?= icon('repeat',22) ?></div><h3>Reduce waste</h3><p>Keep useful items in circulation and out of landfills for as long as possible.</p></div>
      <div class="feature-tile"><div class="icon-box"><?= icon('users',22) ?></div><h3>Build community</h3><p>Connect students across departments and semesters through mutual support.</p></div>
    </div>

    <h2>Our principles</h2>
    <p><b>Privacy first.</b> Student ID, contact details and profile information are never exposed publicly. Only the display name and campus shown on a listing are visible to other students.</p>
    <p><b>Fair and transparent.</b> Every request has a clear status and both parties are notified of changes. Our matching suggestions use transparent rules — category, preference, availability and college — and we never claim AI functionality we do not have.</p>
    <p><b>Student-governed.</b> Moderators review reports and listings so the marketplace stays safe, respectful and useful for everyone.</p>
  </div>
</section>

<section class="section-sm">
  <div class="container">
    <div class="cta">
      <div><h2>Be part of the change</h2><p>One shared textbook is one less textbook bought, shipped and eventually discarded.</p></div>
      <a href="<?= url('auth/register.php') ?>" class="btn btn-dark btn-lg">Join ReUse Campus</a>
    </div>
  </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
