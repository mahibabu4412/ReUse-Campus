<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
requireLogin();
$user = authUser();
$uid = (int)$user['id'];

$myListings = (int)dbOne('SELECT COUNT(*) c FROM listings WHERE user_id=? AND status="active"',[$uid])['c'];
$outPending = (int)dbOne('SELECT COUNT(*) c FROM item_requests WHERE requester_id=? AND status="pending"',[$uid])['c'];
$inPending  = (int)dbOne('SELECT COUNT(*) c FROM item_requests WHERE owner_id=? AND status="pending"',[$uid])['c'];
$completed  = (int)dbOne('SELECT COUNT(*) c FROM exchange_history WHERE requester_id=? OR owner_id=?',[$uid,$uid])['c'];
$saved      = (int)dbOne('SELECT COUNT(*) c FROM favorites WHERE user_id=?',[$uid])['c'];

$recentReq = dbAll('SELECT r.*, l.title AS listing_title, own.full_name AS owner_name, req.full_name AS requester_name
                    FROM item_requests r JOIN listings l ON l.id=r.listing_id
                    JOIN users own ON own.id=r.owner_id JOIN users req ON req.id=r.requester_id
                    WHERE r.requester_id=? OR r.owner_id=? ORDER BY r.updated_at DESC LIMIT 6', [$uid,$uid]);
$notifs = dbAll('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 5',[$uid]);

// monthly listings activity (last 6 months)
$months = [];
for ($i=5; $i>=0; $i--) { $m = date('Y-m', strtotime("-$i months")); $months[$m] = ['label'=>date('M',strtotime($m.'-01')),'count'=>0]; }
foreach (dbAll('SELECT DATE_FORMAT(created_at,"%Y-%m") m, COUNT(*) c FROM listings WHERE user_id=? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY m',[$uid]) as $r) {
    if (isset($months[$r['m']])) $months[$r['m']]['count'] = (int)$r['c'];
}
$max = max(1, max(array_column($months,'count')));

$appTitle = 'Dashboard overview';
$active = 'overview';
require_once __DIR__ . '/../includes/app_header.php';
?>

<?php if (isset($_GET['welcome'])): ?>
  <div class="form-note" style="margin-bottom:18px"><?= icon('sparkles',16) ?> Welcome to ReUse Campus, <b><?= e(explode(' ',$user['full_name'])[0]) ?></b>! Your account is ready.
    <?php if (!$user['email_verified']): ?> Please <a href="<?= url('auth/verify.php?token='.e($user['verification_token'])) ?>">verify your email</a> to complete setup. <?php endif; ?>
  </div>
<?php endif; ?>

<div class="stat-cards">
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('package',20) ?></span></div><div class="num"><?= $myListings ?></div><div class="label">Active listings</div></div>
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('send',20) ?></span><span class="sc-trend"><?= $outPending ?> pending</span></div><div class="num"><?= $outPending ?></div><div class="label">My requests</div></div>
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('handshake',20) ?></span><span class="sc-trend"><?= $inPending ?> new</span></div><div class="num"><?= $inPending ?></div><div class="label">Incoming requests</div></div>
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('repeat',20) ?></span></div><div class="num"><?= $completed ?></div><div class="label">Completed exchanges</div></div>
</div>

<div class="two-col">
  <div>
    <div class="panel">
      <div class="panel-head"><h2>Recent activity</h2><a href="<?= url('dashboard/requests.php') ?>" class="btn btn-ghost btn-sm">View all</a></div>
      <div class="panel-body flush">
        <?php if ($recentReq): ?>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Item</th><th>With</th><th>Status</th><th>Updated</th></tr></thead>
            <tbody>
            <?php foreach ($recentReq as $r): ?>
              <tr>
                <td><a class="table-title" href="<?= url('listing.php?id='.$r['listing_id']) ?>"><?= e($r['listing_title']) ?></a></td>
                <td><?= e($r['owner_id']==$uid ? $r['requester_name'] : $r['owner_name']) ?></td>
                <td><?= statusBadge($r['status']) ?></td>
                <td class="table-sub"><?= e(timeAgo($r['updated_at'])) ?></td>
              </tr>
            <?php endforeach; ?>
            </tbody>
          </table></div>
        <?php else: ?>
          <?= emptyState('No activity yet', 'Browse the marketplace and send your first request.', 'Explore items', url('explore.php')) ?>
        <?php endif; ?>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><h2>Your listing activity</h2><span class="sub">Last 6 months</span></div>
      <div class="panel-body">
        <div class="chart">
          <?php foreach ($months as $m): ?>
            <div class="bar-group"><div class="bar" style="height:<?= max(4, round($m['count']/$max*140)) ?>px" title="<?= $m['count'] ?> listings"></div><span class="bar-label"><?= $m['label'] ?></span></div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </div>

  <div>
    <div class="panel">
      <div class="panel-head"><h2>Notifications</h2><a href="<?= url('dashboard/notifications.php') ?>" class="btn btn-ghost btn-sm">All</a></div>
      <div class="panel-body flush">
        <?php if ($notifs): foreach ($notifs as $n): ?>
          <div class="notif-item <?= $n['is_read']?'':'unread' ?>">
            <span class="notif-icon"><?= icon($n['type']==='request'?'repeat':($n['type']==='exchange'?'check-circle':'bell'),17) ?></span>
            <div><b><?= e($n['title']) ?></b><p><?= e($n['message']) ?></p><time><?= e(timeAgo($n['created_at'])) ?></time></div>
          </div>
        <?php endforeach; else: ?>
          <div style="padding:24px;text-align:center;color:var(--muted);font-size:13px">You're all caught up.</div>
        <?php endif; ?>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><h2>Quick actions</h2></div>
      <div class="panel-body" style="display:flex;flex-direction:column;gap:10px">
        <a href="<?= url('listings/create.php') ?>" class="btn btn-primary btn-block"><?= icon('plus',16) ?> List an item</a>
        <a href="<?= url('explore.php') ?>" class="btn btn-outline btn-block"><?= icon('search',16) ?> Browse marketplace</a>
        <a href="<?= url('dashboard/saved.php') ?>" class="btn btn-outline btn-block"><?= icon('heart',16) ?> Saved items (<?= $saved ?>)</a>
      </div>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
