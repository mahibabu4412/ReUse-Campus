<?php
require_once __DIR__ . '/includes/components.php';

$id = (int)($_GET['id'] ?? 0);
$listing = getListing($id);
if (!$listing || $listing['status'] !== 'active') {
    setFlash('error', 'That listing is no longer available.');
    redirect('explore.php');
}

// increment view counter
db('UPDATE listings SET views = views + 1 WHERE id = ?', [$id]);
$listing['views']++;

$images = getListingImages($id);
if (!$images) $images = [['filename' => 'images/placeholder.svg']];
$user = authUser();
$isOwner = $user && (int)$user['id'] === (int)$listing['user_id'];
$saved = isFavorite($user['id'] ?? null, $id);

$existing = null;
if ($user && !$isOwner) {
    $existing = dbOne('SELECT * FROM item_requests WHERE listing_id=? AND requester_id=? ORDER BY id DESC LIMIT 1', [$id, $user['id']]);
}

$related = matchListings($listing, 4, $id, $user['id'] ?? null);
$reviews = dbAll('SELECT r.*, u.full_name AS reviewer_name FROM reviews r JOIN users u ON u.id=r.reviewer_id WHERE r.reviewed_user_id=? ORDER BY r.created_at DESC LIMIT 5', [$listing['user_id']]);
$rating = dbOne('SELECT ROUND(AVG(rating),1) avg, COUNT(*) c FROM reviews WHERE reviewed_user_id=?', [$listing['user_id']]);

$pageTitle = $listing['title'];
require_once __DIR__ . '/includes/header.php';
?>

<div class="page-head">
  <div class="container">
    <div class="breadcrumb">
      <a href="<?= url('index.php') ?>">Home</a><span class="sep"><?= icon('chevron-right',13) ?></span>
      <a href="<?= url('explore.php') ?>">Explore</a><span class="sep"><?= icon('chevron-right',13) ?></span>
      <a href="<?= url('explore.php?category='.$listing['category_id']) ?>"><?= e($listing['category_name']) ?></a>
      <span class="sep"><?= icon('chevron-right',13) ?></span><span>Details</span>
    </div>
  </div>
</div>

