<?php
require_once __DIR__ . '/../includes/auth.php';
$admin = requireAdmin();

$students = (int)dbOne('SELECT COUNT(*) c FROM users')['c'];
$activeStudents = (int)dbOne('SELECT COUNT(*) c FROM users WHERE status="active"')['c'];
$listings = (int)dbOne('SELECT COUNT(*) c FROM listings WHERE status="active"')['c'];
$pendingListings = (int)dbOne('SELECT COUNT(*) c FROM listings WHERE status="pending"')['c'];
$exchanges = (int)dbOne('SELECT COUNT(*) c FROM exchange_history')['c'];
$requests = (int)dbOne('SELECT COUNT(*) c FROM item_requests')['c'];
$pendingReports = (int)dbOne('SELECT COUNT(*) c FROM reports WHERE status="pending"')['c'];
$messages = (int)dbOne('SELECT COUNT(*) c FROM contact_messages WHERE is_read=0')['c'];

$recentUsers = dbAll('SELECT id,full_name,email,college,status,created_at FROM users ORDER BY created_at DESC LIMIT 5');
$recentListings = dbAll('SELECT l.id,l.title,l.status,l.created_at,u.full_name owner_name FROM listings l JOIN users u ON u.id=l.user_id ORDER BY l.created_at DESC LIMIT 5');
$recentReports = dbAll('SELECT r.id,r.reason,r.status,r.created_at,l.title listing_title FROM reports r LEFT JOIN listings l ON l.id=r.listing_id ORDER BY r.created_at DESC LIMIT 5');

// 6-month activity series
$series = [];
for ($i=5;$i>=0;$i--){ $m=date('Y-m',strtotime("-$i months")); $series[$m]=['label'=>date('M',strtotime($m.'-01')),'users'=>0,'listings'=>0,'exchanges'=>0]; }
foreach (dbAll('SELECT DATE_FORMAT(created_at,"%Y-%m") m,COUNT(*) c FROM users WHERE created_at>=DATE_SUB(NOW(),INTERVAL 6 MONTH) GROUP BY m') as $r) if(isset($series[$r['m']])) $series[$r['m']]['users']=(int)$r['c'];
foreach (dbAll('SELECT DATE_FORMAT(created_at,"%Y-%m") m,COUNT(*) c FROM listings WHERE created_at>=DATE_SUB(NOW(),INTERVAL 6 MONTH) GROUP BY m') as $r) if(isset($series[$r['m']])) $series[$r['m']]['listings']=(int)$r['c'];
foreach (dbAll('SELECT DATE_FORMAT(completed_at,"%Y-%m") m,COUNT(*) c FROM exchange_history WHERE completed_at>=DATE_SUB(NOW(),INTERVAL 6 MONTH) GROUP BY m') as $r) if(isset($series[$r['m']])) $series[$r['m']]['exchanges']=(int)$r['c'];
$max = 1;
foreach ($series as $s) $max = max($max,$s['users'],$s['listings'],$s['exchanges']);

$types = dbAll('SELECT exchange_type, COUNT(*) c FROM listings WHERE status="active" GROUP BY exchange_type');

$appTitle = 'Admin overview';
$active = 'overview';
$isAdminLayout = true;
require_once __DIR__ . '/../includes/app_header.php';
?>

<div class="stat-cards">
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('users',20) ?></span><span class="sc-trend"><?= $activeStudents ?> active</span></div><div class="num"><?= $students ?></div><div class="label">Registered students</div></div>
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('package',20) ?></span><span class="sc-trend"><?= $pendingListings ?> pending</span></div><div class="num"><?= $listings ?></div><div class="label">Active listings</div></div>
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('repeat',20) ?></span><span class="sc-trend"><?= $requests ?> requests</span></div><div class="num"><?= $exchanges ?></div><div class="label">Completed exchanges</div></div>
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('flag',20) ?></span><span class="sc-trend"><?= $messages ?> messages</span></div><div class="num"><?= $pendingReports ?></div><div class="label">Pending reports</div></div>
</div>

