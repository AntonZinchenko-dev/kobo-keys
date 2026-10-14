/**
 * Lighthouse CI runs this before every measured URL: the shop is behind the sign-in screen,
 * so we enter the demo account once — the session (localStorage + the mock backend's IndexedDB)
 * survives because `disableStorageReset` is on in lighthouserc.json.
 */
module.exports = async (browser, { url }) => {
  // The sign-in screen itself is measured signed out (it is the first URL in the list)
  if (url.endsWith('/login')) return;
  const page = await browser.newPage();
  const login = new URL('en/login', new URL('/kobo-keys/', url)).href;
  await page.goto(login, { waitUntil: 'networkidle0' });
  // Already signed in → the sign-in screen redirects to the shop and there is no button
  const button = await page.$('xpath/.//button[contains(., "Enter the demo account")]');
  if (button) {
    await button.click();
    await page.waitForFunction(() => !location.pathname.endsWith('/login'), { timeout: 15_000 });
  }
  await page.close();
};
