/* =========================================================
   ReUse Campus - shared front-end behaviour
   ========================================================= */
(function () {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const csrf = () => ($('meta[name="csrf-token"]') || {}).content || '';

  /* ---- User dropdown ---- */
  const userBtn = $('#userMenuBtn');
  const userDrop = $('#userDropdown');
  if (userBtn && userDrop) {
    userBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const open = userDrop.classList.toggle('show');
      userBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!userDrop.contains(e.target) && e.target !== userBtn) {
        userDrop.classList.remove('show');
        userBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Mobile navigation ---- */
  const navBtn = $('#navMenuBtn');
  const navLinks = $('#navLinks');
  if (navBtn && navLinks) {
    navBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  /* ---- Sidebar (dashboard / admin) ---- */
  const sideBtn = $('#sidebarToggle');
  const sidebar = $('#appSidebar');
  const overlay = $('#sidebarOverlay');
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  }
  if (sideBtn) sideBtn.addEventListener('click', () => {
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  });
  if (overlay) overlay.addEventListener('click', closeSidebar);

  /* ---- Dismissible alerts ---- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dismiss-alert]');
    if (btn) btn.closest('.alert')?.remove();
  });

  /* ---- Password visibility ---- */
  $$('.pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = show
        ? '<svg class="icon" width="18" height="18"><use href="#i-eye"></use></svg>'
        : '<svg class="icon" width="18" height="18"><use href="#i-lock"></use></svg>';
    });
  });

  /* ---- Favorite / save toggle ---- */
  $$('[data-favorite]').forEach((btn) => {
    btn.addEventListener('click', async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (btn.dataset.busy) return;
      btn.dataset.busy = '1';
      try {
        const res = await fetch(window.RC_FAV_URL || '/api/favorite.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRF-Token': csrf() },
          body: new URLSearchParams({ csrf_token: csrf(), listing_id: btn.dataset.favorite })
        });
        const data = await res.json();
        if (data.ok) {
          btn.classList.toggle('active', data.saved);
          if (data.count !== undefined) {
            const c = $('[data-fav-count]');
            if (c) c.textContent = data.count;
          }
          toast(data.saved ? 'Saved to your list' : 'Removed from saved items', 'success');
        } else if (data.login_required) {
          window.location.href = data.redirect;
        } else {
          toast(data.message || 'Could not update.', 'error');
        }
      } catch (err) {
        toast('Network error. Please try again.', 'error');
      } finally {
        delete btn.dataset.busy;
      }
    });
  });

  /* ---- Toast helper ---- */
  function toast(message, type = 'success') {
    let stack = $('.flash-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'flash-stack';
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = 'alert alert-' + (type === 'error' ? 'error' : 'success');
    el.innerHTML = '<svg class="icon alert-icon" width="18" height="18"><use href="#i-' +
      (type === 'error' ? 'x-circle' : 'check-circle') + '"></use></svg><span>' +
      String(message).replace(/[<>&]/g, '') + '</span>';
    stack.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
  window.rcToast = toast;

  /* ---- Explore filters toggle (mobile) ---- */
  const filterBtn = $('#filterToggle');
  const filterPanel = $('#filterPanel');
  if (filterBtn && filterPanel) {
    filterBtn.addEventListener('click', () => filterPanel.classList.toggle('open'));
  }

  /* ---- Grid / list view toggle ---- */
  $$('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      $$('[data-view]').forEach(b => b.classList.toggle('active', b === btn));
      const grid = $('#listingView');
      if (grid) {
        grid.classList.toggle('listing-grid', view === 'grid');
        grid.classList.toggle('listing-list', view === 'list');
        grid.dataset.viewMode = view;
      }
      try { localStorage.setItem('rc_view', view); } catch (e) {}
    });
  });

  /* ---- Restore saved view mode ---- */
  try {
    const savedView = localStorage.getItem('rc_view');
    if (savedView) {
      const grid = $('#listingView');
      if (grid) {
        grid.classList.toggle('listing-grid', savedView === 'grid');
        grid.classList.toggle('listing-list', savedView === 'list');
        grid.dataset.viewMode = savedView;
      }
      $$('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === savedView));
    }
  } catch (e) {}

  /* ---- Confirm modal ---- */
  window.rcConfirm = function (message, onConfirm) {
    let bd = $('#confirmModal');
    if (!bd) {
      bd = document.createElement('div');
      bd.id = 'confirmModal';
      bd.className = 'modal-backdrop';
      bd.innerHTML = '<div class="modal" style="max-width:420px">' +
        '<h2>Are you sure?</h2><p class="rc-msg"></p>' +
        '<div class="modal-actions"><button class="btn btn-outline" data-no>Cancel</button>' +
        '<button class="btn btn-danger" data-yes>Confirm</button></div></div>';
      document.body.appendChild(bd);
      bd.addEventListener('click', (e) => { if (e.target === bd) bd.classList.remove('show'); });
    }
    $('.rc-msg', bd).textContent = message || 'This action cannot be undone.';
    bd.classList.add('show');
    const yes = $('[data-yes]', bd), no = $('[data-no]', bd);
    const cleanup = () => { bd.classList.remove('show'); yes.replaceWith(yes.cloneNode(true)); no.replaceWith(no.cloneNode(true)); };
    yes.addEventListener('click', () => { cleanup(); onConfirm(); }, { once: true });
    no.addEventListener('click', cleanup, { once: true });
  };

  /* ---- Auto submit on filter change ---- */
  $$('form[data-auto-submit] select, form[data-auto-submit] input[type=checkbox], form[data-auto-submit] input[type=radio]').forEach((el) => {
    el.addEventListener('change', () => el.form.submit());
  });
})();
