<?php
/**
 * Handles all request status transitions with authorization checks.
 */
require_once __DIR__ . '/../includes/auth.php';
requireLogin();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('dashboard/index.php');
verify_csrf();

$user = authUser();
$uid  = (int)$user['id'];
$rid  = (int)($_POST['request_id'] ?? 0);
$action = clean($_POST['action'] ?? '');

$req = dbOne('SELECT r.*, l.title AS listing_title, l.exchange_type, l.availability,
                     req_u.full_name AS requester_name, own_u.full_name AS owner_name
              FROM item_requests r
              JOIN listings l ON l.id = r.listing_id
              JOIN users req_u ON req_u.id = r.requester_id
              JOIN users own_u ON own_u.id = r.owner_id
              WHERE r.id = ?', [$rid]);

if (!$req) { setFlash('error','Request not found.'); redirect('dashboard/requests.php'); }

$isOwner = (int)$req['owner_id'] === $uid;
$isRequester = (int)$req['requester_id'] === $uid;
if (!$isOwner && !$isRequester) { setFlash('error','You are not allowed to manage this request.'); redirect('dashboard/index.php'); }

$back = $isOwner ? 'dashboard/incoming.php' : 'dashboard/requests.php';

switch ($action) {
    case 'accept':
        if (!$isOwner || $req['status'] !== 'pending') { setFlash('error','This request cannot be accepted.'); break; }
        db('UPDATE item_requests SET status="accepted" WHERE id=?', [$rid]);
        db('UPDATE listings SET availability="reserved" WHERE id=?', [$req['listing_id']]);
        addNotification((int)$req['requester_id'], 'Request accepted',
            'Your request for “'.$req['listing_title'].'” was accepted by '.$user['full_name'].'.',
            'request', 'dashboard/requests.php');
        setFlash('success','Request accepted. The item is now reserved.');
        break;

    case 'reject':
        if (!$isOwner || $req['status'] !== 'pending') { setFlash('error','This request cannot be rejected.'); break; }
        db('UPDATE item_requests SET status="rejected" WHERE id=?', [$rid]);
        addNotification((int)$req['requester_id'], 'Request update',
            'Your request for “'.$req['listing_title'].'” was not accepted.', 'request', 'dashboard/requests.php');
        setFlash('info','Request rejected.');
        break;

    case 'cancel':
        if (!$isRequester || $req['status'] !== 'pending') { setFlash('error','This request cannot be cancelled.'); break; }
        db('UPDATE item_requests SET status="cancelled" WHERE id=?', [$rid]);
        addNotification((int)$req['owner_id'], 'Request cancelled',
            $user['full_name'].' cancelled their request for “'.$req['listing_title'].'”.', 'request', 'dashboard/incoming.php');
        setFlash('info','Request cancelled.');
        break;

    case 'complete':
        if (!in_array($req['status'], ['accepted'], true)) { setFlash('error','Only accepted requests can be completed.'); break; }
        if ($req['exchange_type'] === 'borrow' && !$isOwner) { setFlash('error','Only the owner can confirm the return of a borrowed item.'); break; }
        db('UPDATE item_requests SET status="completed", return_confirmed=1 WHERE id=?', [$rid]);
        db('UPDATE listings SET availability="completed", status="sold" WHERE id=?', [$req['listing_id']]);
        db('INSERT INTO exchange_history (listing_id,requester_id,owner_id,exchange_type) VALUES (?,?,?,?)',
           [$req['listing_id'],$req['requester_id'],$req['owner_id'],$req['exchange_type']]);
        $otherId = $isOwner ? (int)$req['requester_id'] : (int)$req['owner_id'];
        addNotification($otherId, 'Exchange completed',
            'The exchange for “'.$req['listing_title'].'” was marked complete. Thanks for sharing!',
            'exchange', 'dashboard/history.php');
        setFlash('success','Exchange completed and added to history.');
        $back = 'dashboard/history.php';
        break;

    default:
        setFlash('error','Unknown action.');
}
redirect($back);
