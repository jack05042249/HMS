const { Talent, Organization } = require('../models')
const moment = require('moment')
const axios = require('axios')
const API_KEY = '31d99944b8c9f9030fb18217f78f5c8f010dff1876c0a559f860c08ca872b5b5'
const apiUrl = 'https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1viktl72bvl7bjuj0&include_errors=true'
const MAX_RETRIES = 200 // 200 x 5 seconds = 1000 seconds
const DELAY_MS = 5000 // 5 seconds

function isLinkedInProfileUrl(url) {
  // This regex matches LinkedIn profile URLs with Unicode characters in the username
  return /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-À-ÿ\u00C0-\u024F\u1E00-\u1EFF%]+\/?$/iu.test(url);
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const linkedinStatusCheck = async () => {
  const talents = await Talent.findAll()
  let organizations = await Organization.findAll({
    attributes: ['name']
  })
  organizations.push('Commit Offshore')
  console.log(`Found ${talents.length} talents and ${organizations.length} organizations.`)
  let proxyNeeded = []
  for (const talent of talents) {
    if (talent.linkedinProfileChecked) continue;
    // Check LinkedIn status for each talent


    if (talent.linkedinComment !== 'Profile url is not valid') continue;
    console.log('````````````````````````````````');
    if (talent.inactive) {
      talent.linkedinProfileChecked = false
      talent.linkedinComment = 'Talent is inactive'
      talent.linkedinProfileDate = moment().format()
      await talent.save()
      continue
    }
    const url = talent.linkedinProfile
    if (url && isLinkedInProfileUrl(url)) {
      // if (talent.email == 'zheniarudchik@gmail.com') {
      console.log(url, '*******************************', apiUrl)
      const data = JSON.stringify([{ url: url }])
      let SNAPSHOT_ID = null
      await axios
        .post(apiUrl, data, {
          headers: {
            Authorization: 'Bearer ' + API_KEY,
            'Content-Type': 'application/json'
          }
        })
        .then(function (response) {
          SNAPSHOT_ID = response.data.snapshot_id
        })
        .catch(function (error) {
          talent.linkedinProfileChecked = false
          console.error('Error making the request: ' + error.message)
        })
      console.log('Snapshot ID:', SNAPSHOT_ID)
      if (!SNAPSHOT_ID) {
        talent.linkedinProfileChecked = false;
        talent.linkedinComment = 'No snapshot ID found in response';
        console.error('❌ No snapshot ID found in response:', response.data)
      } else {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            console.log(`⏳ Attempt ${attempt}: Fetching snapshot data...`)

            const response = await axios.get(
              `https://api.brightdata.com/datasets/v3/snapshot/${SNAPSHOT_ID}?format=json`,
              {
                headers: {
                  Authorization: `Bearer ${API_KEY}`
                },
                timeout: 15000 // 15s timeout to avoid hanging
              }
            )

            if (response.status === 200 && response.data.length > 0) {
              console.log('✅ Snapshot is ready! Data:')
              let data = response.data[0]
              // console.log('Data:', data);

              if (data.experience && data.experience.length > 0) {
                let presentNum = 0
                let lastCompany = ''
                data.experience.forEach(exp => {
                  // console.log('positions', exp.positions);
                  let prePos = false;
                  if (exp.start_date == null && exp.positions && exp.positions.length > 0) {
                    exp.positions.forEach(pos => {
                      if (pos.end_date == null || pos.end_date === 'Present') {
                        prePos = true;
                      }
                    })
                    if (prePos) {
                      lastCompany = exp.company ? exp.company.replace(/[^a-zA-Z0-9\s]/g, '').trim() : ''
                      presentNum ++;
                    }
                  } else if (exp.start_date != null &&  (exp.end_date == null || exp.end_date === 'Present')) {
                    presentNum++
                    lastCompany = exp.company ? exp.company.replace(/[^a-zA-Z0-9\s]/g, '').trim() : ''
                  }
                })
                console.log('Present Number:', presentNum, 'Last Company:', lastCompany)
                if (presentNum === 1) {
                  let flag = 0
                  organizations.map(org => {
                    if (org.name) {
                      org.name = org.name.replace(/[^a-zA-Z0-9\s]/g, '').trim()
                      if (lastCompany.toLowerCase().includes(org.name.toLowerCase())) {
                        flag = 1
                      }
                    }
                  })
                  if (flag) {
                    talent.linkedinProfileChecked = true
                    talent.linkedinComment = 'Confirmed by COMS';
                  } else {
                    talent.linkedinComment = 'NOT MATCHING by COMS'
                    talent.linkedinProfileChecked = false
                  }
                } else {
                  presentNum == 0 ? talent.linkedinComment = 'NOT Employed' : talent.linkedinComment = 'More than one present company'
                  talent.linkedinProfileChecked = false
                }
                console.log('Experience checked:', lastCompany);
              } else if (data.current_company && data.current_company.name) {
                let currentCompanyName = data.current_company.name.replace(/[^a-zA-Z0-9\s]/g, '').trim()
                let flag = 1
                organizations.map(org => {
                  if (org.name) {
                    org.name = org.name.replace(/[^a-zA-Z0-9\s]/g, '').trim()
                    if (currentCompanyName.toLowerCase().includes(org.name.toLowerCase())) {
                      flag = 0
                    }
                  }
                })
                if (flag) {
                  talent.linkedinProfileChecked = false
                  talent.linkedinComment = 'NOT MATCHING by COMS'
                  console.log('❌ Current company not found in organizations:', currentCompanyName)
                } else {
                  talent.linkedinProfileChecked = false;
                  talent.linkedinComment = 'Profile is not public'
                  proxyNeeded.push(talent)
                  console.log(proxyNeeded.length, talent.fullName, '--------------------', talent.linkedinProfile)
                }
              } else if (data.warning_code && data.warning_code === 'dead_page') {
                talent.linkedinProfileChecked = false
                talent.linkedinComment = "Profile is dead or not accessible"
                console.log('⚠️ Dead Page:', talent.fullName, 'URL:', talent.url)
              } else {
                talent.linkedinProfileChecked = false
                talent.linkedinComment = "Profile is not public"
                proxyNeeded.push(talent)
                console.log(proxyNeeded.length, talent.fullName, '--------------------', talent.linkedinProfile)
              }
              break // Exit the retry loop on success
            } else {
              console.log('⚠️ Snapshot not ready yet (empty response), retrying...')
            }
          } catch (err) {
            talent.linkedinProfileChecked = false
            talent.linkedinComment = 'Profile is not public'
            proxyNeeded.push(talent)
            console.log(`⚠️ Error on attempt ${attempt}: ${err.message}`);
            break;
          }
          // Wait before next try
          await delay(DELAY_MS)
        }
      }
    } else {
      talent.linkedinComment = "Profile url is not valid"
      talent.linkedinProfileChecked = false
    }
    talent.linkedinProfileDate = moment().format()
    await talent.save()
  }
  console.log(proxyNeeded.length, 'proxyNeeded.length')
  // proxyNeeded.map((i, talent) => {
  //   const sessionId = `session-${i + 1}`

  //   const browser = chromium.launch({
  //     headless: true,
  //     proxy: {
  //       server: `http://${PROXY_HOST}:${PROXY_PORT}`,
  //       username: `${PROXY_USER}-${sessionId}`,
  //       password: PROXY_PASS
  //     },
  //     args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  //   })
  //   const browsercontext = browser.newContext({
  //     userAgent:
  //       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  //       '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
  //     viewport: { width: 1280, height: 800 },
  //     locale: 'en-US',
  //     deviceScaleFactor: 1,
  //     isMobile: false,
  //     hasTouch: false
  //   })
  //   browsercontext.addCookies([
  //     {
  //       name: 'li_at',
  //       value: LI_AT,
  //       domain: '.linkedin.com',
  //       path: '/',
  //       httpOnly: true,
  //       secure: true,
  //       sameSite: 'Lax'
  //     }
  //   ])
  //   const page = browsercontext.newPage()
  //   try {
  //     console.log(`📄 Scraping ${url}`)
  //     page.goto(url, { waitUntil: 'domcontentloaded', timeout: 200000 })
  //     page.waitForTimeout(5000) // Wait for the page to load
  //     let presentCompany = page.evaluate(() => {
  //       const companyElements = document.querySelectorAll('li.UKjiyRIZvOvdFsmmUeAJMHKloPTPxiDYQrjI')
  //       let presentCompany = []

  //       companyElements &&
  //         companyElements.forEach(element => {
  //           const periods = Array.from(element.querySelectorAll('span.pvs-entity__caption-wrapper'))
  //           if (periods && periods.some(period => period.textContent.trim().toLowerCase().includes('present'))) {
  //             let name = ''
  //             if (periods.length > 1) {
  //               name = element.querySelector(
  //                 'div > div.display-flex.flex-column.align-self-center.flex-grow-1 > div.display-flex.flex-row.justify-space-between > a > div > div > div > div > span:nth-child(1)'
  //               )
  //             } else {
  //               name = element.querySelector(
  //                 'div > div.display-flex.flex-column.align-self-center.flex-grow-1 > div.display-flex.flex-row.justify-space-between > a > span:nth-child(2) > span:nth-child(1)'
  //               )
  //             }
  //             if (name) presentCompany.push(name.textContent.trim().replace(/\s+/g, ' '))
  //           }
  //         })
  //       console.log(companyElements && companyElements.length, ' -- ', presentCompany.length)
  //       return presentCompany
  //     })
  //     console.log(presentCompany.length, ' -- ', presentCompany)
  //     let lastCompany = ''
  //     if (presentCompany.length == 1) {
  //       if (organizations.some(org => presentCompany[0].toLowerCase().includes(org.name.toLowerCase()))) {
  //         lastCompany = presentCompany[0]
  //       }
  //     }
  //     console.log(`Last company for ${talent.fullName} is: ${lastCompany}`)
  //     if (lastCompany) {
  //       talent.linkedinProfileChecked = true
  //     } else {
  //       talent.linkedinProfileChecked = false
  //     }
  //   } catch (err) {
  //     console.error(`❌ Failed to scrape ${url}:`, err.message)
  //   } finally {
  //     browser.close()
  //     new Promise(r => setTimeout(r, 3000)) // Sleep between requests
  //   }
  //   talent.linkedinProfileDate = moment().format()
  //   talent.save()
  // })
}

module.exports = {
  linkedinStatusCheck
}
