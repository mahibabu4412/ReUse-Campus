<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/icons.php';
requireLogin();
$user = authUser();
$categories = getCategories();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $title = clean($_POST['title'] ?? '');
    $description = trim(strip_tags($_POST['description'] ?? ''));
    $cat = (int)($_POST['category_id'] ?? 0);
    $condition = clean($_POST['item_condition'] ?? '');
    $type = clean($_POST['exchange_type'] ?? '');
    $price = (float)($_POST['price'] ?? 0);
    $availability = clean($_POST['availability'] ?? 'available');
    $pickup = clean($_POST['pickup_location'] ?? '');

    setOld([
        'title' => $title, 'description' => $description, 'category_id' => $cat,
        'item_condition' => $condition, 'exchange_type' => $type, 'price' => $price,
        'availability' => $availability, 'pickup_location' => $pickup
    ]);

    if (mb_strlen($title) < 5 || mb_strlen($title) > 180) $errors[] = 'Title must be 5–180 characters.';
    if (mb_strlen($description) < 20 || mb_strlen($description) > 5000) $errors[] = 'Description must be at least 20 characters.';
    if (!getCategory($cat)) $errors[] = 'Choose a valid category.';
    if (!in_array($condition, ['new','like_new','good','fair'], true)) $errors[] = 'Choose a valid condition.';
    if (!in_array($type, ['donation','borrow','exchange','sale'], true)) $errors[] = 'Choose a valid exchange type.';
    if ($type === 'sale' && $price < 0) $errors[] = 'Price cannot be negative.';
    if (!in_array($availability, ['available','reserved'], true)) $errors[] = 'Choose a valid availability.';
    if (mb_strlen($pickup) > 190) $errors[] = 'Pickup location is too long.';

    if (!$errors) {
        $paths = uploadMultipleImages($_FILES['images'] ?? null, 'listings', 5);
        if (!$paths) {
            $errors[] = 'Add at least one valid image (JPG, PNG, GIF or WEBP, max 5 MB each).';
        } else {
            db('INSERT INTO listings (user_id,category_id,title,description,item_condition,exchange_type,price,availability,pickup_location,status)
                VALUES (?,?,?,?,?,?,?,?,?,"active")',
               [$user['id'],$cat,$title,$description,$condition,$type,($type==='sale'?$price:0),$availability,$pickup]);
            $lid = dbId();
            foreach ($paths as $i => $path) {
                db('INSERT INTO listing_images (listing_id,filename,is_primary) VALUES (?,?,?)', [$lid,$path,$i===0?1:0]);
            }
            clearOld();
            setFlash('success','Your listing is live. Students can now discover it.');
            redirect('dashboard/listings.php');
        }
    }
}

$appTitle = 'List an item';
$active = 'create';
require_once __DIR__ . '/../includes/app_header.php';
?>

<div class="panel" style="max-width:860px;margin:0 auto">
  <div class="panel-head"><div><h2>Create a new listing</h2><div class="sub">Give your item a clear title, honest description and good photos.</div></div></div>
  <div class="panel-body">
    <?php if ($errors): ?>
      <div class="alert alert-error" style="position:static;width:auto;margin-bottom:18px;box-shadow:none"><?= icon('alert-circle',18) ?><div><?php foreach ($errors as $err) echo '• '.e($err).'<br>'; ?></div></div>
    <?php endif; ?>
    <form method="post" enctype="multipart/form-data" action="">
      <?= csrf_field() ?>
      <div class="form-group"><label>Item name</label><input class="input" name="title" required maxlength="180" value="<?= old('title') ?>" placeholder="e.g. Engineering Mathematics textbook"></div>
      <div class="form-group"><label>Description</label><textarea class="textarea" name="description" required minlength="20" maxlength="5000" placeholder="Describe the item, its condition and any important details..."><?= old('description') ?></textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Category</label><select class="select" name="category_id" required>
          <option value="">Select category</option>
          <?php foreach ($categories as $c): ?><option value="<?= (int)$c['id'] ?>" <?= old('category_id')==$c['id']?'selected':'' ?>><?= e($c['name']) ?></option><?php endforeach; ?>
        </select></div>
        <div class="form-group"><label>Item condition</label><select class="select" name="item_condition" required>
          <?php foreach (['new'=>'Brand new','like_new'=>'Like new','good'=>'Good','fair'=>'Fair'] as $k=>$v): ?><option value="<?= $k ?>" <?= old('item_condition')===$k?'selected':'' ?>><?= $v ?></option><?php endforeach; ?>
        </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Exchange type</label><select class="select" name="exchange_type" id="exchangeType" required>
          <?php foreach (['donation'=>'Free donation','borrow'=>'Borrow','exchange'=>'Exchange','sale'=>'Sale'] as $k=>$v): ?><option value="<?= $k ?>" <?= old('exchange_type')===$k?'selected':'' ?>><?= $v ?></option><?php endforeach; ?>
        </select></div>
        <div class="form-group"><label>Asking price (BDT)</label><input class="input" type="number" name="price" min="0" step="0.01" value="<?= old('price','0') ?>" id="priceField"><div class="hint">Only used for “Sale” listings.</div></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Availability</label><select class="select" name="availability">
          <option value="available" <?= old('availability')==='available'?'selected':'' ?>>Available</option>
          <option value="reserved" <?= old('availability')==='reserved'?'selected':'' ?>>Reserved</option>
        </select></div>
        <div class="form-group"><label>Pickup location</label><input class="input" name="pickup_location" maxlength="190" value="<?= old('pickup_location') ?>" placeholder="e.g. Library Gate, Main Campus"></div>
      </div>
      <div class="form-group"><label>Photos <span style="font-weight:400;color:var(--muted)">(up to 5)</span></label>
        <label class="upload-zone" for="images"><?= icon('camera',26) ?> Click to choose images<br><span style="font-size:11.5px">JPG, PNG, GIF or WEBP · max 5 MB each</span></label>
        <input type="file" id="images" name="images[]" accept="image/*" multiple hidden>
        <div class="preview-grid" id="previewGrid"></div>
      </div>
      <button class="btn btn-primary btn-lg" type="submit"><?= icon('plus',17) ?> Publish listing</button>
      <a href="<?= url('dashboard/listings.php') ?>" class="btn btn-ghost">Cancel</a>
    </form>
  </div>
</div>

<script>
document.getElementById('images').addEventListener('change', function(){
  const grid = document.getElementById('previewGrid'); grid.innerHTML='';
  Array.from(this.files).slice(0,5).forEach(f=>{
    const d=document.createElement('div'); d.className='prev';
    d.innerHTML='<img src="'+URL.createObjectURL(f)+'" alt="preview">'; grid.appendChild(d);
  });
});
const et=document.getElementById('exchangeType'), pf=document.getElementById('priceField');
function togglePrice(){ pf.disabled = et.value!=='sale'; pf.style.opacity = et.value==='sale'?1:.5; }
et.addEventListener('change',togglePrice); togglePrice();
</script>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
