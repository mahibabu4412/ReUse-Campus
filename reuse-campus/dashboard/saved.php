<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
requireLogin();
$uid = (int)authUser()['id'];
$rows = dbAll('SELECT l.*, c.name AS category_name,
   (SELECT filename FROM listing_images li WHERE li.listing_id=l.id ORDER BY li.is_primary DESC,li.id ASC LIMIT 1) AS image,
   u.full_name AS owner_name, f.created_at AS saved_at
   FROM favorites f JOIN listings l ON l.id=f.listing_id JOIN categories c ON c.id=l.category_id JOIN users u ON u.id=l.user_id
   WHERE f.user_id=? AND l.status="active" ORDER BY f.created_at DESC', [$uid]);

$appTitle = 'Saved items';
$active = 'saved';
require_once __DIR__ . '/../includes/app_header.php';
?>
<div class="panel">
  <div class="panel-head"><div><h2>Saved items</h2><div class="sub">Resources you bookmarked for later.</div></div><span class="badge"><?= count($rows) ?> saved</span></div>
  <div class="panel-body">
    <?php if ($rows): ?>
      <div class="listing-grid" id="listingView" data-view-mode="grid">
        <?php foreach ($rows as $l):
          $price = $l['exchange_type']==='donation' ? 'Free' : formatMoney($l['price']); ?>
          <article class="listing-card card-hover">
            <a href="<?= url('listing.php?id='.$l['id']) ?>" class="listing-media"><img src="<?= e(imageUrl($l['image'])) ?>" alt="<?= e($l['title']) ?>" loading="lazy">
              <span class="badge badge-<?= e($l['exchange_type']) ?> listing-type"><?= e(exchangeLabel($l['exchange_type'])) ?></span></a>
            <button class="fav-btn active" data-favorite="<?= (int)$l['id'] ?>" title="Remove from saved"><?= icon('heart',17) ?></button>
            <div class="listing-body">
              <span class="listing-cat"><?= e($l['category_name']) ?></span>
              <a href="<?= url('listing.php?id='.$l['id']) ?>" class="listing-title"><?= e($l['title']) ?></a>
              <div class="listing-price"><?= e($price) ?></div>
              <div class="listing-meta"><span><?= icon('clock',13) ?> Saved <?= e(timeAgo($l['saved_at'])) ?></span></div>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    <?php else: ?>
      <?= emptyState('Nothing saved yet', 'Tap the heart on any listing to save it here for later.', 'Explore marketplace', url('explore.php')) ?>
    <?php endif; ?>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
