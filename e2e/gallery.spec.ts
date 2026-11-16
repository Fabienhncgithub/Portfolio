import { expect, test } from "@playwright/test";

const photoUrl = /\/photo\/[^/]+$/;

test("opens a photograph, steps with the keyboard and returns to the gallery", async ({ page }) => {
  await page.goto("/");

  const firstPhoto = page.locator("a[data-photo-slug]").first();
  const firstSlug = await firstPhoto.getAttribute("data-photo-slug");
  await firstPhoto.click();
  await expect(page).toHaveURL(new RegExp(`/photo/${firstSlug}$`));
  await expect(page.locator("[data-photo-page]")).toHaveAttribute("data-photo-slug", firstSlug ?? "");

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(photoUrl);
  await expect(page).not.toHaveURL(new RegExp(`/photo/${firstSlug}$`));

  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(new RegExp(`/photo/${firstSlug}$`));

  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("a[data-photo-slug]").first()).toBeVisible();
});

test("reaches the contact page from the navigation", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Contact" })
    .click();

  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("link", { name: /@/ })).toHaveAttribute("href", /^mailto:/);
});

test("redirects the removed archive page to the gallery", async ({ page }) => {
  const response = await page.goto("/archive");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/$/);
});

test("serves a styled 404 for unknown photographs", async ({ page }) => {
  const response = await page.goto("/photo/does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found." })).toBeVisible();
});
