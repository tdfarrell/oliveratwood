# oliveratwood.com

Serial fiction by Oliver Atwood, in the **Paperback Shelf** style.

- You write at **oliveratwood.com/admin** (Sveltia CMS).
- Each save is stored in this GitHub repository.
- GitHub then rebuilds the site (Eleventy) and uploads it to Bluehost.
  Changes are live a minute or two after you save.

---

## One-time setup

### 1. Make an FTP account on Bluehost (5 min)
1. Log in to Bluehost and open **cPanel** (Advanced → cPanel).
2. Open **FTP Accounts** and create a new account:
   - **Log in:** `deploy` (it becomes `deploy@oliveratwood.com`)
   - **Password:** use the generator and copy it somewhere safe
   - **Directory:** `public_html` (or your domain's folder if oliveratwood.com
     is an add-on domain, e.g. `public_html/oliveratwood.com`)
3. On the same page, under **Special FTP Accounts** or **Configure FTP Client**,
   note the **FTP server** name (it looks like `box1234.bluehost.com` or
   `ftp.oliveratwood.com`).

### 2. Give GitHub the FTP details (5 min)
In this repository: **Settings → Secrets and variables → Actions →
New repository secret**. Add three:

| Name | Value |
|---|---|
| `FTP_SERVER` | the FTP server name from step 1.3 |
| `FTP_USERNAME` | e.g. `deploy@oliveratwood.com` |
| `FTP_PASSWORD` | the password from step 1.2 |

Then go to the **Actions** tab → **Publish to Bluehost** → **Run workflow**.
After a minute or two, oliveratwood.com shows the new site. (If the FTP account's
folder already had an old site in it, those files are left alone.)

### 3. Make your editor key (5 min)
1. On GitHub: your profile picture → **Settings → Developer settings →
   Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name it `oliveratwood editor`, pick an expiration (up to a year),
   **Repository access:** Only select repositories → `tdfarrell/oliveratwood`.
3. **Permissions → Repository permissions → Contents: Read and write.**
4. Generate, then copy the token (it's shown once).
5. Go to **oliveratwood.com/admin**, choose **Sign in with token**, paste it.

The editor remembers you on that browser. When the token expires, repeat these
steps and sign in again.

---

## Day-to-day writing

**Post a new serial installment:** /admin → **Serial Episodes → New**. Pick
the serial, set the part number and date, write, and save. Live in a minute or two.
Start a new serial under **Serials → New**.

**Short stories:** /admin → **Short Stories → New**. Complete, stand-alone
stories with no installments. Optional cover, spine color and genre.

**Poems:** /admin → **Poetry → New**. Type the poem exactly as it should
appear: every line break is kept, and a blank line starts a new stanza.
Optional dedication and epigraph.

**Blog posts:** /admin → **Blog → New**. For news, notes on writing, or
behind-the-scenes posts. Pick a serial under **About a serial** and the post
links to that story and appears on the story's page.

The menu only shows a section once it has something published in it.

**Drafts:** switch on **Draft** to save without publishing. Switch it off when ready.

**Covers:** in **Serials** (or **Short Stories**), open a story and upload a **Cover image**. Tall
2:3 images (about 1200 × 1800) look best. They're resized automatically. With
no cover, the site draws a classic three-band paperback cover.
Each episode can also have its own cover; leave it empty to use the story's.

**Spine color:** set per story. It colors that story's books on the shelf,
its page band and its drawn cover. Pick a color from the cover art.

**Scene breaks:** a line with just `---`.

**Site settings & About page:** under **Pages & Settings**. Paste a newsletter
signup link (Buttondown, Substack…) to swap the footer's RSS button for Subscribe.

**Undo anything:** every save is a commit in this repository's history.

---

## If something goes wrong
- **Saved, but the site didn't change:** open the **Actions** tab. A red ✗
  shows the reason. "Login authentication failed" means a secret is wrong.
  A timeout usually means Bluehost's firewall blocked GitHub; ask Bluehost
  support to allow FTP connections from GitHub Actions.
- **Editor says your token is invalid:** it expired. Make a new one (step 3).

## Where things live
| Path | What it is |
|---|---|
| `src/episodes/` | One Markdown file per installment |
| `src/stories/` | One Markdown file per serial |
| `src/short-stories/` | One Markdown file per short story |
| `src/poetry/` | One Markdown file per poem |
| `src/blog/` | One Markdown file per blog post |
| `src/images/uploads/` | Cover images and other uploads |
| `src/about.md` | About page |
| `src/_data/site.json` | Site title, tagline, newsletter link |
| `src/css/style.css` | All styling (colors at the top) |
| `src/_includes/` | Page templates |
| `src/admin/config.yml` | Editor fields |
| `src/static/.htaccess` | Bluehost settings (https, 404 page, caching) |
| `.github/workflows/deploy.yml` | Build and upload to Bluehost |

## Preview on your own computer (optional)
Requires Node.js 20+. Run `npm install`, then `npm start`, and open
http://localhost:8080.