<div class="two-col">
  <div>
    <div class="panel">
      <div class="panel-head"><h2>Platform activity</h2><span class="sub">Last 6 months</span></div>
      <div class="panel-body">
        <div class="chart" style="height:190px">
          <?php foreach ($series as $s): ?>
            <div class="bar-group">
              <div style="display:flex;gap:3px;align-items:flex-end;height:150px;width:100%;justify-content:center">
                <div class="bar" style="height:<?= max(3,round($s['users']/$max*140)) ?>px;background:#8ed5b4" title="Users: <?= $s['users'] ?>"></div>
                <div class="bar" style="height:<?= max(3,round($s['listings']/$max*140)) ?>px;background:#1f9d6b" title="Listings: <?= $s['listings'] ?>"></div>
                <div class="bar" style="height:<?= max(3,round($s['exchanges']/$max*140)) ?>px;background:#0d6046" title="Exchanges: <?= $s['exchanges'] ?>"></div>
              </div>
              <span class="bar-label"><?= $s['label'] ?></span>
            </div>
          <?php endforeach; ?>
        </div>
        <div style="display:flex;gap:16px;justify-content:center;margin-top:14px;font-size:11.5px;color:var(--muted)">
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#8ed5b4"></i> Students</span>
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#1f9d6b"></i> Listings</span>
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#0d6046"></i> Exchanges</span>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><h2>Recent listings</h2><a href="<?= url('admin/listings.php') ?>" class="btn btn-ghost btn-sm">Manage</a></div>
      <div class="panel-body flush"><div class="table-wrap"><table class="data">
        <thead><tr><th>Item</th><th>Owner</th><th>Status</th><th>Created</th></tr></thead><tbody>
        <?php foreach ($recentListings as $l): ?><tr>
          <td><a class="table-title" href="<?= url('listing.php?id='.$l['id']) ?>"><?= e($l['title']) ?></a></td>
          <td><?= e($l['owner_name']) ?></td><td><?= statusBadge($l['status']) ?></td><td class="table-sub"><?= e(timeAgo($l['created_at'])) ?></td>
        </tr><?php endforeach; ?>
        </tbody></table></div></div>
    </div>
  </div>

  <div>
    <div class="panel">
      <div class="panel-head"><h2>Exchange types</h2></div>
      <div class="panel-body">
        <?php foreach ($types as $t): $pct = $listings ? round($t['c']/$listings*100) : 0; ?>
          <div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><b><?= e(exchangeLabel($t['exchange_type'])) ?></b><span style="color:var(--muted)"><?= (int)$t['c'] ?></span></div>
          <div style="height:7px;background:var(--green-50);border-radius:100px;overflow:hidden"><div style="height:100%;width:<?= $pct ?>%;background:var(--green-600);border-radius:100px"></div></div></div>
        <?php endforeach; ?>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><h2>New students</h2><a href="<?= url('admin/users.php') ?>" class="btn btn-ghost btn-sm">All</a></div>
      <div class="panel-body flush">
        <?php foreach ($recentUsers as $u): ?><div class="notif-item">
          <span class="avatar" style="width:34px;height:34px;font-size:11px"><?= e(initials($u['full_name'])) ?></span>
          <div style="min-width:0"><b style="font-size:12.5px"><?= e($u['full_name']) ?></b><p style="font-size:11.5px"><?= e($u['college']) ?></p><time><?= e(timeAgo($u['created_at'])) ?></time></div>
          <?= statusBadge($u['status']) ?>
        </div><?php endforeach; ?>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><h2>Reports</h2><a href="<?= url('admin/reports.php') ?>" class="btn btn-ghost btn-sm">Review</a></div>
      <div class="panel-body flush">
        <?php if ($recentReports): foreach ($recentReports as $r): ?><div class="notif-item">
          <span class="notif-icon"><?= icon('flag',16) ?></span>
          <div style="min-width:0"><b style="font-size:12.5px"><?= e(ucfirst($r['reason'])) ?></b><p><?= e($r['listing_title'] ?: 'Removed listing') ?></p><time><?= e(timeAgo($r['created_at'])) ?></time></div>
          <?= statusBadge($r['status']) ?>
        </div><?php endforeach; else: ?><div style="padding:20px;text-align:center;color:var(--muted);font-size:13px">No reports yet.</div><?php endif; ?>
      </div>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
