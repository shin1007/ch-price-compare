# Chrome Web Store materials

## Listing draft

### Short description

Compare box prices and shipping costs, then find the lowest unit price at a glance.

### Japanese description

箱入り商品の価格・送料・入り数を入力すると、支払総額と1個あたり単価を自動計算します。候補を追加でき、最安候補を強調表示。転置表示と横向き表示を切り替えられます。

### English description

Compare boxed products by item price, shipping, pack size, and number of boxes. The extension calculates the total paid and price per item, highlights the lowest unit price, and supports both vertical and wide comparison layouts.

### Category

Shopping

### Suggested keywords

price comparison, unit price, shopping, shipping cost, calculator, 価格比較, 単価計算

## Privacy practices

### Single purpose

**日本語**

箱入り商品の価格・送料・入り数・箱数を入力し、支払総額と1個あたりの単価を計算して、候補の中で最も安い単価を比較・表示することだけを目的とした拡張機能です。

**English**

This extension has a single purpose: to compare boxed products by calculating the total paid and the price per item from the item price, shipping cost, pack size, and number of boxes entered by the user, and to highlight the candidate with the lowest unit price.

### Permission justification

#### `storage`

**日本語**

ポップアップを閉じても入力途中の比較内容（価格・送料・入り数・箱数・リンク）が消えないよう、`chrome.storage.session` に一時保存するために使用します。データはブラウザのセッション中のみ端末内に保持され、ブラウザを終了すると削除されます。外部への送信は一切行いません。

**English**

Used to keep the values the user has entered (item price, shipping, pack size, number of boxes, and links) in `chrome.storage.session`, so the comparison is not lost when the popup is closed. The data stays on the device only for the current browser session and is cleared when the browser is closed. No data is ever sent anywhere.

### Host permissions

None requested.

### Remote code

No. All JavaScript is bundled in the extension package; no remote code is loaded or executed.

### Data usage

- No user data is collected or transmitted.
- Entered values are stored only locally in `chrome.storage.session` and are removed when the browser session ends.
- Certifications: data is not sold to third parties, not used for purposes unrelated to the single purpose, and not used to determine creditworthiness or for lending.

## Localization

- Popup UI: ja, en, zh, hi, es, fr, ar (RTL), bn, pt, ru, ko — chosen from the browser language, English fallback
- Store name/description: `_locales/*/messages.json` (default_locale: ja)

## Assets

- Extension icon source: `icon.svg` (calculator motif, 128x128 viewBox)
- Extension/store icon: `icon.png` (128x128, opaque background)
- Layout follows `AGENT_INPUT_SPEC.md`: everything lives under `store/assets/` (icon, tiles, per-locale description and screenshots); `store/package.zip` is the built package
- Screenshots (1280x800, 24-bit PNG, no alpha)
  - `assets/locales/ja/screenshots/01.png`: unit price calculation and lowest-price highlighting
  - `assets/locales/ja/screenshots/02.png`: switched layout
  - `assets/locales/ja/screenshots/03.png`: 7 candidates after adding
  - `assets/locales/en/screenshots/01.png`: English UI
- Small promo tile: `store/assets/promo-tile-440x280.png`
- Marquee promo tile: `store/assets/marquee-1400x560.png`
- Sample data uses `example.com` links and fictional prices only.

## Screenshot capture checklist

1. Load the unpacked extension from `chrome://extensions`.
2. Open the popup at its largest available size.
3. Enter representative values in at least three candidates.
4. Capture the vertical and wide layouts without browser chrome.
5. Verify that no personal product links or prices appear in the images.