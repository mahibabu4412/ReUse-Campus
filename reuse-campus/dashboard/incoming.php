<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
requireLogin();
$user = authUser();
$uid = (int)$user['id'];
$status = clean($_GET['status'] ?? 'pending');
$allowed = ['pending','accepted','completed','rejected','cancelled','all'];
if (!in_array($status,$allowed,true)) $status='pending';

$where = 'r.owner_id = ?'; $params=[$uid];
if ($status!=='all') { $where .= ' AND r.status = ?'; $params[]=$status; }
$rows = dbAll("SELECT r.*, l.title AS listing_title, l.exchange_type,
                      (SELECT filename FROM listing_images li WHERE li.listing_id=l.id ORDER BY li.is_primary DESC,li.id ASC LIMIT 1) AS image,
                      req.full_name AS requester_name, req.college AS requester_college,
                      (SELECT COUNT(*) FROM item_requests x WHERE x.requester_id=r.requester_id AND x.status='completed') AS their_completed
               FROM item_requests r JOIN listings l ON l.id=r.listing_id JOIN users req ON req.id=r.requester_id
               WHERE $where ORDER BY r.created_at DESC", $params);
$pending = (int)dbOne('SELECT COUNT(*) c FROM item_requests WHERE owner_id=? AND status="pending"',[$uid])['c'];

$appTitle = 'Incoming requests';
$active = 'incoming';
require_once __DIR__ . '/../includes/app_header.php';
?>

<div class="panel">
  <div class="panel-head"><div><h2>Incoming requests <?php if ($pending): ?><span class="badge badge-pending"><?= $pending ?> new</span><?php endif; ?></h2>
    <div class="sub">Requests from students interested in your listings.</div></div></div>
  <div class="panel-body flush">
    <div class="tabs" style="padding:0 16px">
      <?php foreach ($allowed as $s): ?><a href="<?= url('dashboard/incoming.php?status='.$s) ?>" class="<?= $status===$s?'active':'' ?>"><?= $s==='all'?'All':ucfirst($s) ?></a><?php endforeach; ?>
    </div>
    <div style="padding:4px 20px 20px">
      <?php if ($rows): foreach ($rows as $r): ?>
        <div class="req-card">
          <img src="<?= e(imageUrl($r['image'])) ?>" alt="" style="width:62px;height:58px;object-fit:cover;border-radius:9px;flex:none">
          <div class="req-main">
            <h4><a href="<?= url('listing.php?id='.$r['listing_id']) ?>"><?= e($r['listing_title']) ?></a> <?= statusBadge($r['status']) ?></h4>
            <p>From <b><?= e($r['requester_name']) ?></b> · <?= e($r['requester_college'] ?: 'Student') ?> · <?= (int)$r['their_completed'] ?> completed exchanges</p>
            <?php if ($r['message']): ?><div class="req-msg">“<?= e($r['message']) ?>”</div><?php endif; ?>
            <?php if ($r['expected_return_date']): ?><p style="margin-top:8px"><?= icon('calendar',13) ?> Expected return: <?= e(date('d M Y',strtotime($r['expected_return_date']))) ?></p><?php endif; ?>
            <p style="margin-top:6px"><?= icon('clock',13) ?> <?= e(timeAgo($r['created_at'])) ?></p>
          </div>
          <div class="req-actions">
            <?php if ($r['status']==='pending'): ?>
              <form method="post" action="<?= url('api/request_action.php') ?>"><?= csrf_field() ?><input type="hidden" name="action" value="accept"><input type="hidden" name="request_id" value="<?= (int)$r['id'] ?>"><button class="btn btn-primary btn-sm" type="submit"><?= icon('check',14) ?> Accept</button></form>
              <form method="post" action="<?= url('api/request_action.php') ?>"><?= csrf_field() ?><input type="hidden" name="action" value="reject"><input type="hidden" name="request_id" value="<?= (int)$r['id'] ?>"><button class="btn btn-outline btn-sm" type="submit"><?= icon('x',14) ?> Reject</button></form>
            <?php elseif ($r['status']==='accepted'): ?>
              <form method="post" action="<?= url('api/request_action.php') ?>"><?= csrf_field() ?><input type="hidden" name="action" value="complete"><input type="hidden" name="request_id" value="<?= (int)$r['id'] ?>"><button class="btn btn-primary btn-sm" type="submit"><?= $r['exchange_type']==='borrow' ? icon('rotate-ccw',14).' Confirm return' : icon('check',14).' Mark complete' ?></button></form>
            <?php elseif ($r['status']==='completed'): ?>
              <span class="badge badge-completed">✓ Completed</span>
            <?php endif; ?>
          </div>
        </div>
      <?php endforeach; else: ?>
        <?= emptyState('No incoming requests', 'When students request your items, they will appear here.', 'Browse listings', url('explore.php')) ?>
      <?php endif; ?>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
