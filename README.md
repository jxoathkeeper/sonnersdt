# sonnersdt — site layout

The GitHub Pages entry point is **`index.html` in the repository root**. It only loads the namegate.

```text
index.html                  First screen: namegate only
namegate/                   Namegate CSS, JS, direct-link check, inactive legacy backup
fornic/index.html           For Nic experience
fornic/scripts/             For Nic game logic / voice / shop code
fornic/sequences/           For Nic scene and sequence JavaScript
fornic/legacy/              Inactive -Nen backup JavaScript (not loaded)
fornic/style.css            For Nic styling
forlopati/index.html        For Lopati experience, pages 2–7 next to it
jordanspage/index.html      Jordan experience
assets/fornic/              All original For Nic image / sound / music / font / design assets
assets/forlopati/           All original For Lopati assets
assets/jordanspage/         Jordan's chapter icons
```

## Routing

Open `/` (or `/index.html`). Type **nic**, **lopati**, or **jordan**, then press Enter.
The namegate redirects to the corresponding experience and records that name in the current tab's `sessionStorage`. A direct link to a page without first passing through the matching namegate redirects back to the root gate. This is a client-side navigation convenience, *not* secure access control.

All shared/media paths are relative to their HTML/CSS document's URL, so this structure works at `username.github.io/sonnersdt/` and with a local HTTP server. VS Code Live Server is recommended for local testing.

To add assets, use the relevant subfolder under the single top-level `assets/` folder. To add For Nic scenes, put the scene script in `fornic/sequences/` and add its `<script>` tag to `fornic/index.html` (not the root `index.html`).

**Note:** For Lopati was taken as-is from the ZIP supplied in this chat; only resource links and the entry guard were changed. Its build/version has not been independently identified.

## Check file paths after edits

Run `python tools/verify_paths.py` from the repository folder to confirm that referenced HTML/CSS/media files are present. This checks static resource references, but cannot simulate every interaction.
