<?php
/**
 * All privileged admin mutations. Requires admin session + CSRF.
 */
require_once __DIR__ . '/../includes/auth.php';
requireAdmin();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('admin/index.php');
verify_csrf();

$action = clean($_POST['action'] ?? '');
$back = clean($_POST['back'] ?? 'admin/index.php');
if (strpos($back, 'admin/') !== 0) $back = 'admin/index.php'; // restrict redirects to admin area

switch ($action) {
    case 'suspend_user':
    case 'activate_user':
        $id = (int)($_POST['id'] ?? 0);
        $status = $action === 'suspend_user' ? 'suspended' : 'active';
        if ($id) {
            db('UPDATE users SET status=? WHERE id=?', [$status,$id]);
            setFlash('success','Student account '.$status.'.');
        }
        break;

    case 'approve_listing':
    case 'remove_listing':
    case 'pend_listing':
        $id = (int)($_POST['id'] ?? 0);
        $map = ['approve_listing'=>'active','remove_listing'=>'removed','pend_listing'=>'pending'];
        if ($id) {
            db('UPDATE listings SET status=? WHERE id=?', [$map[$action],$id]);
            setFlash('success','Listing '.$map[$action].'.');
        }
        break;

    case 'review_report':
    case 'resolve_report':
    case 'dismiss_report':
        $id = (int)($_POST['id'] ?? 0);
        $map = ['review_report'=>'reviewed','resolve_report'=>'resolved','dismiss_report'=>'dismissed'];
        if ($id) {
            $note = clean($_POST['admin_note'] ?? '');
            db('UPDATE reports SET status=?, admin_note=? WHERE id=?', [$map[$action],$note,$id]);
            setFlash('success','Report marked '.$map[$action].'.');
        }
        break;

    case 'add_category':
        $name = clean($_POST['name'] ?? '');
        $slug = clean($_POST['slug'] ?? '');
        $desc = clean($_POST['description'] ?? '');
        $icon = clean($_POST['icon'] ?? 'layers');
        if (mb_strlen($name) < 2 || $slug === '') {
            setFlash('error','Name and slug are required.');
        } elseif (dbOne('SELECT 1 FROM categories WHERE slug=?',[$slug])) {
            setFlash('error','That slug already exists.');
        } else {
            db('INSERT INTO categories (name,slug,description,icon) VALUES (?,?,?,?)',[$name,$slug,$desc,$icon]);
            setFlash('success','Category created.');
        }
        break;

    case 'edit_category':
        $id = (int)($_POST['id'] ?? 0);
        $name = clean($_POST['name'] ?? '');
        $slug = clean($_POST['slug'] ?? '');
        $desc = clean($_POST['description'] ?? '');
        $icon = clean($_POST['icon'] ?? 'layers');
        $status = clean($_POST['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active';
        if ($id && $name !== '' && $slug !== '') {
            $dup = dbOne('SELECT 1 FROM categories WHERE slug=? AND id<>?',[$slug,$id]);
            if ($dup) setFlash('error','That slug is already in use.');
            else { db('UPDATE categories SET name=?,slug=?,description=?,icon=?,status=? WHERE id=?',[$name,$slug,$desc,$icon,$status,$id]); setFlash('success','Category updated.'); }
        }
        break;

    case 'delete_category':
        $id = (int)($_POST['id'] ?? 0);
        if ($id) {
            $used = (int)dbOne('SELECT COUNT(*) c FROM listings WHERE category_id=?',[$id])['c'];
            if ($used) setFlash('error','Category is in use by '.$used.' listing(s). Set it inactive instead.');
            else { db('DELETE FROM categories WHERE id=?',[$id]); setFlash('success','Category deleted.'); }
        }
        break;

    case 'message_read':
    case 'message_unread':
    case 'message_delete':
        $id = (int)($_POST['id'] ?? 0);
        if ($id) {
            if ($action==='message_delete') db('DELETE FROM contact_messages WHERE id=?',[$id]);
            else db('UPDATE contact_messages SET is_read=? WHERE id=?', [$action==='message_read'?1:0,$id]);
            setFlash('success','Message updated.');
        }
        break;

    default:
        setFlash('error','Unknown action.');
}
redirect($back);
