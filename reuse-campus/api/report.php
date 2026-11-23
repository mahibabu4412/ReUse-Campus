<?php
require_once __DIR__ . '/../includes/auth.php';
requireLogin();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('explore.php');
verify_csrf();

$uid = (int)authUser()['id'];
$lid = (int)($_POST['listing_id'] ?? 0);
$reason = clean($_POST['reason'] ?? '');
$details = clean($_POST['details'] ?? '');
$allowed = ['inappropriate','spam','misleading','other'];

$listing = getListing($lid);
if (!$lid || !$listing) { setFlash('error','Invalid listing.'); redirect('explore.php'); }
if (!in_array($reason, $allowed, true)) { setFlash('error','Choose a valid reason.'); redirect('listing.php?id='.$lid); }
if ((int)$listing['user_id'] === $uid) { setFlash('error','You cannot report your own listing.'); redirect('listing.php?id='.$lid); }

$dup = dbOne('SELECT id FROM reports WHERE reporter_id=? AND listing_id=? AND status IN ("pending","reviewed")', [$uid,$lid]);
if ($dup) {
    setFlash('info','You have already reported this listing. Our team is reviewing it.');
} else {
    db('INSERT INTO reports (reporter_id,listing_id,reported_user_id,reason,details) VALUES (?,?,?,?,?)',
       [$uid,$lid,$listing['user_id'],$reason,$details]);
    setFlash('success','Thank you. Your report has been sent to moderators.');
}
redirect('listing.php?id='.$lid);
