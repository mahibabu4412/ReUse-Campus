<?php
require_once __DIR__ . '/includes/components.php';
$pageTitle = 'Home';
$active = 'home';

$stats = platformStats();
$categories = getCategories();
$featured = fetchListings('l.status="active" AND l.availability="available"', [], 'l.views DESC', 8);
$recent   = fetchListings('l.status="active" AND l.availability="available"', [], 'l.created_at DESC', 4);
$freebies  = fetchListings('l.status="active" AND l.exchange_type="donation"', [], 'l.created_at DESC', 4);

require_once __DIR__ . '/includes/header.php';
?>

<!-- HERO -->
<section class="hero">
  <div class="container hero-inner">
    <div>
      <span class="eyebrow"><?= icon('sparkles', 15) ?> The smarter way to share resources</span>
      <h1>Good resources deserve <span class="accent">a second life.</span></h1>
      <p class="hero-lead">Buy, sell, borrow, donate or exchange textbooks, notes, tools and tech with students on your campus. Spend less, waste less, learn together.</p>
      <form class="hero-search" action="<?= url('explore.php') ?>" method="get">
        <div class="search-field"><?= icon('search', 19) ?><input type="search" name="q" placeholder="Search textbooks, calculators, notes..." aria-label="Search resources"></div>
        <button class="btn btn-primary" type="submit">Search</button>
      </form>
      <div class="hero-trust">
        <div><?= icon('shield', 16) ?> Verified students only</div>
        <div><?= icon('map-pin', 16) ?> Campus pick-up</div>
        <div><?= icon('repeat', 16) ?> 4 ways to exchange</div>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="hero-art-card">
        <div class="art-grid">
          <div class="art-tile"><img src="<?= asset('images/ph-book-math.svg') ?>" alt=""></div>
          <div class="art-tile"><img src="<?= asset('images/ph-calculator.svg') ?>" alt=""></div>
          <div class="art-tile"><img src="<?= asset('images/ph-drawing.svg') ?>" alt=""></div>
          <div class="art-tile"><img src="<?= asset('images/ph-notes.svg') ?>" alt=""></div>
        </div>
      </div>
      <div class="float-card float-1"><span class="fav"><?= icon('heart', 17) ?></span> Saved by 120+ students</div>
      <div class="float-card float-2"><span class="check"><?= icon('check', 17) ?></span> Exchange completed</div>
    </div>
  </div>
</section>

<!-- CATEGORIES -->
<section class="section-sm">
  <div class="container">
    <div class="section-head">
      <div><div class="eyebrow-line">Browse by category</div><h2>Find exactly what you need</h2></div>
      <a href="<?= url('explore.php') ?>" class="link-more">View all resources <?= icon('arrow-right', 16) ?></a>
    </div>
    <div class="category-grid">
      <?php foreach ($categories as $c): ?>
        <a href="<?= url('explore.php?category=' . $c['id']) ?>" class="category-card">
          <span class="cat-icon"><?= icon($c['icon'] ?: 'layers', 22) ?></span>
          <span><h3><?= e($c['name']) ?></h3><span><?= e($c['description'] ?: 'Explore items') ?></span></span>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- FEATURED -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <div><div class="eyebrow-line">Trending on campus</div><h2>Featured listings</h2><p>Popular resources students are looking at right now.</p></div>
      <a href="<?= url('explore.php') ?>" class="link-more">Explore marketplace <?= icon('arrow-right', 16) ?></a>
    </div>
    <?php if ($featured): ?>
      <div class="listing-grid"><?php foreach ($featured as $l) echo listingCard($l); ?></div>
    <?php else: ?>
      <?= emptyState('No listings yet', 'Be the first to list a resource on your campus.', 'List an item', url('listings/create.php')) ?>
    <?php endif; ?>
  </div>
</section>

<!-- STATS -->
<section class="section-sm">
  <div class="container">
    <div class="stats-band">
      <div class="stats-grid">
        <div class="stat"><?= icon('users', 30) ?><div class="num"><?= $stats['students'] ?>+</div><div class="label">Active students</div></div>
        <div class="stat"><?= icon('package', 30) ?><div class="num"><?= $stats['listings'] ?></div><div class="label">Live listings</div></div>
        <div class="stat"><?= icon('repeat', 30) ?><div class="num"><?= $stats['exchanges'] ?></div><div class="label">Exchanges completed</div></div>
        <div class="stat"><?= icon('layers', 30) ?><div class="num"><?= $stats['categories'] ?></div><div class="label">Resource categories</div></div>
      </div>
    </div>
  </div>
