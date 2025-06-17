const { Talent } = require('../models')
const moment = require('moment')
const { chromium } = require("playwright");

const linkedinStatusCheck = async () => {
  const talents = await Talent.findAll()

  for (const talent of talents) {
    // Check LinkedIn status for each talent
    if (talent.inactive) {
      talent.linkedinProfileChecked = false
      talent.linkedinProfileDate = moment().format()
      await talent.save()
      continue
    }
    const url = talent.linkedinProfile
    if (url) {
      // Perform LinkedIn profile check
      const browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
      })

      const browsercontext = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        locale: 'en-US',
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false
      })

      let page = await browsercontext.newPage()

      // Optional stealth tricks
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false })
        window.chrome = {
          runtime: {}
          // any more required props...
        }
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en']
        })
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] })
      })
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 200000 })
      try {
        await page.evaluate(() => {
          ;[...document.querySelectorAll('button, a')]
            .find(el => el.innerText.trim().toLowerCase() === 'sign in')
            .click()
        })
        await page.waitForTimeout(5000) // Wait for the modal to open
        await page.evaluate(() => {
          document.querySelector('input[name="session_key"]').value = 'Support@commit-offshore.com'
          document.querySelector('input[name="session_password"]').value = 'hzNZwif6NM2A'
          ;[...document.querySelectorAll('button, a')]
            .find(el => el.innerText.trim().toLowerCase() === 'sign in')
            .click()
        })
        await page.waitForTimeout(20000) // Wait for the sign-in to complete
        await page.waitForLoadState('domcontentloaded')

        console.log('✅ Successfully clicked the sign-in modal button.')
      } catch (error) {
        console.log('⚠️ Failed to click the sign-in modal button:', error.message)
      }
    } else {
      talent.linkedinProfileChecked = false
      talent.linkedinProfileDate = moment().format()
      await talent.save()
      continue
    }
  }
}

module.exports = {
  linkedinStatusCheck
}
