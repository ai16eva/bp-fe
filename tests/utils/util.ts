import { chromium, type Page, type BrowserContext } from "@playwright/test";
import path from "node:path";

export const extensionPath = path.resolve(process.cwd(), "extensions/phantom");

export class PageHelper {
  private static context: BrowserContext | null = null;
  private static page: Page | null = null;

  static async initialize(): Promise<void> {
    if (!this.context) {
      this.context = await chromium.launchPersistentContext("phantom-profile", {
        headless: false,
        args: [
          `--disable-extensions-except=${extensionPath}`,
          `--load-extension=${extensionPath}`,
        ],
      });
    }

    if (!this.page) {
      const pages = this.context.pages();
      const firstPage = pages[0];
      this.page = firstPage ? firstPage : await this.context.newPage();
    }
  }

  static async getPage(): Promise<Page> {
    if (!this.page) {
      throw new Error("Page not initialized. Call initialize() first");
    }
    return this.page;
  }

  static async newPage(): Promise<Page> {
    if (!this.context) {
      throw new Error("Context not initialized. Call initialize() first");
    }
    return await this.context.newPage();
  }

  static async getContext(): Promise<BrowserContext> {
    if (!this.context) {
      throw new Error("Context not initialized. Call initialize() first");
    }
    return this.context;
  }

  static async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
      this.page = null;
    }
  }
}
