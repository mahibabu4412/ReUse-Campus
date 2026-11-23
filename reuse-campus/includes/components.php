<?php
/**
 * ReUse Campus - Reusable render components.
 */
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/icons.php';

/** Fetch listing rows enriched with image + owner info. */
function fetchListings($where = '1=1', $params = [], $order = 'l.created_at DESC', $limit = null, $offset = null)
{
    $sql = 'SELECT l.*, c.name AS category_name, c.slug AS category_slug,
                   u.full_name AS owner_name, u.profile_picture AS owner_avatar,
                   (SELECT filename FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.is_primary DESC, li.id ASC LIMIT 1) AS image
            FROM listings l
            JOIN categories c ON c.id = l.category_id
            JOIN users u ON u.id = l.user_id
            WHERE ' . $where . ' ORDER BY ' . $order;
    if ($limit !== null) {
        $sql .= ' LIMIT ' . (int)$limit;
        if ($offset !== null) $sql .= ' OFFSET ' . (int)$offset;
    }
    return dbAll($sql, $params);
}

/** Render a single grid listing card. */
function listingCard($l)
{
    $price = $l['exchange_type'] === 'donation' ? 'Free' : formatMoney($l['price']);
    $free  = $l['exchange_type'] === 'donation';
    $saved = isFavorite(currentUser()['id'] ?? null, $l['id']);
    $href  = url('listing.php?id=' . (int)$l['id']);
    ob_start(); ?>
    <article class="listing-card card-hover">
      <a href="<?= $href ?>" class="listing-media" aria-label="<?= e($l['title']) ?>">
        <img src="<?= e(imageUrl($l['image'])) ?>" alt="<?= e($l['title']) ?>" loading="lazy">
        <span class="badge badge-<?= e($l['exchange_type']) ?> listing-type"><?= e(exchangeLabel($l['exchange_type'])) ?></span>
      </a>
      <button class="fav-btn <?= $saved ? 'active' : '' ?>" data-favorite="<?= (int)$l['id'] ?>" title="Save item" aria-label="Save item">
        <?= icon('heart', 17) ?>
      </button>
      <div class="listing-body">
        <span class="listing-cat"><?= e($l['category_name']) ?></span>
        <a href="<?= $href ?>" class="listing-title"><?= e($l['title']) ?></a>
        <div class="listing-price <?= $free ? 'free' : '' ?>"><?= e($price) ?></div>
        <div class="listing-meta">
          <span><?= icon('tag', 13) ?> <?= e(conditionLabel($l['item_condition'])) ?></span>
          <span><?= icon('map-pin', 13) ?> <?= e($l['pickup_location'] ?: 'Campus') ?></span>
        </div>
      </div>
      <div class="listing-foot">
        <span class="owner"><span class="avatar"><?= e(initials($l['owner_name'])) ?></span> <b><?= e(explode(' ', $l['owner_name'])[0]) ?></b></span>
        <span><?= e(timeAgo($l['created_at'])) ?></span>
      </div>
    </article>
    <?php return ob_get_clean();
}

/** Render a listing row for list view. */
function listingRow($l)
{
    $price = $l['exchange_type'] === 'donation' ? 'Free' : formatMoney($l['price']);
    $saved = isFavorite(currentUser()['id'] ?? null, $l['id']);
    $href  = url('listing.php?id=' . (int)$l['id']);
    ob_start(); ?>
    <article class="listing-row">
      <a href="<?= $href ?>" class="row-img"><img src="<?= e(imageUrl($l['image'])) ?>" alt="<?= e($l['title']) ?>" loading="lazy"></a>
      <div class="row-body">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span class="badge badge-<?= e($l['exchange_type']) ?>"><?= e(exchangeLabel($l['exchange_type'])) ?></span>
          <span class="listing-cat"><?= e($l['category_name']) ?></span>
        </div>
        <a href="<?= $href ?>" class="listing-title" style="min-height:auto;margin:8px 0;font-size:16px"><?= e($l['title']) ?></a>
        <div class="listing-meta" style="margin-top:4px">
          <span><?= icon('tag', 13) ?> <?= e(conditionLabel($l['item_condition'])) ?></span>
          <span><?= icon('map-pin', 13) ?> <?= e($l['pickup_location'] ?: 'Campus') ?></span>
          <span><?= icon('clock', 13) ?> <?= e(timeAgo($l['created_at'])) ?></span>
        </div>
        <div class="row-price" style="margin-top:auto;padding-top:8px"><?= e($price) ?></div>
      </div>
      <div class="row-actions">
        <button class="fav-btn <?= $saved ? 'active' : '' ?>" style="position:static" data-favorite="<?= (int)$l['id'] ?>" aria-label="Save"><?= icon('heart', 17) ?></button>
        <a href="<?= $href ?>" class="btn btn-primary btn-sm">View</a>
      </div>
    </article>
    <?php return ob_get_clean();
}

/** Empty state block. */
function emptyState($title = 'Nothing here yet', $text = '', $actionLabel = null, $actionHref = null)
{
    $btn = '';
    if ($actionLabel && $actionHref) {
        $btn = '<a href="' . e($actionHref) . '" class="btn btn-primary btn-sm">' . e($actionLabel) . '</a>';
    }
    return '<div class="empty-state"><div class="empty-icon">' . icon('package', 28) . '</div>' .
           '<h3>' . e($title) . '</h3><p>' . e($text) . '</p>' . $btn . '</div>';
}

/** Pagination links. */
function pagination($p, $extra = [])
{
    if ($p['pages'] <= 1) return '';
    $html = '<nav class="pagination" aria-label="Pagination">';
    if ($p['current'] > 1) {
        $html .= '<a href="' . e(pageLink($p['current'] - 1, $extra)) . '">' . icon('chevron-left', 15) . '</a>';
    }
    $start = max(1, $p['current'] - 2);
    $end   = min($p['pages'], $p['current'] + 2);
    for ($i = $start; $i <= $end; $i++) {
        $html .= ($i === $p['current'])
            ? '<span class="active">' . $i . '</span>'
            : '<a href="' . e(pageLink($i, $extra)) . '">' . $i . '</a>';
    }
    if ($p['current'] < $p['pages']) {
        $html .= '<a href="' . e(pageLink($p['current'] + 1, $extra)) . '">' . icon('chevron-right', 15) . '</a>';
    }
    return $html . '</nav>';
}
