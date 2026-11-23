<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/icons.php';
requireLogin();
$user = authUser();
$id = (int)($_GET['id'] ?? 0);
$listing = getListing($id);
if (!$listing || (int)$listing['user_id'] !== (int)$user['id']) {
    setFlash('error','You cannot edit this listing.');
    redirect('dashboard/listings.php');
}
$images = getListingImages($id);
$categories = getCategories();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = clean($_POST['action'] ?? 'save');

    if ($action === 'delete_image') {
        $imgId = (int)($_POST['image_id'] ?? 0);
        $img = dbOne('SELECT * FROM listing_images WHERE id=? AND listing_id=?', [$imgId,$id]);
        if ($img && count($images) > 1) {
            $path = UPLOAD_DIR . str_replace('uploads/', '', $img['filename']);
            if (strpos($img['filename'], 'uploads/') === 0 && is_file($path)) @unlink($path);
            db('DELETE FROM listing_images WHERE id=?', [$imgId]);
            setFlash('success','Image removed.');
        } else {
            setFlash('error','A listing needs at least one image.');
        }
        redirect('listings/edit.php?id='.$id);
    }

    if ($action === 'delete_listing') {
        db('UPDATE listings SET status="removed" WHERE id=? AND user_id=?', [$id,$user['id']]);
        setFlash('success','Listing removed.');
        redirect('dashboard/listings.php');
    }

    $title = clean($_POST['title'] ?? '');
    $description = trim(strip_tags($_POST['description'] ?? ''));
    $cat = (int)($_POST['category_id'] ?? 0);
    $condition = clean($_POST['item_condition'] ?? '');
    $type = clean($_POST['exchange_type'] ?? '');
    $price = (float)($_POST['price'] ?? 0);
    $availability = clean($_POST['availability'] ?? 'available');
    $pickup = clean($_POST['pickup_location'] ?? '');

    if (mb_strlen($title) < 5 || mb_strlen($title) > 180) $errors[] = 'Title must be 5–180 characters.';
    if (mb_strlen($description) < 20) $errors[] = 'Description must be at least 20 characters.';
    if (!getCategory($cat)) $errors[] = 'Choose a valid category.';
    if (!in_array($condition, ['new','like_new','good','fair'], true)) $errors[] = 'Choose a valid condition.';
    if (!in_array($type, ['donation','borrow','exchange','sale'], true)) $errors[] = 'Choose a valid exchange type.';
    if (!in_array($availability, ['available','reserved','completed'], true)) $errors[] = 'Choose a valid availability.';

    if (!$errors) {
        db('UPDATE listings SET category_id=?,title=?,description=?,item_condition=?,exchange_type=?,price=?,availability=?,pickup_location=? WHERE id=? AND user_id=?',
           [$cat,$title,$description,$condition,$type,($type==='sale'?$price:0),$availability,$pickup,$id,$user['id']]);
        $new = uploadMultipleImages($_FILES['images'] ?? null, 'listings', 5);
        foreach ($new as $path) {
            db('INSERT INTO listing_images (listing_id,filename,is_primary) VALUES (?,?,0)', [$id,$path]);
        }
        setFlash('success','Listing updated.');
        redirect('listings/edit.php?id='.$id);
    }
    // repopulate from submitted values
    $listing = array_merge($listing, [
        'title'=>$title,'description'=>$description,'category_id'=>$cat,
        'item_condition'=>$condition,'exchange_type'=>$type,'price'=>$price,
        'availability'=>$availability,'pickup_location'=>$pickup
    ]);
}

$appTitle = 'Edit listing';
$active = 'listings';
require_once __DIR__ . '/../includes/app_header.php';
?>

<div class="panel" style="max-width:860px;margin:0 auto">
  <div class="panel-head"><div><h2>Edit listing</h2><div class="sub">Keep your listing accurate and up to date.</div></div>
    <a href="<?= url('listing.php?id='.$id) ?>" class="btn btn-outline btn-sm">View public page</a></div>
  <div class="panel-body">
    <?php if ($errors): ?><div class="alert alert-error" style="position:static;width:auto;margin-bottom:18px;box-shadow:none"><?= icon('alert-circle',18) ?><div><?php foreach ($errors as $err) echo '• '.e($err).'<br>'; ?></div></div><?php endif; ?>
    <div class="form-group" style="margin-bottom:20px"><label>Current images</label>
      <div class="preview-grid">
        <?php foreach ($images as $img): ?>
          <div class="prev"><img src="<?= e(imageUrl($img['filename'])) ?>" alt="">
            <form method="post" action="" onsubmit="return confirm('Remove this image?')">
              <?= csrf_field() ?><input type="hidden" name="action" value="delete_image"><input type="hidden" name="image_id" value="<?= (int)$img['id'] ?>">
              <button type="submit" title="Remove">×</button>
            </form>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

    <form method="post" enctype="multipart/form-data" action="">
      <?= csrf_field() ?>
      <div class="form-group"><label>Item name</label><input class="input" name="title" required maxlength="180" value="<?= e($listing['title']) ?>"></div>
      <div class="form-group"><label>Description</label><textarea class="textarea" name="description" required minlength="20"><?= e($listing['description']) ?></textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Category</label><select class="select" name="category_id" required>
          <?php foreach ($categories as $c): ?><option value="<?= (int)$c['id'] ?>" <?= $listing['category_id']==$c['id']?'selected':'' ?>><?= e($c['name']) ?></option><?php endforeach; ?>
        </select></div>
        <div class="form-group"><label>Condition</label><select class="select" name="item_condition">
          <?php foreach (['new'=>'Brand new','like_new'=>'Like new','good'=>'Good','fair'=>'Fair'] as $k=>$v): ?><option value="<?= $k ?>" <?= $listing['item_condition']===$k?'selected':'' ?>><?= $v ?></option><?php endforeach; ?>
        </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Exchange type</label><select class="select" name="exchange_type">
          <?php foreach (['donation'=>'Free donation','borrow'=>'Borrow','exchange'=>'Exchange','sale'=>'Sale'] as $k=>$v): ?><option value="<?= $k ?>" <?= $listing['exchange_type']===$k?'selected':'' ?>><?= $v ?></option><?php endforeach; ?>
        </select></div>
        <div class="form-group"><label>Price (BDT)</label><input class="input" type="number" name="price" min="0" step="0.01" value="<?= e($listing['price']) ?>"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Availability</label><select class="select" name="availability">
          <?php foreach (['available','reserved','completed'] as $a): ?><option value="<?= $a ?>" <?= $listing['availability']===$a?'selected':'' ?>><?= ucfirst($a) ?></option><?php endforeach; ?>
        </select></div>
        <div class="form-group"><label>Pickup location</label><input class="input" name="pickup_location" maxlength="190" value="<?= e($listing['pickup_location']) ?>"></div>
      </div>
      <div class="form-group"><label>Add more photos</label><label class="upload-zone" for="images"><?= icon('camera',24) ?> Choose images</label><input type="file" id="images" name="images[]" accept="image/*" multiple hidden></div>
      <button class="btn btn-primary" type="submit"><?= icon('check',16) ?> Save changes</button>
      <a href="<?= url('dashboard/listings.php') ?>" class="btn btn-ghost">Back</a>
    </form>
    <div style="margin-top:26px;padding-top:18px;border-top:1px solid var(--border)">
      <form method="post" action="" onsubmit="return confirm('Remove this listing permanently from the marketplace?')">
        <?= csrf_field() ?><input type="hidden" name="action" value="delete_listing">
        <button class="btn btn-danger btn-sm" type="submit"><?= icon('trash',15) ?> Remove listing</button>
      </form>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
