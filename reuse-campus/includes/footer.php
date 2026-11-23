<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="<?= url('index.php') ?>" class="brand">
          <span class="brand-mark"><img src="<?= asset('images/logo.svg') ?>" alt="" style="width:22px;height:22px"></span>
          <span>ReUse Campus<small>SHARE · REUSE · LEARN</small></span>
        </a>
        <p><?= APP_TAGLINE ?>. A student-powered marketplace for textbooks, notes, tools and more — built to lower costs and keep good resources in circulation.</p>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <a href="<?= url('explore.php') ?>">All resources</a>
        <a href="<?= url('explore.php?type=donation') ?>">Free donations</a>
        <a href="<?= url('explore.php?type=borrow') ?>">Borrow items</a>
        <a href="<?= url('explore.php?type=exchange') ?>">Exchange</a>
        <a href="<?= url('explore.php?type=sale') ?>">Buy &amp; sell</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="<?= url('about.php') ?>">About us</a>
        <a href="<?= url('how-it-works.php') ?>">How it works</a>
        <a href="<?= url('contact.php') ?>">Contact</a>
        <a href="<?= url('auth/register.php') ?>">Join the community</a>
        <a href="<?= url('admin/login.php') ?>">Admin portal</a>
      </div>
      <div class="footer-col">
        <h4>Get in touch</h4>
        <ul class="footer-contact">
          <li><?= icon('map-pin', 16) ?> <span>Rajshahi Polytechnic Institute,<br>Rajshahi, Bangladesh</span></li>
          <li><?= icon('mail', 16) ?> <span>hello@reusecampus.edu</span></li>
          <li><?= icon('clock', 16) ?> <span>Support: Sat–Thu, 9am–6pm</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; <?= date('Y') ?> <?= APP_NAME ?>. Built for students, by students.</span>
      <span><?= icon('shield', 14) ?> Secure · Private · Student-only</span>
    </div>
  </div>
</footer>

<script>window.RC_FAV_URL = <?= json_encode(url('api/favorite.php')) ?>;</script>
<script src="<?= asset('js/app.js') ?>"></script>
</body>
</html>
