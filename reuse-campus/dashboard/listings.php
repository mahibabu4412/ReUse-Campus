<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
requireLogin();
$user = authUser();
$uid = (int)$user['id'];
$status = clean($_GET['status'] ?? 'active');
if (!in_array($status, ['active','sold','removed','pending'], true)) $status = 'active';

$rows = fetchListings('l.user_id = ? AND l.status = ?', [$uid,$status], 'l.created_at DESC');
$counts = [];
foreach (dbAll('SELECT status, COUNT(*) c FROM listings WHERE user_id=? GROUP BY status',[$uid]) as $r) $counts[$r['status']]=(int)$r['c'];

$appTitle = 'My listings';
$active = 'listings';
require_once __DIR__ . '/../includes/app_header.php';
?>

<div class="panel">
  <div class="panel-head">
    <div><h2>My listings</h2><div class="sub">Manage everything you've shared with the community.</div></div>
    <a href="<?= url('listings/create.php') ?>" class="btn btn-primary btn-sm"><?= icon('plus',16) ?> New listing</a>
  </div>
  <div class="panel-body flush">
    <div class="tabs" style="padding:0 16px">
      <?php foreach (['active'=>'Active','sold'=>'Completed','removed'=>'Removed','pending'=>'Pending review'] as $k=>$v): ?>
        <a href="<?= url('dashboard/listings.php?status='.$k) ?>" class="<?= $status===$k?'active':'' ?>"><?= $v ?> <span class="count"><?= $counts[$k] ?? 0 ?></span></a>
      <?php endforeach; ?>
    </div>
    <?php if ($rows): ?>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Item</th><th>Category</th><th>Type</th><th>Status</th><th>Requests</th><th>Views</th><th>Actions</th></tr></thead>
        <tbody>
        <?php foreach ($rows as $l):
          $reqCount = (int)dbOne('SELECT COUNT(*) c FROM item_requests WHERE listing_id=?',[$l['id']])['c']; ?>
          <tr>
            <td><div style="display:flex;align-items:center;gap:11px">
              <img src="<?= e(imageUrl($l['image'])) ?>" alt="" style="width:52px;height:46px;object-fit:cover;border-radius:8px">
              <div><a class="table-title" href="<?= url('listing.php?id='.$l['id']) ?>"><?= e($l['title']) ?></a>
              <div class="table-sub"><?= e(timeAgo($l['created_at'])) ?></div></div></div></td>
            <td><?= e($l['category_name']) ?></td>
            <td><span class="badge badge-<?= e($l['exchange_type']) ?>"><?= e(exchangeLabel($l['exchange_type'])) ?></span></td>
            <td><?= statusBadge($l['status']) ?></td>
            <td><?= $reqCount ?></td>
            <td><?= (int)$l['views'] ?></td>
            <td><div class="cell-actions">
              <a href="<?= url('listing.php?id='.$l['id']) ?>" class="icon-btn" title="View"><?= icon('eye',15) ?></a>
              <?php if ($l['status']==='active'): ?>
              <a href="<?= url('listings/edit.php?id='.$l['id']) ?>" class="icon-btn" title="Edit"><?= icon('edit-3',15) ?></a>
              <?php endif; ?>
            </div></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table></div>
    <?php else: ?>
      <?= emptyState('No '.e($status).' listings', 'When you list resources, they will appear here.', 'Create a listing', url('listings/create.php')) ?>
    <?php endif; ?>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