</section>

<!-- RECENTLY ADDED -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <div><div class="eyebrow-line">Fresh on campus</div><h2>Recently added</h2><p>The newest resources shared by students like you.</p></div>
      <a href="<?= url('explore.php?sort=newest') ?>" class="link-more">See all new items <?= icon('arrow-right', 16) ?></a>
    </div>
    <div class="listing-grid"><?php foreach ($recent as $l) echo listingCard($l); ?></div>
  </div>
</section>

<!-- FREE DONATIONS -->
<section class="section" style="background:var(--surface);border-block:1px solid var(--border)">
  <div class="container">
    <div class="section-head">
      <div><div class="eyebrow-line">Give a little, help a lot</div><h2>Free donations</h2><p>Resources students are giving away for free — claim them before they're gone.</p></div>
      <a href="<?= url('explore.php?type=donation') ?>" class="link-more">Browse donations <?= icon('arrow-right', 16) ?></a>
    </div>
    <div class="listing-grid"><?php foreach ($freebies as $l) echo listingCard($l); ?></div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section">
  <div class="container">
    <div class="section-head" style="justify-content:center;text-align:center">
      <div><div class="eyebrow-line">Simple by design</div><h2>How ReUse Campus works</h2><p>Four easy steps from clutter to community.</p></div>
    </div>
    <div class="steps">
      <div class="step"><div class="step-num">1</div><h3>Create your profile</h3><p>Sign up with your student details. Your private information stays private.</p></div>
      <div class="step"><div class="step-num">2</div><h3>List or search</h3><p>Upload photos of items you no longer need, or search for what you're looking for.</p></div>
      <div class="step"><div class="step-num">3</div><h3>Send a request</h3><p>Chat with the owner, agree on terms and track your request status in real time.</p></div>
      <div class="step"><div class="step-num">4</div><h3>Exchange & reuse</h3><p>Meet on campus, complete the exchange and keep resources in circulation.</p></div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="section-sm">
  <div class="container">
    <div class="section-head"><div><div class="eyebrow-line">From the community</div><h2>What students say</h2></div></div>
    <div class="testi-grid">
      <div class="testi"><div class="stars"><?= icon('star', 15) ?><?= icon('star', 15) ?><?= icon('star', 15) ?><?= icon('star', 15) ?><?= icon('star', 15) ?></div>
        <p>“I found all my first-year textbooks for a fraction of the price. The whole process was smooth and the sellers were fellow students from my own campus.”</p>
        <div class="who"><span class="avatar">SI</span><div><b>Sadia Islam</b><span>Civil Engineering, 3rd semester</span></div></div></div>
      <div class="testi"><div class="stars"><?= icon('star', 15) ?><?= icon('star', 15) ?><?= icon('star', 15) ?><?= icon('star', 15) ?><?= icon('star', 15) ?></div>
        <p>“I donated my old drawing instruments and they went to a junior who really needed them. Feels great to give things a second life.”</p>
        <div class="who"><span class="avatar">TH</span><div><b>Tanvir Hasan</b><span>Mechanical Engineering, 6th semester</span></div></div></div>
      <div class="testi"><div class="stars"><?= icon('star', 15) ?><?= icon('star', 15) ?><?= icon('star', 15) ?><?= icon('star', 15) ?><?= icon('star', 15) ?></div>
        <p>“Borrowing a calculator for exams instead of buying one saved me money. The request tracking kept everything clear and on time.”</p>
        <div class="who"><span class="avatar">NJ</span><div><b>Nusrat Jahan</b><span>Computer Science, 5th semester</span></div></div></div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="section-sm">
  <div class="container">
    <div class="cta">
      <div><h2>Ready to share more and waste less?</h2><p>Join your campus community of smart, resourceful students today.</p></div>
      <a href="<?= url('auth/register.php') ?>" class="btn btn-dark btn-lg">Create free account <?= icon('arrow-right', 17) ?></a>
    </div>
  </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
