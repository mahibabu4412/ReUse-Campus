<?php
require_once __DIR__ . '/../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('contact.php');
verify_csrf();

$name = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$subject = clean($_POST['subject'] ?? '');
$message = clean($_POST['message'] ?? '');
$uid = authUser()['id'] ?? null;

$errors = [];
if (mb_strlen($name) < 2 || mb_strlen($name) > 120) $errors[] = 'Enter a valid name.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Enter a valid email.';
if (!in_array($subject, ['General question','Account help','Listing issue','Report a problem','Partnership'], true)) $errors[] = 'Choose a subject.';
if (mb_strlen($message) < 10 || mb_strlen($message) > 2000) $errors[] = 'Message must be 10–2000 characters.';

if ($errors) {
    setOld(compact('name','email','message'));
    setFlash('error', implode(' ', $errors));
    redirect('contact.php');
}

db('INSERT INTO contact_messages (name,email,subject,message,user_id) VALUES (?,?,?,?,?)',
   [$name,$email,$subject,$message,$uid]);
clearOld();
setFlash('success','Message sent. We will get back to you soon.');
redirect('contact.php');
