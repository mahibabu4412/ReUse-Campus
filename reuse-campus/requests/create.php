<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/icons.php';
requireLogin();
$user = authUser();
$id = (int)($_GET['listing'] ?? $_POST['listing_id'] ?? 0);
$listing = getListing($id);

if (!$listing || $listing['status'] !== 'active') { setFlash('error','Listing not available.'); redirect('explore.php'); }
if ((int)$listing['user_id'] === (int)$user['id']) { setFlash('error','You cannot request your own listing.'); redirect('listing.php?id='.$id); }

$dup = dbOne('SELECT * FROM item_requests WHERE listing_id=? AND requester_id=? AND status IN ("pending","accepted")', [$id,$user['id']]);
if ($dup) { setFlash('info','You already have an active request for this item.'); redirect('dashboard/requests.php'); }

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $message = clean($_POST['message'] ?? '');
    $returnDate = clean($_POST['expected_return_date'] ?? '');
    if (mb_strlen($message) < 10 || mb_strlen($message) > 1000) {
        $error = 'Please write a short message (10–1000 characters).';
    } elseif ($listing['exchange_type'] === 'borrow' && $returnDate === '') {
        $error = 'Please provide an expected return date.';
    } elseif ($returnDate !== '' && strtotime($returnDate) < strtotime('today')) {
        $error = 'Return date cannot be in the past.';
    } else {
        db('INSERT INTO item_requests (listing_id,requester_id,owner_id,message,expected_return_date,status)
            VALUES (?,?,?,?,?,"pending")',
           [$id,$user['id'],$listing['user_id'],$message,$returnDate ?: null]);
        addNotification((int)$listing['user_id'], 'New item request',
            $user['full_name'].' requested “'.$listing['title'].'”.', 'request', 'dashboard/incoming.php');
        setFlash('success','Request sent! You can track its status in your dashboard.');
        redirect('dashboard/requests.php');
    }
}

$appTitle = 'Request item';
$active = 'requests';
require_once __DIR__ . '/../includes/app_header.php';
?>

<div class="panel" style="max-width:720px;margin:0 auto">
  <div class="panel-head"><h2>Request this item</h2></div>
  <div class="panel-body">
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:22px;padding-bottom:20px;border-bottom:1px solid var(--border-2)">
      <img src="<?= e(imageUrl(getListingImage($id))) ?>" alt="" style="width:88px;height:74px;object-fit:cover;border-radius:10px">
      <div><b style="font-size:15px"><?= e($listing['title']) ?></b>
        <div style="font-size:12.5px;color:var(--muted);margin-top:4px"><?= e(exchangeLabel($listing['exchange_type'])) ?> · <?= e($listing['pickup_location'] ?: 'Campus') ?></div></div>
    </div>
    <?php if ($error): ?><div class="alert alert-error" style="position:static;width:auto;margin-bottom:18px;box-shadow:none"><?= icon('alert-circle',18) ?><span><?= e($error) ?></span></div><?php endif; ?>
    <form method="post" action="">
      <?= csrf_field() ?><input type="hidden" name="listing_id" value="<?= $id ?>">
      <div class="form-group"><label>Message to the owner</label>
        <textarea class="textarea" name="message" required minlength="10" maxlength="1000" placeholder="Introduce yourself and explain why you need this item..."><?= old('message') ?></textarea>
        <div class="hint">Be polite and specific — it helps owners respond faster.</div></div>
      <?php if ($listing['exchange_type'] === 'borrow'): ?>
        <div class="form-group"><label>Expected return date</label><input class="input" type="date" name="expected_return_date" required min="<?= date('Y-m-d', strtotime('+1 day')) ?>" value="<?= old('expected_return_date') ?>"></div>
      <?php endif; ?>
      <div class="form-note"><?= icon('shield',15) ?> Your student ID and private contact details are never shared. Arrange handover details after your request is accepted.</div>
      <button class="btn btn-primary btn-lg" type="submit"><?= icon('send',17) ?> Send request</button>
      <a href="<?= url('listing.php?id='.$id) ?>" class="btn btn-ghost">Cancel</a>
    </form>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/app_footer.php'; ?>
