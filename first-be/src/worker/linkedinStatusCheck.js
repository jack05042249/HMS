const { last } = require('lodash')
const { Talent, Organization } = require('../models')
const moment = require('moment')
const { chromium } = require('playwright')

const linkedinStatusCheck = async () => {
  // Perform LinkedIn profile check
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  })
  console.log('LinkedIn status check started...')
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
console.log('Browser context created with custom user agent and viewport settings.')
   // Set the li_at cookie
  await browsercontext.addCookies([{
    name: 'li_at',
    value: 'AQEDAVwV3GECmeHgAAABl6EcghkAAAGXxSkGGU4ARgzP8iPB5jKumtn-nRWWZLWV1ZmpCh4LwCNHDyequXo2dgkM7KXB-y5Q2OslZ5YEUuFXVM3not9BMGpUqgBk8KD_Xy8pImarufSW7qG6soVjY5e3',
    domain: '.linkedin.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  }]);
console.log('Cookie li_at added to the browser context.')
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
   console.log('Stealth tricks applied to the page.')
  // await page.goto('https://www.linkedin.com', { waitUntil: 'domcontentloaded', timeout: 200000 })
//   try {
//     await page.evaluate(() => {
//       [...document.querySelectorAll('button, a')].find(el => el.innerText.trim().toLowerCase() === 'sign in').click();
//     })
//     await page.waitForTimeout(5000) // Wait for the modal to open
//     await page.evaluate(() => {
//       document.querySelector('input[name="session_key"]').value = 'nguyen.vc.2201@gmail.com';
//       document.querySelector('input[name="session_password"]').value = 'Hi!Nguyen?';
//       [...document.querySelectorAll('button, a')].find(el => el.innerText.trim().toLowerCase() === 'sign in').click()
//     })
//     await page.waitForTimeout(20000) // Wait for the sign-in to complete
//     await page.waitForLoadState('domcontentloaded')

//     console.log('✅ Successfully clicked the sign-in modal button.')
//   } catch (error) {
//     console.log('⚠️ Failed to click the sign-in modal button:', error.message)
//   }
  const talents = await Talent.findAll()
  let organizations = await Organization.findAll({
    attributes: ['name']
  })
  organizations.push('Commit Offshore');
  console.log(`Found ${talents.length} talents and ${organizations.length} organizations.`)
  for (const talent of talents) {
    // Check LinkedIn status for each talent
    if (talent.inactive) {
      talent.linkedinProfileChecked = false
      talent.linkedinProfileDate = moment().format()
      await talent.save()
      continue
    }
    const url = talent.linkedinProfile;
    if (url) {
        if (talent.email == 'tatyana.matlasch@gmail.com' || talent.email == 'mila@itsoft.co.il' || talent.email == 'sona@itsoft.co.il' || talent.email == 'derkonstantin@gmail.com') {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 200000 })
          await page.waitForTimeout(5000) // Wait for the page to load
          let presentCompany = await page.evaluate(() => {
            const companyElements = document.querySelectorAll('li.UKjiyRIZvOvdFsmmUeAJMHKloPTPxiDYQrjI');
            let presentCompany = [];

            companyElements && companyElements.forEach(element => {
              const periods = Array.from(element.querySelectorAll('span.pvs-entity__caption-wrapper'));
              if (periods && periods.some(period => period.textContent.trim().toLowerCase().includes('present'))) {
                let name = '';
                if (periods.length > 1) {
                  name = element.querySelector('div > div.display-flex.flex-column.align-self-center.flex-grow-1 > div.display-flex.flex-row.justify-space-between > a > div > div > div > div > span:nth-child(1)');
                } else {
                  name = element.querySelector('div > div.display-flex.flex-column.align-self-center.flex-grow-1 > div.display-flex.flex-row.justify-space-between > a > span:nth-child(2) > span:nth-child(1)');
                }
                if (name) presentCompany.push(name.textContent.trim().replace(/\s+/g, " "))
              }
            });
            console.log(companyElements && companyElements.length, ' -- ', presentCompany.length);
            return presentCompany;
          })
          console.log(presentCompany.length, ' -- ', presentCompany);
          let lastCompany = '';
          if (presentCompany.length == 1) {
            if (organizations.some(org => presentCompany[0].toLowerCase().includes(org.name.toLowerCase()))) {
              lastCompany = presentCompany[0];
            }
          }
          console.log(`Last company for ${talent.fullName} is: ${lastCompany}`);
          if (lastCompany) {
            talent.linkedinProfileChecked = true
          } else {
            talent.linkedinProfileChecked = false
          }
        } else continue
    } else {
      talent.linkedinProfileChecked = false
    }
    talent.linkedinProfileDate = moment().format()
    await talent.save()
  }
}

module.exports = {
  linkedinStatusCheck
}
