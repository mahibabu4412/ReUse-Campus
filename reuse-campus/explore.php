<?php
require_once __DIR__ . '/includes/components.php';
$pageTitle = 'Explore Marketplace';
$active = 'explore';

$categories = getCategories();
$q         = clean($_GET['q'] ?? '');
$category  = (int)($_GET['category'] ?? 0);
$condition = clean($_GET['condition'] ?? '');
$type      = clean($_GET['type'] ?? '');
$sort      = clean($_GET['sort'] ?? 'newest');
$view      = ($_GET['view'] ?? 'grid') === 'list' ? 'list' : 'grid';
$page      = max(1, (int)($_GET['page'] ?? 1));
$perPage   = 12;

$where  = ['l.status = "active"'];
$params = [];

if ($q !== '') {
    $where[] = '(l.title LIKE ? OR l.description LIKE ? OR c.name LIKE ?)';
    $like = '%' . $q . '%';
    $params = array_merge($params, [$like, $like, $like]);
}
if ($category) { $where[] = 'l.category_id = ?'; $params[] = $category; }
if (in_array($condition, ['new','like_new','good','fair'], true)) { $where[] = 'l.item_condition = ?'; $params[] = $condition; }
if (in_array($type, ['donation','borrow','exchange','sale'], true)) { $where[] = 'l.exchange_type = ?'; $params[] = $type; }

$whereSql = implode(' AND ', $where);

$order = 'l.created_at DESC';
if ($sort === 'relevance' && $q !== '') {
    $order = 'CASE WHEN l.title LIKE ' . getDB()->quote('%'.$q.'%') . ' THEN 0 ELSE 1 END, l.created_at DESC';
} elseif ($sort === 'price_low') {
    $order = 'l.price ASC';
} elseif ($sort === 'price_high') {
    $order = 'l.price DESC';
}

$total = (int)dbOne('SELECT COUNT(*) c FROM listings l JOIN categories c ON c.id=l.category_id WHERE ' . $whereSql, $params)['c'];
$p = paginate($total, $perPage, $page);
$listings = fetchListings($whereSql, $params, $order, $perPage, $p['offset']);

