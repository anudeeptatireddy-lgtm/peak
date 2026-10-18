import { expect, test } from '@playwright/test';

for (const [path, title] of [
  ['/start', 'Start here'],
  ['/fix', 'Fix it'],
  ['/ship', 'Put it online'],
] as const) {
  test(`${path}: has a title, sources and a last-checked date`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await expect(page.locator('[data-last-checked]')).toContainText('Last checked:');
    const links = page.locator('#sources ~ ul a');
    expect(await links.count()).toBeGreaterThan(0);
    for (const href of await links.evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).href)))
      expect(href).toMatch(/^https:\/\//);
  });
}

test('/start follows the plan: setup, first build, habits, next', async ({ page }) => {
  await page.goto('/start');
  for (const h of [
    'What Claude Code is',
    'What you need',
    'Set it up',
    'Your first build',
    'Make it yours',
    'Helpful habits',
    'Next',
  ])
    await expect(page.getByRole('heading', { level: 2, name: h })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get a beginner-friendly prompt' })).toHaveAttribute(
    'href',
    '/scenes/confetti',
  );
});

test('/fix has every symptom with a copyable message, and the console steps', async ({ page }) => {
  await page.goto('/fix');
  expect(await page.locator('.copy-message').count()).toBeGreaterThanOrEqual(10);
  for (const h of [
    'The page is blank',
    'Nothing moves',
    /laggy or my laptop fan spins up/,
    'It looks wrong on my phone',
    'The colors look wrong in dark mode',
    'Text is hard to read',
    /Claude Code changed things I didn.t ask for/,
    'It worked, then broke after a change',
    /I don.t know how to open the file/,
    'I got an error message',
    'How to describe a problem',
    'How to open the browser console',
  ])
    await expect(page.getByRole('heading', { level: 2, name: h })).toBeVisible();
});

test('/ship has the three routes, easiest first', async ({ page }) => {
  await page.goto('/ship');
  const heads = await page.locator('.prose h2').allTextContents();
  const i = (s: string) => heads.findIndex((h) => h.includes(s));
  expect(i('Netlify')).toBeGreaterThanOrEqual(0);
  expect(i('Netlify')).toBeLessThan(i('GitHub Pages'));
  expect(i('GitHub Pages')).toBeLessThan(i('Ask Claude Code'));
});

test('a copy button copies exactly the message shown', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are a Chromium feature');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/ship');
  const box = page.locator('.copy-message').first();
  const shown = await box.locator('pre').textContent();
  await box.getByRole('button', { name: 'Copy message' }).click();
  await expect(box.locator('[data-copy-status]')).toHaveText('Message copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(shown);
});
