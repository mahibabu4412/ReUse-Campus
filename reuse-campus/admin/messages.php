<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
$admin = requireAdmin();
$rows = dbAll('SELECT m.*, u.full_name user_name FROM contact_messages m LEFT JOIN users u ON u.id=m.user_id ORDER BY m.created_at DESC LIMIT 100');
$unread = (int)dbOne('SELECT COUNT(*) c FROM contact_messages WHERE is_read=0')['c'];

$appTitle='Contact messages'; $active='messages'; $isAdminLayout=true;
require_once __DIR__ . '/../includes/app_header.php';
?>
<div class="panel">
  <div class="panel-head"><div><h2>Contact messages <?php if($unread): ?><span class="badge badge-pending"><?= $unread ?> unread</span><?php endif; ?></h2><div class="sub">Messages submitted through the public contact form.</div></div></div>
  <div class="panel-body">
    <?php if ($rows): foreach ($rows as $m): ?>
      <div class="req-card" style="align-items:flex-start;<?= $m['is_read']?'':'background:var(--green-50)' ?>">
        <span class="notif-icon"><?= icon('mail',18) ?></span>
        <div class="req-main">
          <h4><?= e($m['subject']) ?> <?= $m['is_read']?'':'<span class="badge badge-pending">New</span>' ?></h4>
          <p><b><?= e($m['name']) ?></b> &lt;<?= e($m['email']) ?>&gt; · <?= e(timeAgo($m['created_at'])) ?><?= $m['user_name']?' · Student: '.e($m['user_name']):'' ?></p>
          <div class="req-msg"><?= nl2br_e($m['message']) ?></div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <form method="post" action="<?= url('api/admin_action.php') ?>"><?= csrf_field() ?><input type="hidden" name="back" value="admin/messages.php"><input type="hidden" name="id" value="<?= (int)$m['id'] ?>"><button class="btn btn-sm btn-outline" name="action" value="<?= $m['is_read']?'message_unread':'message_read' ?>"><?= $m['is_read']?'Mark unread':'Mark read' ?></button></form>
            <form method="post" action="<?= url('api/admin_action.php') ?>" onsubmit="return confirm('Delete this message?')"><?= csrf_field() ?><input type="hidden" name="back" value="admin/messages.php"><input type="hidden" name="id" value="<?= (int)$m['id'] ?>"><button class="btn btn-sm btn-ghost" name="action" value="message_delete"><?= icon('trash',14) ?> Delete</button></form>
          </div>
        </div>
      </div>
    <?php endforeach; else: ?>
      <?= emptyState('No messages yet','Contact form submissions will appear here.') ?>
    <?php endif; ?>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
