import { chromium, type Page, type BrowserContext } from '@playwright/test';
import path from 'node:path';

export const extensionPath = path.resolve(process.cwd(), 'extensions/phantom');

export class MultiContextHelper {
  private static adminContext: BrowserContext | null = null;
  private static userContext: BrowserContext | null = null;
  private static adminPage: Page | null = null;
  private static userPage: Page | null = null;

  static async initializeAdmin(): Promise<void> {
    if (!this.adminContext) {
      this.adminContext = await chromium.launchPersistentContext(
        'phantom-profile-admin',
        {
          headless: false,
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            '--disable-gpu-shader-disk-cache',
            '--disk-cache-dir=/dev/null',
            '--media-cache-dir=/dev/null',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disk-cache-size=0',
          ],
        },
      );
    }

    if (!this.adminPage) {
      const pages = this.adminContext.pages();
      const firstPage = pages[0];
      this.adminPage = firstPage ? firstPage : await this.adminContext.newPage();
    }
  }

  static async initializeUser(): Promise<void> {
    if (!this.userContext) {
      this.userContext = await chromium.launchPersistentContext(
        'phantom-profile-user',
        {
          headless: false,
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            // Disable caching to keep profile size small
            '--disable-gpu-shader-disk-cache',
            '--disk-cache-dir=/dev/null',
            '--media-cache-dir=/dev/null',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disk-cache-size=0',
          ],
        },
      );
    }

    if (!this.userPage) {
      const pages = this.userContext.pages();
      const firstPage = pages[0];
      this.userPage = firstPage ? firstPage : await this.userContext.newPage();
    }
  }

  static async initializeBoth(): Promise<void> {
    await Promise.all([this.initializeAdmin(), this.initializeUser()]);
  }

  static async getAdminPage(): Promise<Page> {
    if (!this.adminPage) {
      throw new Error('Admin page not initialized. Call initializeAdmin() first');
    }
    return this.adminPage;
  }

  static async getUserPage(): Promise<Page> {
    if (!this.userPage) {
      throw new Error('User page not initialized. Call initializeUser() first');
    }
    return this.userPage;
  }

  static async getAdminContext(): Promise<BrowserContext> {
    if (!this.adminContext) {
      throw new Error('Admin context not initialized. Call initializeAdmin() first');
    }
    return this.adminContext;
  }

  static async getUserContext(): Promise<BrowserContext> {
    if (!this.userContext) {
      throw new Error('User context not initialized. Call initializeUser() first');
    }
    return this.userContext;
  }

  static async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];

    if (this.adminContext) {
      cleanupPromises.push(this.adminContext.close());
      this.adminContext = null;
      this.adminPage = null;
    }

    if (this.userContext) {
      cleanupPromises.push(this.userContext.close());
      this.userContext = null;
      this.userPage = null;
    }

    await Promise.all(cleanupPromises);
  }
}

