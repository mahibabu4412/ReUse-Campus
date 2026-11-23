<?php
/**
 * App sidebar for student dashboard / admin panel.
 * Expects $isAdminLayout, $active, $admin, $student, $pendingReports, $notifCount.
 */
?>
<aside class="app-sidebar" id="appSidebar">
  <a href="<?= $isAdminLayout ? url('admin/index.php') : url('dashboard/index.php') ?>" class="sidebar-brand">
    <span class="brand-mark"><img src="<?= asset('images/logo.svg') ?>" alt="" style="width:22px;height:22px"></span>
    <span>ReUse Campus<small><?= $isAdminLayout ? 'ADMIN PANEL' : 'STUDENT SPACE' ?></small></span>
  </a>
  <div class="side-scroll">
    <?php if ($isAdminLayout): ?>
      <div class="side-label">Management</div>
      <div class="side-links">
        <a href="<?= url('admin/index.php') ?>" class="<?= $active==='overview'?'active':'' ?>"><?= icon('layout',17) ?> Overview</a>
        <a href="<?= url('admin/users.php') ?>" class="<?= $active==='users'?'active':'' ?>"><?= icon('users',17) ?> Students</a>
        <a href="<?= url('admin/listings.php') ?>" class="<?= $active==='listings'?'active':'' ?>"><?= icon('package',17) ?> Listings</a>
        <a href="<?= url('admin/reports.php') ?>" class="<?= $active==='reports'?'active':'' ?>"><?= icon('flag',17) ?> Reports <?php if ($pendingReports): ?><span class="badge"><?= $pendingReports ?></span><?php endif; ?></a>
        <a href="<?= url('admin/categories.php') ?>" class="<?= $active==='categories'?'active':'' ?>"><?= icon('layers',17) ?> Categories</a>
        <a href="<?= url('admin/messages.php') ?>" class="<?= $active==='messages'?'active':'' ?>"><?= icon('mail',17) ?> Messages</a>
        <a href="<?= url('admin/analytics.php') ?>" class="<?= $active==='analytics'?'active':'' ?>"><?= icon('bar-chart',17) ?> Analytics</a>
      </div>
      <div class="side-label">Account</div>
      <div class="side-links">
        <a href="<?= url('index.php') ?>" target="_blank"><?= icon('external-link',17) ?> View website</a>
        <a href="<?= url('admin/logout.php') ?>"><?= icon('log-out',17) ?> Log out</a>
      </div>
    <?php else: ?>
      <div class="side-label">Workspace</div>
      <div class="side-links">
        <a href="<?= url('dashboard/index.php') ?>" class="<?= $active==='overview'?'active':'' ?>"><?= icon('layout',17) ?> Overview</a>
        <a href="<?= url('dashboard/listings.php') ?>" class="<?= $active==='listings'?'active':'' ?>"><?= icon('package',17) ?> My listings</a>
        <a href="<?= url('dashboard/requests.php') ?>" class="<?= $active==='requests'?'active':'' ?>"><?= icon('repeat',17) ?> My requests</a>
        <a href="<?= url('dashboard/incoming.php') ?>" class="<?= $active==='incoming'?'active':'' ?>"><?= icon('handshake',17) ?> Incoming requests</a>
        <a href="<?= url('dashboard/saved.php') ?>" class="<?= $active==='saved'?'active':'' ?>"><?= icon('heart',17) ?> Saved items</a>
        <a href="<?= url('dashboard/history.php') ?>" class="<?= $active==='history'?'active':'' ?>"><?= icon('rotate-ccw',17) ?> Exchange history</a>
      </div>
      <div class="side-label">Discover</div>
      <div class="side-links">
        <a href="<?= url('explore.php') ?>"><?= icon('search',17) ?> Browse marketplace</a>
        <a href="<?= url('listings/create.php') ?>" class="<?= $active==='create'?'active':'' ?>"><?= icon('plus',17) ?> List an item</a>
      </div>
      <div class="side-label">Account</div>
      <div class="side-links">
        <a href="<?= url('dashboard/notifications.php') ?>" class="<?= $active==='notifications'?'active':'' ?>"><?= icon('bell',17) ?> Notifications <?php if ($notifCount): ?><span class="badge"><?= $notifCount ?></span><?php endif; ?></a>
        <a href="<?= url('profile/index.php') ?>" class="<?= $active==='profile'?'active':'' ?>"><?= icon('settings',17) ?> Profile settings</a>
        <a href="<?= url('auth/logout.php') ?>"><?= icon('log-out',17) ?> Log out</a>
      </div>
    <?php endif; ?>
  </div>
  <div class="sidebar-foot">
    <div class="sidebar-user">
      <span class="avatar"><?= $isAdminLayout ? e(initials($admin['full_name'] ?? 'A')) : e(initials($student['full_name'] ?? 'S')) ?></span>
      <div style="min-width:0"><b><?= e($isAdminLayout ? ($admin['full_name'] ?? 'Admin') : ($student['full_name'] ?? 'Student')) ?></b>
      <small><?= $isAdminLayout ? 'Administrator' : 'Student member' ?></small></div>
    </div>
  </div>
</aside>