// counts per type for filter labels (global, active only)
$typeCounts = [];
foreach (dbAll('SELECT exchange_type, COUNT(*) c FROM listings WHERE status="active" GROUP BY exchange_type') as $r) {
    $typeCounts[$r['exchange_type']] = $r['c'];
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="page-head">
  <div class="container">
    <div class="breadcrumb"><a href="<?= url('index.php') ?>">Home</a><span class="sep"><?= icon('chevron-right', 13) ?></span><span>Explore</span></div>
    <h1>Explore marketplace</h1>
    <p>Discover resources shared by students across your campus.</p>
  </div>
</div>

<section class="section">
  <div class="container explore-layout">

    <!-- FILTERS -->
    <aside class="filter-panel" id="filterPanel">
      <h3><?= icon('filter', 17) ?> Filters</h3>
      <form method="get" action="<?= url('explore.php') ?>" data-auto-submit>
        <?php if ($q): ?><input type="hidden" name="q" value="<?= e($q) ?>"><?php endif; ?>
        <input type="hidden" name="sort" value="<?= e($sort) ?>">
        <input type="hidden" name="view" value="<?= e($view) ?>">

        <div class="filter-group">
          <h4>Category</h4>
          <label><input type="radio" name="category" value="0" <?= !$category ? 'checked' : '' ?>> All categories</label>
          <?php foreach ($categories as $c): ?>
            <label><input type="radio" name="category" value="<?= (int)$c['id'] ?>" <?= $category === (int)$c['id'] ? 'checked' : '' ?>> <?= e($c['name']) ?></label>
          <?php endforeach; ?>
        </div>

        <div class="filter-group">
          <h4>Exchange type</h4>
          <?php foreach (['donation'=>'Free donation','borrow'=>'Borrow','exchange'=>'Exchange','sale'=>'For sale'] as $k=>$label): ?>
            <label class="check-label"><input type="radio" name="type" value="<?= $k ?>" <?= $type === $k ? 'checked' : '' ?>> <?= e($label) ?>
              <span class="filter-count"><?= $typeCounts[$k] ?? 0 ?></span></label>
          <?php endforeach; ?>
          <label class="check-label"><input type="radio" name="type" value="" <?= !$type ? 'checked' : '' ?>> All types</label>
        </div>

        <div class="filter-group">
          <h4>Condition</h4>
          <?php foreach (['new'=>'Brand new','like_new'=>'Like new','good'=>'Good','fair'=>'Fair'] as $k=>$label): ?>
            <label><input type="radio" name="condition" value="<?= $k ?>" <?= $condition === $k ? 'checked' : '' ?>> <?= e($label) ?></label>
          <?php endforeach; ?>
          <label><input type="radio" name="condition" value="" <?= !$condition ? 'checked' : '' ?>> Any condition</label>
        </div>

        <button class="btn btn-outline btn-block btn-sm" type="submit">Apply filters</button>
        <a href="<?= url('explore.php') ?>" class="btn btn-ghost btn-block btn-sm" style="margin-top:6px">Clear all</a>
      </form>
    </aside>

    <!-- RESULTS -->
    <div>
      <form class="toolbar" method="get" action="<?= url('explore.php') ?>">
        <?php if ($category): ?><input type="hidden" name="category" value="<?= $category ?>"><?php endif; ?>
        <?php if ($condition): ?><input type="hidden" name="condition" value="<?= e($condition) ?>"><?php endif; ?>
        <?php if ($type): ?><input type="hidden" name="type" value="<?= e($type) ?>"><?php endif; ?>
        <input type="hidden" name="view" value="<?= e($view) ?>">
        <div style="flex:1;min-width:200px;position:relative">
          <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);display:flex"><?= icon('search',17) ?></span>
          <input class="input" style="padding-left:40px" type="search" name="q" value="<?= e($q) ?>" placeholder="Search resources...">
        </div>
        <select class="select" name="sort" aria-label="Sort by">
          <option value="newest" <?= $sort==='newest'?'selected':'' ?>>Newest first</option>
          <option value="relevance" <?= $sort==='relevance'?'selected':'' ?>>Relevance</option>
          <option value="price_low" <?= $sort==='price_low'?'selected':'' ?>>Price: low to high</option>
          <option value="price_high" <?= $sort==='price_high'?'selected':'' ?>>Price: high to low</option>
        </select>
        <button class="btn btn-outline btn-sm" type="submit">Apply</button>
        <button class="btn btn-outline btn-sm mobile-filter-btn" type="button" id="filterToggle"><?= icon('filter',16) ?> Filters</button>
        <div class="view-toggle" aria-label="View mode">
          <button type="button" data-view="grid" class="<?= $view==='grid'?'active':'' ?>" title="Grid view"><?= icon('grid',16) ?></button>
          <button type="button" data-view="list" class="<?= $view==='list'?'active':'' ?>" title="List view"><?= icon('list',16) ?></button>
        </div>
      </form>

      <div class="result-count" style="margin-bottom:16px">Showing <b><?= count($listings) ?></b> of <b><?= $total ?></b> resources<?= $q ? ' for “'.e($q).'”' : '' ?></div>

      <?php if ($listings): ?>
        <div id="listingView" class="<?= $view==='grid'?'listing-grid':'listing-list' ?>" data-view-mode="<?= $view ?>">
          <?php foreach ($listings as $l) echo $view==='grid' ? listingCard($l) : listingRow($l); ?>
        </div>
        <?= pagination($p) ?>
      <?php else: ?>
        <?= emptyState('No resources found', 'Try adjusting your search or filters — new items are added every day.', 'Browse all resources', url('explore.php')) ?>
      <?php endif; ?>
    </div>
  </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
