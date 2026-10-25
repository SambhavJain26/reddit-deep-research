import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:8080';
const OUTPUT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('[Capture] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // 1. Capture initial search interface
    console.log('[Capture] Capturing Initial Search Interface...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-initial-search-interface.png') });

    // 2. Type query and initiate search to capture active research stepper
    console.log('[Capture] Typing query and triggering search...');
    const searchInput = await page.$('input[placeholder*="Ask anything"], input[type="text"]');
    if (searchInput) {
      await searchInput.type('best productivity tools for remote engineers', { delay: 20 });
      await new Promise(r => setTimeout(r, 300));
    }
    const searchBtn = await page.$('button[type="submit"]');
    if (searchBtn) {
      await searchBtn.click();
    }

    // Wait 2.5 seconds for stepper animations
    await new Promise(r => setTimeout(r, 2500));
    console.log('[Capture] Capturing Active Research Stepper...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-active-research-stepper.png') });

    // 3. Wait for final research report to render
    console.log('[Capture] Waiting for report generation (up to 90s)...');
    try {
      await page.waitForSelector('.prose', { timeout: 90000 });
      await new Promise(r => setTimeout(r, 2000));

      // 3a. Capture the complete research report card (top-to-bottom containing full text + references)
      console.log('[Capture] Capturing Full Research Report Card...');
      const reportCard = await page.$('#research-report-card');
      if (reportCard) {
        await reportCard.screenshot({ path: path.join(OUTPUT_DIR, '03-research-report-results.png') });
      } else {
        await page.screenshot({ path: path.join(OUTPUT_DIR, '03-research-report-results.png'), fullPage: true });
      }

      // 3b. Scroll directly to the References / Community Sources section and capture focused viewport
      console.log('[Capture] Scrolling to Community Sources section...');
      await page.evaluate(() => {
        const sec = document.getElementById('community-sources-section');
        if (sec) {
          sec.scrollIntoView({ behavior: 'instant', block: 'center' });
        } else {
          window.scrollTo(0, document.body.scrollHeight);
        }
      });
      await new Promise(r => setTimeout(r, 1200));

      console.log('[Capture] Capturing Dedicated References Section...');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '04-research-report-references.png') });

    } catch (err) {
      console.warn('[Capture] Timeout waiting for report:', err.message);
    }

    // 4. Mobile responsive view
    console.log('[Capture] Capturing Mobile Responsive View...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-mobile-responsive-view.png') });

    console.log('[Capture] All screenshots captured successfully in docs/screenshots/');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('[Capture Error]', err);
  process.exit(1);
});
