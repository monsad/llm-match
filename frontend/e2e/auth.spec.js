// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('LLM Model Advisor Authentication', () => {
  test('should allow user to register and login', async ({ page }) => {
    // Go to the register page
    await page.goto('/register');
    
    // Fill in registration form with random details to avoid conflicts
    const randomNum = Math.floor(Math.random() * 10000);
    const email = `test${randomNum}@example.com`;
    const username = `testuser${randomNum}`;
    const password = 'password123';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Should redirect to login page after successful registration
    await expect(page).toHaveURL(/login/);
    
    // Login with the new credentials
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify dashboard elements
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });
  
  test('should show error for invalid login', async ({ page }) => {
    // Go to the login page
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Should stay on login page and show error
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});

test.describe('LLM Model Recommendation Flow', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@llmadvisor.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });
  
  test('should navigate through recommendation questionnaire', async ({ page }) => {
    // Go to recommendation page
    await page.click('text=Get Recommendations');
    await expect(page).toHaveURL(/recommendations\/new/);
    
    // Verify questionnaire title
    await expect(page.locator('h1')).toContainText('Find the Perfect LLM Model');
    
    // Go through questionnaire
    // First question
    await page.click('text=Text Generation');
    await page.click('text=Next');
    
    // Second question
    await page.click('text=Medium');
    await page.click('text=Next');
    
    // Third question
    await page.click('text=Open Source');
    await page.click('text=Next');
    
    // Fourth question
    await page.click('text=Free');
    await page.click('text=Next');
    
    // Fifth question
    await page.click('text=English only');
    await page.click('text=Next');
    
    // Sixth question
    await page.click('text=Local deployment');
    await page.click('text=Get Recommendations');
    
    // Should redirect to recommendation results
    await expect(page).toHaveURL(/recommendations\/\d+/);
    
    // Verify results page
    await expect(page.locator('h1')).toContainText('Your LLM Model Recommendations');
    await expect(page.locator('text=Your Requirements')).toBeVisible();
    await expect(page.locator('text=Recommended Models')).toBeVisible();
  });
  
  test('should browse and filter models', async ({ page }) => {
    // Go to models page
    await page.click('text=Model Database');
    await expect(page).toHaveURL(/models/);
    
    // Verify models list page
    await expect(page.locator('h1')).toContainText('LLM Model Database');
    
    // Test search filter
    await page.fill('input[placeholder*="Search"]', 'GPT');
    await expect(page.locator('text=models found')).toBeVisible();
    
    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    
    // Test provider filter
    await page.selectOption('select[name="provider"]', { label: 'OpenAI' });
    await expect(page.locator('text=GPT')).toBeVisible();
    
    // Reset filters
    await page.click('text=Reset Filters');
    
    // View model details
    await page.locator('button:has-text("Details")').first().click();
    await expect(page).toHaveURL(/models\/\d+/);
    
    // Verify model details page
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=Technical Details')).toBeVisible();
  });
});

test.describe('Admin Functionality', () => {
  // Login as admin before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@llmadvisor.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });
  
  test('admin should be able to manage models', async ({ page }) => {
    // Navigate to admin models page
    await page.click('text=Manage Models');
    await expect(page).toHaveURL(/admin\/models/);
    
    // Verify admin models page
    await expect(page.locator('h1')).toContainText('Manage LLM Models');
    
    // Check if add model button exists
    await expect(page.locator('button:has-text("Add New Model")')).toBeVisible();
    
    // Verify model list is visible
    await expect(page.locator('table')).toBeVisible();
  });
});
