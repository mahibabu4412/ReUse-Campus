<?php
require_once __DIR__ . '/../includes/auth.php';
$admin = requireAdmin();
$rows = dbAll('SELECT c.*, (SELECT COUNT(*) FROM listings l WHERE l.category_id=c.id) listing_count FROM categories c ORDER BY c.name');

$appTitle='Category management'; $active='categories'; $isAdminLayout=true;
require_once __DIR__ . '/../includes/app_header.php';
?>
<div class="two-col">
  <div class="panel">
    <div class="panel-head"><div><h2>Categories <span class="badge"><?= count($rows) ?></span></h2><div class="sub">Organise how resources are discovered.</div></div></div>
    <div class="panel-body flush"><div class="table-wrap"><table class="data">
      <thead><tr><th>Name</th><th>Slug</th><th>Items</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
      <?php foreach ($rows as $c): ?>
        <tr>
          <td><div style="display:flex;align-items:center;gap:9px"><span class="cat-icon" style="width:32px;height:32px;border-radius:8px;background:var(--green-100);color:var(--green-700);display:grid;place-items:center"><?= icon($c['icon'] ?: 'layers',16) ?></span><span class="table-title"><?= e($c['name']) ?></span></div></td>
          <td class="table-sub"><?= e($c['slug']) ?></td>
          <td><?= (int)$c['listing_count'] ?></td>
          <td><?= statusBadge($c['status']) ?></td>
          <td><div class="cell-actions">
            <button class="icon-btn edit-cat" title="Edit" data-id="<?= (int)$c['id'] ?>" data-name="<?= e($c['name']) ?>" data-slug="<?= e($c['slug']) ?>" data-desc="<?= e($c['description']) ?>" data-icon="<?= e($c['icon']) ?>" data-status="<?= e($c['status']) ?>"><?= icon('edit-3',15) ?></button>
            <form method="post" action="<?= url('api/admin_action.php') ?>" onsubmit="return confirm('Delete this category?')"><?= csrf_field() ?><input type="hidden" name="back" value="admin/categories.php"><input type="hidden" name="id" value="<?= (int)$c['id'] ?>"><button class="icon-btn danger" title="Delete" name="action" value="delete_category"><?= icon('trash',15) ?></button></form>
          </div></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table></div></div>
  </div>

  <div>
    <div class="panel">
      <div class="panel-head"><h2>Add category</h2></div>
      <div class="panel-body">
        <form method="post" action="<?= url('api/admin_action.php') ?>">
          <?= csrf_field() ?><input type="hidden" name="back" value="admin/categories.php"><input type="hidden" name="action" value="add_category">
          <div class="form-group"><label>Name</label><input class="input" name="name" required maxlength="100" placeholder="e.g. Robotics Kits"></div>
          <div class="form-group"><label>Slug</label><input class="input" name="slug" required maxlength="120" placeholder="robotics-kits"></div>
          <div class="form-group"><label>Description</label><input class="input" name="description" maxlength="255"></div>
          <div class="form-group"><label>Icon name</label><input class="input" name="icon" value="layers" placeholder="e.g. cpu, book, layers"></div>
          <button class="btn btn-primary btn-block" type="submit"><?= icon('plus',16) ?> Add category</button>
        </form>
      </div>
    </div>
    <div class="panel">
      <div class="panel-body" style="font-size:12.5px;color:var(--muted)">
        <?= icon('info',15) ?> Categories in use cannot be deleted. Set them to <b>Inactive</b> to hide them from the public category browser instead.
      </div>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="editCatModal">
  <div class="modal">
    <h2>Edit category</h2>
    <form method="post" action="<?= url('api/admin_action.php') ?>">
      <?= csrf_field() ?><input type="hidden" name="back" value="admin/categories.php"><input type="hidden" name="action" value="edit_category"><input type="hidden" name="id" id="ecId">
      <div class="form-group"><label>Name</label><input class="input" name="name" id="ecName" required></div>
      <div class="form-group"><label>Slug</label><input class="input" name="slug" id="ecSlug" required></div>
      <div class="form-group"><label>Description</label><input class="input" name="description" id="ecDesc"></div>
      <div class="form-row"><div class="form-group"><label>Icon</label><input class="input" name="icon" id="ecIcon"></div>
        <div class="form-group"><label>Status</label><select class="select" name="status" id="ecStatus"><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>
      <div class="modal-actions"><button class="btn btn-outline" type="button" id="ecCancel">Cancel</button><button class="btn btn-primary" type="submit">Save</button></div>
    </form>
  </div>
</div>
<script>
const m=document.getElementById('editCatModal');
document.querySelectorAll('.edit-cat').forEach(b=>b.addEventListener('click',()=>{
  document.getElementById('ecId').value=b.dataset.id;
  document.getElementById('ecName').value=b.dataset.name;
  document.getElementById('ecSlug').value=b.dataset.slug;
  document.getElementById('ecDesc').value=b.dataset.desc;
  document.getElementById('ecIcon').value=b.dataset.icon;
  document.getElementById('ecStatus').value=b.dataset.status;
  m.classList.add('show');
}));
document.getElementById('ecCancel').addEventListener('click',()=>m.classList.remove('show'));
m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')});
</script>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
