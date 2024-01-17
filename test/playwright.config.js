import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
dotenv.config()

const { BASE_URL } = process.env

module.exports = defineConfig({
  testDir: './src',
  timeout: 1000 * 120,
  expect: {
      timeout: 1000 * 120
  },
  forbidOnly: false,
  retries: 0,
  workers: 2,
  reporter: 'list',
  use: {
    actionTimeout: 1000 * 30,
    navigationTimeout: 1000 * 30,
    baseURL: `${BASE_URL}`,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      slowMo: 1000,
      // The code bellow is helpful for debugging: https://playwright.dev/docs/api/class-logger
      // logger: {
      //   isEnabled: (name, severity) => true,
      //   log: (name, severity, message) => console.log(name, message)
      // }
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'chrome desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
})