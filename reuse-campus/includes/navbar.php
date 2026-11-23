<?php
/**
 * Public navigation bar. Expects $active and $user from the including header.
 */
?>
<header class="site-header">
  <div class="container">
    <nav class="navbar">
      <button class="mobile-menu-btn" id="navMenuBtn" aria-label="Open menu"><?= icon('menu', 22) ?></button>
      <a href="<?= url('index.php') ?>" class="brand" aria-label="ReUse Campus home">
        <span class="brand-mark"><img src="<?= asset('images/logo.svg') ?>" alt="" style="width:22px;height:22px"></span>
        <span>ReUse Campus<small>SHARE · REUSE · LEARN</small></span>
      </a>

      <div class="nav-links" id="navLinks">
        <a href="<?= url('index.php') ?>" class="<?= $active === 'home' ? 'active' : '' ?>">Home</a>
        <a href="<?= url('explore.php') ?>" class="<?= $active === 'explore' ? 'active' : '' ?>">Explore</a>
        <a href="<?= url('how-it-works.php') ?>" class="<?= $active === 'how' ? 'active' : '' ?>">How it works</a>
        <a href="<?= url('about.php') ?>" class="<?= $active === 'about' ? 'active' : '' ?>">About</a>
        <a href="<?= url('contact.php') ?>" class="<?= $active === 'contact' ? 'active' : '' ?>">Contact</a>
      </div>

      <div class="nav-actions">
        <?php if ($user): ?>
          <a href="<?= url('dashboard/notifications.php') ?>" class="nav-icon-btn" aria-label="Notifications" title="Notifications">
            <?= icon('bell', 18) ?>
            <?php if (notificationCount($user['id']) > 0): ?><span class="notif-dot"></span><?php endif; ?>
          </a>
          <a href="<?= url('listings/create.php') ?>" class="btn btn-primary btn-sm"><?= icon('plus', 16) ?> List an item</a>
          <div class="user-menu">
            <button class="user-menu-btn" id="userMenuBtn" aria-expanded="false">
              <span class="avatar"><?= e(initials($user['full_name'])) ?></span>
              <span class="hide-sm"><?= e(explode(' ', $user['full_name'])[0]) ?></span>
              <?= icon('chevron-down', 14) ?>
            </button>
            <div class="dropdown" id="userDropdown">
              <div class="dropdown-name">Signed in as <b><?= e($user['full_name']) ?></b></div>
              <a href="<?= url('dashboard/index.php') ?>"><?= icon('layout', 16) ?> Dashboard</a>
              <a href="<?= url('dashboard/listings.php') ?>"><?= icon('package', 16) ?> My listings</a>
              <a href="<?= url('dashboard/requests.php') ?>"><?= icon('repeat', 16) ?> Requests</a>
              <a href="<?= url('profile/index.php') ?>"><?= icon('settings', 16) ?> Profile settings</a>
              <div class="divider"></div>
              <a href="<?= url('auth/logout.php') ?>"><?= icon('log-out', 16) ?> Log out</a>
            </div>
          </div>
        <?php else: ?>
          <a href="<?= url('auth/login.php') ?>" class="btn btn-ghost btn-sm">Log in</a>
          <a href="<?= url('auth/register.php') ?>" class="btn btn-primary btn-sm"><?= icon('plus', 16) ?> Sign up</a>
        <?php endif; ?>
      </div>
    </nav>
  </div>
</header>
