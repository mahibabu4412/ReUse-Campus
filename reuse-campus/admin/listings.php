<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/components.php';
$admin = requireAdmin();
$q = clean($_GET['q'] ?? '');
$status = clean($_GET['status'] ?? 'all');
$page = max(1,(int)($_GET['page'] ?? 1)); $per=15;

$where=['1=1']; $params=[];
if ($q!==''){ $where[]='(l.title LIKE ? OR l.description LIKE ?)'; $l='%'.$q.'%'; $params=[$l,$l]; }
if (in_array($status,['active','pending','removed','sold'],true)){ $where[]='l.status=?'; $params[]=$status; }
$w=implode(' AND ',$where);
$total=(int)dbOne('SELECT COUNT(*) c FROM listings l WHERE '.$w,$params)['c'];
$p=paginate($total,$per,$page);
$rows=dbAll('SELECT l.*, u.full_name owner_name, c.name category_name,
  (SELECT filename FROM listing_images li WHERE li.listing_id=l.id ORDER BY li.is_primary DESC,li.id ASC LIMIT 1) image
  FROM listings l JOIN users u ON u.id=l.user_id JOIN categories c ON c.id=l.category_id
  WHERE '.$w.' ORDER BY l.created_at DESC LIMIT '.$per.' OFFSET '.$p['offset'],$params);

$appTitle='Listing moderation'; $active='listings'; $isAdminLayout=true;
require_once __DIR__ . '/../includes/app_header.php';
?>
<div class="panel">
  <div class="panel-head"><div><h2>Listing moderation <span class="badge"><?= $total ?></span></h2><div class="sub">Approve, remove or review resources posted by students.</div></div></div>
  <div class="panel-body flush">
    <form class="toolbar" style="padding:16px 18px;margin:0" method="get" action="<?= url('admin/listings.php') ?>">
      <div style="flex:1;min-width:200px;position:relative"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);display:flex"><?= icon('search',16) ?></span>
        <input class="input" style="padding-left:38px" name="q" value="<?= e($q) ?>" placeholder="Search listings..."></div>
      <select class="select" name="status">
        <?php foreach (['all'=>'All','pending'=>'Pending review','active'=>'Active','removed'=>'Removed','sold'=>'Completed'] as $k=>$v): ?><option value="<?= $k ?>" <?= $status===$k?'selected':'' ?>><?= $v ?></option><?php endforeach; ?>
      </select>
      <button class="btn btn-primary btn-sm" type="submit">Search</button>
    </form>
    <?php if ($rows): ?>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Item</th><th>Owner</th><th>Category</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
        <?php foreach ($rows as $l): ?>
          <tr>
            <td><div style="display:flex;gap:10px;align-items:center"><img src="<?= e(imageUrl($l['image'])) ?>" alt="" style="width:50px;height:44px;object-fit:cover;border-radius:8px">
              <div><a class="table-title" href="<?= url('listing.php?id='.$l['id']) ?>"><?= e($l['title']) ?></a><div class="table-sub"><?= e(timeAgo($l['created_at'])) ?></div></div></div></td>
            <td class="table-sub"><?= e($l['owner_name']) ?></td>
            <td class="table-sub"><?= e($l['category_name']) ?></td>
            <td><span class="badge badge-<?= e($l['exchange_type']) ?>"><?= e(exchangeLabel($l['exchange_type'])) ?></span></td>
            <td><?= statusBadge($l['status']) ?></td>
            <td><div class="cell-actions">
              <a href="<?= url('listing.php?id='.$l['id']) ?>" class="icon-btn" title="View"><?= icon('eye',15) ?></a>
              <?php if ($l['status']!=='active'): ?>
              <form method="post" action="<?= url('api/admin_action.php') ?>"><?= csrf_field() ?><input type="hidden" name="back" value="admin/listings.php"><input type="hidden" name="id" value="<?= (int)$l['id'] ?>"><button class="icon-btn" title="Approve" name="action" value="approve_listing"><?= icon('check',15) ?></button></form>
              <?php endif; ?>
              <?php if ($l['status']!=='removed'): ?>
              <form method="post" action="<?= url('api/admin_action.php') ?>" onsubmit="return confirm('Remove this listing?')"><?= csrf_field() ?><input type="hidden" name="back" value="admin/listings.php"><input type="hidden" name="id" value="<?= (int)$l['id'] ?>"><button class="icon-btn danger" title="Remove" name="action" value="remove_listing"><?= icon('trash',15) ?></button></form>
              <?php endif; ?>
            </div></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table></div>
      <div style="padding:0 18px 18px"><?= pagination($p,['q'=>$q,'status'=>$status]) ?></div>
    <?php else: ?><?= emptyState('No listings found','Try a different filter or search.') ?><?php endif; ?>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
