# ReUse Campus

**Smart Student Resource Exchange Platform** — Share More. Waste Less. Learn Together.

A complete, database-connected web application built with **HTML5, CSS3, Vanilla JavaScript, PHP 8+ and MySQL**. Students can list, donate, borrow, exchange and sell educational resources; request items; track exchanges; and admins can moderate the whole platform.

---

## ✨ Features

- **Public site** — premium responsive home page, marketplace explorer with search/filters/sort/grid+list views, item detail pages with gallery and rule-based recommendations, how-it-works, about and contact pages.
- **Authentication** — registration, login/logout, `password_hash()` / `password_verify()`, session auth, CSRF protection, forgot/reset password, email-verification architecture, profile management.
- **Student dashboard** — live overview statistics, my listings, my requests, incoming requests, saved items, exchange history, notifications and profile settings.
- **Listing system** — multiple images (validated uploads), categories, condition, exchange type, price, availability, pickup location, edit/remove.
- **Smart exchange workflow** — send / accept / reject / cancel / complete requests, expected return dates for borrowing, owner return confirmation, notifications for both parties, exchange history.
- **Rule-based matching** — scores recommendations by category, exchange preference, college and title keywords, and explains *why* an item is recommended. **No AI is used or claimed.**
- **Admin panel** — separate secure login, live statistics, student management (suspend/activate), listing moderation, report management, category CRUD, contact messages and platform analytics.
- **Security** — PDO prepared statements everywhere, CSRF tokens on all state-changing requests, role-based access control, server-side validation, file-type/size validation, XSS escaping via `e()`, authorization checks on every sensitive action.

---

## 📁 Project Structure

```
reuse-campus/
├── assets/
│   ├── css/style.css          # design system
│   ├── js/app.js              # shared interactions
│   ├── images/                # logo, placeholders, default avatar
│   └── uploads/               # user uploads (listings/, profiles/)
├── config/
│   ├── config.php             # constants, session, URL helpers
│   └── database.php           # PDO connection + query helpers
├── includes/
│   ├── header.php             # public header + navbar
│   ├── footer.php             # public footer + scripts
│   ├── navbar.php             # (navigation markup lives in header.php)
│   ├── app_header.php         # dashboard/admin shell
│   ├── app_footer.php
│   ├── auth.php               # authentication & RBAC
│   ├── functions.php          # shared helpers
│   ├── icons.php              # inline SVG icon sprite
│   ├── components.php         # listing cards, pagination, empty states
│   └── sidebar.php            # (sidebar markup lives in app_header.php)
├── admin/                     # admin panel pages
├── auth/                      # login, register, forgot, reset, verify, logout
├── dashboard/                 # student dashboard pages
├── listings/                  # create / edit listings
├── requests/                  # create request
├── profile/                   # profile settings
├── api/                       # AJAX + form action endpoints
├── database/schema.sql        # full schema + demo data
├── storage/                   # verification/reset link logs (demo)
├── index.php                  # home
├── explore.php                # marketplace
├── listing.php                # item details
├── how-it-works.php
├── about.php
├── contact.php
└── README.md
```

---

## 🚀 Installation (XAMPP)

1. **Install / start XAMPP** and start **Apache** and **MySQL**.

2. **Copy the folder** `reuse-campus/` into your XAMPP `htdocs` directory:
   ```
   C:\xampp\htdocs\reuse-campus
   ```

3. **Create the database.** Open `http://localhost/phpmyadmin`, click **Import**, choose
   `database/schema.sql` and click **Go**.
   (This creates the `reuse_campus` database, all tables and demo data.)
   - Or from the command line:
     ```
     mysql -u root -p < database/schema.sql
     ```

4. **Configure the database connection** (only if your MySQL credentials differ) in
   `config/database.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'reuse_campus');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   ```

5. **Make uploads writable.** Ensure PHP can write to:
   ```
   assets/uploads/
   assets/uploads/listings/
   assets/uploads/profiles/
   storage/
   ```
   On Windows/XAMPP this is normally fine. On Linux/macOS: `chmod 755` those folders.

6. **Open the app:** `http://localhost/reuse-campus/`

---

## 👤 Demo accounts

All demo accounts use the password: **`password`**

| Role | Email / Username | Password |
|------|------------------|----------|
| Student | `ayesha@student.edu` | `password` |
| Student | `tanvir@student.edu` | `password` |
| Student | `sadia@student.edu` | `password` |
| Admin | username `admin` | `password` |

The demo data includes 8 students, 8 categories, 10 listings, images, favorites, a pending request, a notification and a completed exchange so all dashboards show real data.

> Students' demo password hash is a bcrypt hash of `password`, generated with `password_hash()`. You can change any password after login via **Forgot password** (demo mode prints the reset link on screen) or directly in the database.

---

## 🔐 Security notes

- All database access uses **PDO prepared statements**.
- Passwords are stored using **`password_hash()`** and checked with **`password_verify()`**.
- Every POST endpoint verifies a **CSRF token** issued in a `<meta>` tag and included in every form.
- **RBAC**: student pages call `requireLogin()`, admin pages call `requireAdmin()`.
- Sensitive actions re-check ownership/role server-side (e.g. only an owner can accept a request).
- All output is escaped with `e()` (`htmlspecialchars`).
- Uploads are validated with `getimagesize()`, an allow-list of MIME types and a 5 MB size limit; stored with random filenames outside the public document root path.
- Student IDs, emails, phone numbers and profile details are **never** exposed on public listing pages.

---

## 📧 Email verification architecture

Since XAMPP has no mail server configured, verification and password-reset links are generated on the server and written to `storage/verification.log` and `storage/reset.log`. In demo mode the links are also displayed on screen. To enable real email delivery, replace `sendVerificationEmail()` / `sendPasswordResetEmail()` in `includes/auth.php` with an SMTP-based mailer; the token generation, storage and verification flow are already implemented.

---

## ☁️ Supabase (optional)

A PostgreSQL/Supabase version of the database is included under `supabase/`:
- `supabase/migrations/20261123000000_initial_schema.sql` — MySQL schema ported to Postgres
- `supabase/seed.sql` — the same demo data
- `config/database.php` supports `DB_DRIVER=pgsql` + `DATABASE_URL`

**MySQL/XAMPP remains the default and keeps working unchanged.** To move the database to Supabase, follow the full step-by-step guide in **[SUPABASE.md](SUPABASE.md)**. Hosted project creation/link/push requires your own Supabase login, and the PHP files must be hosted on a PHP 8+ server (Supabase does not execute PHP).

---

## 🧠 Matching engine

`matchListings()` in `includes/functions.php` implements a transparent, rule-based score:

| Rule | Score |
|------|-------|
| Same category | +40 |
| Same exchange preference | +25 |
| Same college | +20 |
| Title keyword overlap | +8 |

Recommendations are capped at 100 and shown with the reasons for each match. This is **not AI** — it is a deterministic rule engine.

---

## 🛠 Troubleshooting

- **"Database connection failed"** — check `config/database.php` and that MySQL is running in XAMPP.
- **Empty pages / 500 errors** — enable `display_errors` (already on in `config/config.php`) and check the exact message.
- **Images not showing** — verify the `assets/uploads/` folders exist and are writable, and that `database/schema.sql` was imported (demo images live in `assets/images/`).
- **Session issues** — ensure `session_start()` works and the `storage/` folder is writable.
- **CSRF error (419)** — refresh the page and resubmit; the token is per-session.

---

Built as a complete, functional project — no static mockups, no framework, no placeholder statistics. All dashboard numbers come from live MySQL queries.
