<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
$admin = requireAdmin();
$status = clean($_GET['status'] ?? 'pending');
if (!in_array($status,['pending','reviewed','resolved','dismissed','all'],true)) $status='pending';
$where = $status==='all' ? '1=1' : 'r.status=?';
$params = $status==='all' ? [] : [$status];
$rows = dbAll("SELECT r.*, u.full_name reporter_name, ru.full_name reported_name,
  l.title listing_title FROM reports r JOIN users u ON u.id=r.reporter_id
  LEFT JOIN users ru ON ru.id=r.reported_user_id LEFT JOIN listings l ON l.id=r.listing_id
  WHERE $where ORDER BY r.created_at DESC", $params);
$counts=[]; foreach (dbAll('SELECT status,COUNT(*) c FROM reports GROUP BY status') as $c) $counts[$c['status']]=(int)$c['c'];

$appTitle='Report management'; $active='reports'; $isAdminLayout=true;
require_once __DIR__ . '/../includes/app_header.php';
?>
<div class="panel">
  <div class="panel-head"><div><h2>User reports <span class="badge badge-pending"><?= $counts['pending'] ?? 0 ?> pending</span></h2><div class="sub">Review and resolve reports submitted by students.</div></div></div>
  <div class="panel-body flush">
    <div class="tabs" style="padding:0 16px">
      <?php foreach (['pending','reviewed','resolved','dismissed','all'] as $s): ?><a href="<?= url('admin/reports.php?status='.$s) ?>" class="<?= $status===$s?'active':'' ?>"><?= ucfirst($s) ?><?= isset($counts[$s]) && $s!=='all' ? ' <span class="count">'.$counts[$s].'</span>' : '' ?></a><?php endforeach; ?>
    </div>
    <div style="padding:6px 20px 20px">
      <?php if ($rows): foreach ($rows as $r): ?>
        <div class="req-card" style="align-items:flex-start">
          <span class="notif-icon"><?= icon('flag',18) ?></span>
          <div class="req-main">
            <h4><?= e(ucfirst($r['reason'])) ?> <?= statusBadge($r['status']) ?></h4>
            <p>Reported by <b><?= e($r['reporter_name']) ?></b> · <?= e(timeAgo($r['created_at'])) ?></p>
            <p>Listing: <?= $r['listing_title'] ? '<a href="'.url('listing.php?id='.$r['listing_id']).'">'.e($r['listing_title']).'</a>' : '<i>removed</i>' ?> · User: <?= e($r['reported_name'] ?: '—') ?></p>
            <?php if ($r['details']): ?><div class="req-msg">“<?= e($r['details']) ?>”</div><?php endif; ?>
            <?php if ($r['admin_note']): ?><div class="match-note" style="margin-top:8px">Admin note: <?= e($r['admin_note']) ?></div><?php endif; ?>
            <?php if ($r['status']==='pending'): ?>
              <form method="post" action="<?= url('api/admin_action.php') ?>" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
                <?= csrf_field() ?><input type="hidden" name="back" value="admin/reports.php?status=<?= e($status) ?>"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
                <input class="input" name="admin_note" placeholder="Admin note (optional)" style="width:220px">
                <button class="btn btn-primary btn-sm" name="action" value="resolve_report">Resolve</button>
                <button class="btn btn-outline btn-sm" name="action" value="review_report">Mark reviewed</button>
                <button class="btn btn-ghost btn-sm" name="action" value="dismiss_report">Dismiss</button>
              </form>
            <?php endif; ?>
          </div>
        </div>
      <?php endforeach; else: ?>
        <?= emptyState('No reports here', 'Reports from students will appear in this queue.') ?>
      <?php endif; ?>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
