<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
requireLogin();
$uid = (int)authUser()['id'];
$rows = dbAll('SELECT h.*, l.title AS listing_title,
                     (SELECT filename FROM listing_images li WHERE li.listing_id=l.id ORDER BY li.is_primary DESC,li.id ASC LIMIT 1) AS image,
                     req.full_name AS requester_name, own.full_name AS owner_name
              FROM exchange_history h JOIN listings l ON l.id=h.listing_id
              JOIN users req ON req.id=h.requester_id JOIN users own ON own.id=h.owner_id
              WHERE h.requester_id=? OR h.owner_id=? ORDER BY h.completed_at DESC', [$uid,$uid]);

$appTitle = 'Exchange history';
$active = 'history';
require_once __DIR__ . '/../includes/app_header.php';
?>
<div class="panel">
  <div class="panel-head"><div><h2>Exchange history</h2><div class="sub">A record of every completed exchange you took part in.</div></div><span class="badge badge-completed"><?= count($rows) ?> total</span></div>
  <div class="panel-body flush">
    <?php if ($rows): ?>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Item</th><th>Exchange type</th><th>With</th><th>Role</th><th>Completed</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($rows as $h): $isOwner = (int)$h['owner_id']===$uid; ?>
          <tr>
            <td><div style="display:flex;align-items:center;gap:11px"><img src="<?= e(imageUrl($h['image'])) ?>" alt="" style="width:52px;height:46px;object-fit:cover;border-radius:8px">
              <a class="table-title" href="<?= url('listing.php?id='.$h['listing_id']) ?>"><?= e($h['listing_title']) ?></a></div></td>
            <td><span class="badge badge-<?= e($h['exchange_type']) ?>"><?= e(exchangeLabel($h['exchange_type'])) ?></span></td>
            <td><?= e($isOwner ? $h['requester_name'] : $h['owner_name']) ?></td>
            <td><?= $isOwner ? 'Owner' : 'Requester' ?></td>
            <td class="table-sub"><?= e(date('d M Y', strtotime($h['completed_at']))) ?></td>
            <td><?= statusBadge('completed') ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table></div>
    <?php else: ?>
      <?= emptyState('No exchanges yet', 'Complete your first exchange and it will be recorded here.', 'Explore marketplace', url('explore.php')) ?>
    <?php endif; ?>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
