<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
requireLogin();
$user = authUser();
$uid = (int)$user['id'];
$status = clean($_GET['status'] ?? 'all');
$allowed = ['all','pending','accepted','rejected','completed','cancelled'];
if (!in_array($status,$allowed,true)) $status='all';

$where = 'r.requester_id = ?'; $params = [$uid];
if ($status!=='all') { $where .= ' AND r.status = ?'; $params[] = $status; }
$rows = dbAll("SELECT r.*, l.title AS listing_title, l.exchange_type,
                      (SELECT filename FROM listing_images li WHERE li.listing_id=l.id ORDER BY li.is_primary DESC,li.id ASC LIMIT 1) AS image,
                      own.full_name AS owner_name
               FROM item_requests r JOIN listings l ON l.id=r.listing_id JOIN users own ON own.id=r.owner_id
               WHERE $where ORDER BY r.updated_at DESC", $params);

$appTitle = 'My requests';
$active = 'requests';
require_once __DIR__ . '/../includes/app_header.php';
?>

<div class="panel">
  <div class="panel-head"><div><h2>My requests</h2><div class="sub">Track every request you've sent to other students.</div></div></div>
  <div class="panel-body flush">
    <div class="tabs" style="padding:0 16px">
      <?php foreach ($allowed as $s): ?>
        <a href="<?= url('dashboard/requests.php?status='.$s) ?>" class="<?= $status===$s?'active':'' ?>"><?= $s==='all'?'All':ucfirst($s) ?></a>
      <?php endforeach; ?>
    </div>
    <div style="padding:4px 20px 20px">
      <?php if ($rows): foreach ($rows as $r): ?>
        <div class="req-card">
          <img src="<?= e(imageUrl($r['image'])) ?>" alt="" style="width:62px;height:58px;object-fit:cover;border-radius:9px;flex:none">
          <div class="req-main">
            <h4><a href="<?= url('listing.php?id='.$r['listing_id']) ?>"><?= e($r['listing_title']) ?></a> <?= statusBadge($r['status']) ?></h4>
            <p>Owner: <?= e($r['owner_name']) ?> · <?= e(exchangeLabel($r['exchange_type'])) ?> · <?= e(timeAgo($r['created_at'])) ?></p>
            <?php if ($r['message']): ?><div class="req-msg">“<?= e($r['message']) ?>”</div><?php endif; ?>
            <?php if ($r['expected_return_date']): ?><p style="margin-top:8px"><?= icon('calendar',13) ?> Expected return: <?= e(date('d M Y',strtotime($r['expected_return_date']))) ?></p><?php endif; ?>
          </div>
          <div class="req-actions">
            <?php if ($r['status']==='pending'): ?>
              <form method="post" action="<?= url('api/request_action.php') ?>" onsubmit="return confirm('Cancel this request?')">
                <?= csrf_field() ?><input type="hidden" name="action" value="cancel"><input type="hidden" name="request_id" value="<?= (int)$r['id'] ?>">
                <button class="btn btn-outline btn-sm" type="submit"><?= icon('x',14) ?> Cancel</button>
              </form>
            <?php elseif ($r['status']==='accepted'): ?>
              <?php if ($r['exchange_type']!=='borrow'): ?>
              <form method="post" action="<?= url('api/request_action.php') ?>">
                <?= csrf_field() ?><input type="hidden" name="action" value="complete"><input type="hidden" name="request_id" value="<?= (int)$r['id'] ?>">
                <button class="btn btn-primary btn-sm" type="submit"><?= icon('check',14) ?> Mark complete</button>
              </form>
              <?php else: ?>
                <span class="badge badge-pending">Awaiting owner return confirmation</span>
              <?php endif; ?>
            <?php elseif ($r['status']==='completed'): ?>
              <span class="badge badge-completed">✓ Completed</span>
              <a href="<?= url('dashboard/history.php') ?>" class="btn btn-ghost btn-sm">View history</a>
            <?php endif; ?>
          </div>
        </div>
      <?php endforeach; else: ?>
        <?= emptyState('No requests found', 'Send a request from any listing to start an exchange.', 'Explore marketplace', url('explore.php')) ?>
      <?php endif; ?>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
