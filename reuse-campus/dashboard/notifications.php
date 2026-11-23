<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
requireLogin();
$uid = (int)authUser()['id'];
$rows = dbAll('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100', [$uid]);
$unread = notificationCount($uid);

$appTitle = 'Notifications';
$active = 'notifications';
require_once __DIR__ . '/../includes/app_header.php';
?>
<div class="panel">
  <div class="panel-head"><div><h2>Notifications <?php if ($unread): ?><span class="badge badge-pending"><?= $unread ?> unread</span><?php endif; ?></h2>
    <div class="sub">Updates about your requests, listings and exchanges.</div></div>
    <?php if ($unread): ?>
      <form method="post" action="<?= url('api/mark_read.php') ?>"><?= csrf_field() ?><button class="btn btn-outline btn-sm" type="submit"><?= icon('check',15) ?> Mark all read</button></form>
    <?php endif; ?>
  </div>
  <div class="panel-body flush">
    <?php if ($rows): foreach ($rows as $n): ?>
      <div class="notif-item <?= $n['is_read']?'':'unread' ?>">
        <span class="notif-icon"><?= icon($n['type']==='request'?'repeat':($n['type']==='exchange'?'check-circle':($n['type']==='report'?'flag':'bell')),18) ?></span>
        <div><b><?= e($n['title']) ?></b><p><?= e($n['message']) ?></p><time><?= e(timeAgo($n['created_at'])) ?></time>
          <?php if ($n['link']): ?><a href="<?= url($n['link']) ?>" style="font-size:12px;font-weight:600">Open →</a><?php endif; ?></div>
        <?php if (!$n['is_read']): ?><span class="unread-dot"></span><?php endif; ?>
      </div>
    <?php endforeach; else: ?>
      <?= emptyState("You're all caught up", 'Notifications about your activity will show up here.') ?>
    <?php endif; ?>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