<section class="section">
  <div class="container detail-layout">
    <!-- GALLERY -->
    <div>
      <div class="detail-gallery">
        <div class="gallery-main"><img id="galleryMain" src="<?= e(imageUrl($images[0]['filename'])) ?>" alt="<?= e($listing['title']) ?>"></div>
        <?php if (count($images) > 1): ?>
          <div class="gallery-thumbs">
            <?php foreach ($images as $i => $img): ?>
              <button class="<?= $i===0?'active':'' ?>" data-img="<?= e(imageUrl($img['filename'])) ?>"><img src="<?= e(imageUrl($img['filename'])) ?>" alt="Photo <?= $i+1 ?>"></button>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>

      <div class="panel" style="margin-top:20px">
        <div class="panel-head"><h2>Description</h2></div>
        <div class="panel-body"><p style="color:var(--text-2);line-height:1.8;white-space:pre-line"><?= e($listing['description']) ?></p></div>
      </div>

      <?php if ($reviews): ?>
      <div class="panel">
        <div class="panel-head"><h2>Reviews from exchanges</h2></div>
        <div class="panel-body">
          <?php foreach ($reviews as $rv): ?>
            <div style="padding:10px 0;border-bottom:1px solid var(--border-2)">
              <div style="color:#e0a30a"><?= str_repeat('★', (int)$rv['rating']) ?></div>
              <p style="font-size:13px;color:var(--text-2);margin:4px 0"><?= e($rv['comment']) ?></p>
              <small style="color:var(--muted)">— <?= e($rv['reviewer_name']) ?></small>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endif; ?>
    </div>

    <!-- INFO -->
    <aside>
      <span class="badge badge-<?= e($listing['exchange_type']) ?>"><?= e(exchangeLabel($listing['exchange_type'])) ?></span>
      <h1 class="detail-title"><?= e($listing['title']) ?></h1>
      <div class="detail-tags">
        <span class="badge badge-new"><?= e(conditionLabel($listing['item_condition'])) ?></span>
        <span class="badge badge-<?= e($listing['availability']) ?>"><?= e(ucfirst($listing['availability'])) ?></span>
      </div>
      <div class="detail-price"><?= $listing['exchange_type']==='donation' ? 'Free' : formatMoney($listing['price']) ?></div>
      <div class="meta-list">
        <span><?= icon('eye',14) ?> <?= (int)$listing['views'] ?> views</span>
        <span><?= icon('clock',14) ?> Added <?= e(timeAgo($listing['created_at'])) ?></span>
        <span><?= icon('tag',14) ?> <?= e($listing['category_name']) ?></span>
      </div>

      <div class="detail-actions">
        <?php if ($isOwner): ?>
          <a href="<?= url('dashboard/listings.php') ?>" class="btn btn-outline"><?= icon('package',17) ?> Manage this listing</a>
        <?php elseif ($existing && in_array($existing['status'], ['pending','accepted'], true)): ?>
          <a href="<?= url('dashboard/requests.php') ?>" class="btn btn-outline"><?= icon('check-circle',17) ?> Request <?= e($existing['status']) ?></a>
        <?php else: ?>
          <a href="<?= url('requests/create.php?listing='.$id) ?>" class="btn btn-primary btn-lg"><?= icon('send',17) ?> Request item</a>
        <?php endif; ?>
        <button class="btn btn-outline fav-btn <?= $saved?'active':'' ?>" style="position:static;width:auto;height:auto;border-radius:10px;padding:11px 16px" data-favorite="<?= $id ?>" title="Save"><?= icon('heart',17) ?></button>
      </div>

      <div class="detail-box">
        <h3>Item details</h3>
        <div class="detail-row"><?= icon('layers',17) ?> <b>Category</b><span><?= e($listing['category_name']) ?></span></div>
        <div class="detail-row"><?= icon('tag',17) ?> <b>Condition</b><span><?= e(conditionLabel($listing['item_condition'])) ?></span></div>
        <div class="detail-row"><?= icon('repeat',17) ?> <b>Exchange type</b><span><?= e(exchangeLabel($listing['exchange_type'])) ?></span></div>
        <div class="detail-row"><?= icon('check-circle',17) ?> <b>Availability</b><span><?= e(ucfirst($listing['availability'])) ?></span></div>
        <div class="detail-row"><?= icon('map-pin',17) ?> <b>Pickup location</b><span><?= e($listing['pickup_location'] ?: 'Campus') ?></span></div>
        <?php if ($listing['exchange_type']==='borrow'): ?>
        <div class="detail-row"><?= icon('calendar',17) ?> <b>Return date</b><span>Agreed between students</span></div>
        <?php endif; ?>
      </div>

      <div class="detail-box">
        <h3>Listed by</h3>
        <div class="owner-card">
          <span class="avatar"><?= e(initials($listing['owner_name'])) ?></span>
          <div style="min-width:0"><b><?= e($listing['owner_name']) ?></b>
          <small><?= e($listing['owner_college'] ?: 'ReUse Campus member') ?></small>
          <small><?= e($listing['owner_department'] ?: '') ?></small></div>
        </div>
        <?php if ($rating['c'] > 0): ?>
          <div style="font-size:12.5px;color:var(--muted);margin-top:12px"><?= icon('star',14) ?> <b style="color:var(--text)"><?= e($rating['avg']) ?></b> from <?= (int)$rating['c'] ?> exchange<?= $rating['c']>1?'s':'' ?></div>
        <?php endif; ?>
        <?php if ($user && !$isOwner): ?>
          <button class="btn btn-ghost btn-sm btn-block" style="margin-top:12px" id="reportBtn"><?= icon('flag',14) ?> Report this listing</button>
          <form id="reportForm" style="display:none;margin-top:12px" method="post" action="<?= url('api/report.php') ?>">
            <?= csrf_field() ?><input type="hidden" name="listing_id" value="<?= $id ?>">
            <select class="select" name="reason" required>
              <option value="inappropriate">Inappropriate content</option>
              <option value="spam">Spam or scam</option>
              <option value="misleading">Misleading information</option>
              <option value="other">Other</option>
            </select>
            <textarea class="textarea" name="details" placeholder="Additional details (optional)" style="margin-top:8px;min-height:80px"></textarea>
            <button class="btn btn-danger btn-sm btn-block" style="margin-top:8px">Submit report</button>
          </form>
        <?php endif; ?>
      </div>

      <?php if ($related): ?>
      <div class="match-note">
        <b><?= icon('sparkles',14) ?> Why these recommendations?</b><br>
        Matched by category, exchange preference, shared college and title keywords. Rule-based only — no AI is used.
      </div>
      <?php endif; ?>
    </aside>
  </div>
</section>

<?php if ($related): ?>
<section class="section-sm" style="background:var(--surface);border-top:1px solid var(--border)">
  <div class="container">
    <div class="section-head"><div><div class="eyebrow-line">Recommended for you</div><h2>Related resources</h2><p>Items matched to this listing using our rule-based engine.</p></div></div>
    <div class="listing-grid">
      <?php foreach ($related as $r): ?>
        <article class="listing-card card-hover">
          <a href="<?= url('listing.php?id='.$r['id']) ?>" class="listing-media"><img src="<?= e(imageUrl($r['image'])) ?>" alt="<?= e($r['title']) ?>" loading="lazy">
            <span class="badge badge-<?= e($r['exchange_type']) ?> listing-type"><?= e(exchangeLabel($r['exchange_type'])) ?></span></a>
          <div class="listing-body">
            <span class="listing-cat">Match score: <b><?= (int)$r['match_score'] ?>%</b></span>
            <a href="<?= url('listing.php?id='.$r['id']) ?>" class="listing-title"><?= e($r['title']) ?></a>
            <div class="listing-price"><?= $r['exchange_type']==='donation'?'Free':formatMoney($r['price']) ?></div>
            <div class="match-note" style="margin-top:2px;font-size:11.5px">✓ <?= e(implode(' · ', $r['match_reasons'])) ?></div>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<script>
document.querySelectorAll('.gallery-thumbs button').forEach(function(b){
  b.addEventListener('click', function(){
    document.getElementById('galleryMain').src = b.dataset.img;
    document.querySelectorAll('.gallery-thumbs button').forEach(function(x){x.classList.remove('active')});
    b.classList.add('active');
  });
});
var rb = document.getElementById('reportBtn');
if (rb) rb.addEventListener('click', function(){ document.getElementById('reportForm').style.display='block'; this.style.display='none'; });
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
