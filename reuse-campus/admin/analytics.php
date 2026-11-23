<?php
require_once __DIR__ . '/../includes/auth.php';
$admin = requireAdmin();

$months=[];
for($i=11;$i>=0;$i--){$m=date('Y-m',strtotime("-$i months")); $months[$m]=['label'=>date('M',strtotime($m.'-01')),'users'=>0,'listings'=>0,'requests'=>0,'exchanges'=>0];}
foreach (dbAll('SELECT DATE_FORMAT(created_at,"%Y-%m") m,COUNT(*) c FROM users WHERE created_at>=DATE_SUB(NOW(),INTERVAL 12 MONTH) GROUP BY m') as $r) if(isset($months[$r['m']])) $months[$r['m']]['users']=(int)$r['c'];
foreach (dbAll('SELECT DATE_FORMAT(created_at,"%Y-%m") m,COUNT(*) c FROM listings WHERE created_at>=DATE_SUB(NOW(),INTERVAL 12 MONTH) GROUP BY m') as $r) if(isset($months[$r['m']])) $months[$r['m']]['listings']=(int)$r['c'];
foreach (dbAll('SELECT DATE_FORMAT(created_at,"%Y-%m") m,COUNT(*) c FROM item_requests WHERE created_at>=DATE_SUB(NOW(),INTERVAL 12 MONTH) GROUP BY m') as $r) if(isset($months[$r['m']])) $months[$r['m']]['requests']=(int)$r['c'];
foreach (dbAll('SELECT DATE_FORMAT(completed_at,"%Y-%m") m,COUNT(*) c FROM exchange_history WHERE completed_at>=DATE_SUB(NOW(),INTERVAL 12 MONTH) GROUP BY m') as $r) if(isset($months[$r['m']])) $months[$r['m']]['exchanges']=(int)$r['c'];
$max=1; foreach($months as $s) $max=max($max,$s['users'],$s['listings'],$s['requests']);

$topCats = dbAll('SELECT c.name,COUNT(*) c FROM listings l JOIN categories c ON c.id=l.category_id WHERE l.status="active" GROUP BY c.id ORDER BY c DESC LIMIT 6');
$topColleges = dbAll('SELECT college,COUNT(*) c FROM users WHERE college IS NOT NULL GROUP BY college ORDER BY c DESC LIMIT 6');
$reqStatus = dbAll('SELECT status,COUNT(*) c FROM item_requests GROUP BY status');
$totalReq = array_sum(array_column($reqStatus,'c')) ?: 1;

$appTitle='Platform analytics'; $active='analytics'; $isAdminLayout=true;
require_once __DIR__ . '/../includes/app_header.php';
?>
<div class="stat-cards">
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('users',20) ?></span></div><div class="num"><?= (int)dbOne('SELECT COUNT(*) c FROM users')['c'] ?></div><div class="label">Total students</div></div>
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('package',20) ?></span></div><div class="num"><?= (int)dbOne('SELECT COUNT(*) c FROM listings')['c'] ?></div><div class="label">All listings</div></div>
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('send',20) ?></span></div><div class="num"><?= (int)dbOne('SELECT COUNT(*) c FROM item_requests')['c'] ?></div><div class="label">Total requests</div></div>
  <div class="stat-card"><div class="sc-top"><span class="sc-icon"><?= icon('check-circle',20) ?></span></div><div class="num"><?= (int)dbOne('SELECT COUNT(*) c FROM exchange_history')['c'] ?></div><div class="label">Exchanges completed</div></div>
</div>

<div class="panel">
  <div class="panel-head"><h2>Platform growth</h2><span class="sub">Last 12 months · live database data</span></div>
  <div class="panel-body">
    <div class="chart" style="height:200px;gap:5px">
      <?php foreach ($months as $s): ?>
        <div class="bar-group" style="gap:3px">
          <div style="display:flex;gap:2px;align-items:flex-end;height:160px;justify-content:center;width:100%">
            <div class="bar" style="height:<?= max(2,round($s['users']/$max*145)) ?>px;background:#8ed5b4" title="Students: <?= $s['users'] ?>"></div>
            <div class="bar" style="height:<?= max(2,round($s['listings']/$max*145)) ?>px;background:#1f9d6b" title="Listings: <?= $s['listings'] ?>"></div>
            <div class="bar" style="height:<?= max(2,round($s['requests']/$max*145)) ?>px;background:#0d6046" title="Requests: <?= $s['requests'] ?>"></div>
          </div>
          <span class="bar-label" style="font-size:9px"><?= $s['label'] ?></span>
        </div>
      <?php endforeach; ?>
    </div>
    <div style="display:flex;gap:16px;justify-content:center;margin-top:14px;font-size:11.5px;color:var(--muted)">
      <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#8ed5b4"></i> Students</span>
      <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#1f9d6b"></i> Listings</span>
      <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#0d6046"></i> Requests</span>
    </div>
  </div>
</div>

<div class="two-col">
  <div class="panel">
    <div class="panel-head"><h2>Top categories</h2></div>
    <div class="panel-body">
      <?php foreach ($topCats as $c): $pct=round($c['c']/max(1,array_sum(array_column($topCats,'c')))*100); ?>
        <div style="margin-bottom:13px"><div style="display:flex;justify-content:space-between;font-size:12.5px"><b><?= e($c['name']) ?></b><span style="color:var(--muted)"><?= (int)$c['c'] ?></span></div>
        <div style="height:7px;background:var(--green-50);border-radius:100px;overflow:hidden"><div style="height:100%;width:<?= $pct ?>%;background:var(--green-600);border-radius:100px"></div></div></div>
      <?php endforeach; ?>
    </div>
  </div>
  <div class="panel">
    <div class="panel-head"><h2>Request status breakdown</h2></div>
    <div class="panel-body">
      <?php foreach ($reqStatus as $s): $pct=round($s['c']/$totalReq*100); ?>
        <div style="margin-bottom:13px"><div style="display:flex;justify-content:space-between;font-size:12.5px"><b><?= e(ucfirst($s['status'])) ?></b><span style="color:var(--muted)"><?= (int)$s['c'] ?> (<?= $pct ?>%)</span></div>
        <div style="height:7px;background:var(--green-50);border-radius:100px;overflow:hidden"><div style="height:100%;width:<?= $pct ?>%;background:var(--green-600);border-radius:100px"></div></div></div>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<div class="panel">
  <div class="panel-head"><h2>Campus reach</h2><span class="sub">Students by college</span></div>
  <div class="panel-body flush"><div class="table-wrap"><table class="data">
    <thead><tr><th>College</th><th>Students</th><th>Share</th></tr></thead><tbody>
    <?php $totalUsers=(int)dbOne('SELECT COUNT(*) c FROM users')['c'] ?: 1; foreach ($topColleges as $c): ?>
      <tr><td class="table-title"><?= e($c['college']) ?></td><td><?= (int)$c['c'] ?></td><td><?= round($c['c']/$totalUsers*100) ?>%</td></tr>
    <?php endforeach; ?>
    </tbody></table></div></div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
