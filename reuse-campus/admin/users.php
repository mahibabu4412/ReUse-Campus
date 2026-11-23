<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
$admin = requireAdmin();
$q = clean($_GET['q'] ?? '');
$status = clean($_GET['status'] ?? 'all');
$page = max(1,(int)($_GET['page'] ?? 1));
$per = 15;

$where=['1=1']; $params=[];
if ($q!==''){ $where[]='(full_name LIKE ? OR email LIKE ? OR student_id LIKE ?)'; $l='%'.$q.'%'; $params=[$l,$l,$l]; }
if (in_array($status,['active','suspended'],true)){ $where[]='status=?'; $params[]=$status; }
$w=implode(' AND ',$where);
$total=(int)dbOne('SELECT COUNT(*) c FROM users WHERE '.$w,$params)['c'];
$p=paginate($total,$per,$page);
$rows=dbAll('SELECT * FROM users WHERE '.$w.' ORDER BY created_at DESC LIMIT '.$per.' OFFSET '.$p['offset'],$params);

$appTitle='Student management';
$active='users'; $isAdminLayout=true;
require_once __DIR__ . '/../includes/app_header.php';
?>
<div class="panel">
  <div class="panel-head"><div><h2>Students <span class="badge"><?= $total ?></span></h2><div class="sub">Manage registered student accounts.</div></div></div>
  <div class="panel-body flush">
    <form class="toolbar" style="padding:16px 18px;margin:0" method="get" action="<?= url('admin/users.php') ?>">
      <div style="flex:1;min-width:200px;position:relative"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);display:flex"><?= icon('search',16) ?></span>
        <input class="input" style="padding-left:38px" name="q" value="<?= e($q) ?>" placeholder="Search name, email or student ID..."></div>
      <select class="select" name="status"><option value="all">All statuses</option><option value="active" <?= $status==='active'?'selected':'' ?>>Active</option><option value="suspended" <?= $status==='suspended'?'selected':'' ?>>Suspended</option></select>
      <button class="btn btn-primary btn-sm" type="submit">Search</button>
    </form>
    <?php if ($rows): ?>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Student</th><th>Student ID</th><th>College / Department</th><th>Verified</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
        <tbody>
        <?php foreach ($rows as $u): ?>
          <tr>
            <td><div style="display:flex;align-items:center;gap:10px"><span class="avatar" style="width:34px;height:34px;font-size:11px"><?= e(initials($u['full_name'])) ?></span>
              <div><div class="table-title"><?= e($u['full_name']) ?></div><div class="table-sub"><?= e($u['email']) ?></div></div></div></td>
            <td class="table-sub"><?= e($u['student_id']) ?></td>
            <td><div class="table-sub"><?= e($u['college']) ?></div><div class="table-sub"><?= e($u['department']) ?></div></td>
            <td><?= $u['email_verified'] ? '<span class="badge badge-completed">Verified</span>' : '<span class="badge badge-pending">Pending</span>' ?></td>
            <td><?= statusBadge($u['status']) ?></td>
            <td class="table-sub"><?= e(date('d M Y',strtotime($u['created_at']))) ?></td>
            <td>
              <form method="post" action="<?= url('api/admin_action.php') ?>" onsubmit="return confirm('Change account status?')">
                <?= csrf_field() ?><input type="hidden" name="back" value="admin/users.php?<?= e(http_build_query(array_filter(['q'=>$q,'status'=>$status,'page'=>$page]))) ?>">
                <input type="hidden" name="id" value="<?= (int)$u['id'] ?>">
                <button class="btn btn-sm <?= $u['status']==='active'?'btn-danger':'btn-soft' ?>" type="submit" name="action" value="<?= $u['status']==='active'?'suspend_user':'activate_user' ?>">
                  <?= $u['status']==='active'?'Suspend':'Activate' ?></button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table></div>
      <div style="padding:0 18px 18px"><?= pagination($p, ['q'=>$q,'status'=>$status]) ?></div>
    <?php else: ?>
      <?= emptyState('No students found','Try a different search term.') ?>
    <?php endif; ?>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
