const { Talent, Organization } = require('../models')
const moment = require('moment')
const { chromium } = require('playwright')

const axios = require('axios')
const API_KEY = '685e3b2a640d9eec39199c4a'
const apiUrl = 'https://api.scrapingdog.com/linkedIn'

function getLinkIdFromLinkedInUrl(url) {
  // This regex matches the part after '/in/' and before the next '/' or end of string
  const match = url.match(/linkedin\.com\/in\/([^\/]+)/i);
  return match ? match[1] : null;
}

const linkedinStatusCheck = async () => {
  const talents = await Talent.findAll()
  let organizations = await Organization.findAll({
    attributes: ['name']
  })
  organizations.push('Commit Offshore')
  console.log(`Found ${talents.length} talents and ${organizations.length} organizations.`)
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
      if (talent.email == 'samvelgharibyan1996@gmail.com') {
        console.log(url, apiUrl)
        let linkId = getLinkIdFromLinkedInUrl(url)
        if (!linkId) {
          console.log('No linkId found in URL:', url)
          continue
        }

        console.log(linkId);
        let presentNum = 0, lastCompany = '';

        const params = {
          api_key: API_KEY,
          type: 'profile',
          linkId: linkId,
          private: 'false'
        }

        await axios
          .get(apiUrl, { params: params })
          .then(function (response) {
            if (response.status === 200) {
              const data = response.data;
              const experience = data[0].experience || [];

              console.log(experience);

              experience.map(exp => {
                if (exp.ends_at === null) {
                  presentNum = -1;
                  lastCompany = exp.company_name ? exp.company_name.replace(/[^a-zA-Z0-9\s]/g, '').trim() : '';
                } else if (exp.ends_at === 'Present') {
                  presentNum++;
                  lastCompany = exp.company_name ? exp.company_name.replace(/[^a-zA-Z0-9\s]/g, '').trim() : '';
                }
              });
              console.log('Present Number:', presentNum, 'Last Company:', lastCompany);

              if (presentNum == 1 || presentNum == -1) {
                if (organizations.some(org => lastCompany.toLowerCase().includes(org.name.toLowerCase()))) {
                  talent.linkedinProfileChecked = true;
                } else {
                  talent.linkedinProfileChecked = false;
                }
              } else {
                talent.linkedinProfileChecked = false;
              }
              console.log('LinkedIn profile checked:', talent.linkedinProfileChecked);
            } else {
              talent.linkedinProfileChecked = false;
              console.log('Request failed with status code: ' + response)
            }
          })
          .catch(function (error) {
            talent.linkedinProfileChecked = false;
            console.error('Error making the request: ' + error.message)
          })
      } else continue
    } else {
      talent.linkedinProfileChecked = false
    }
    if (talent.email == 'samvelgharibyan1996@gmail.com') {
      console.log(`Talent ${talent.name} LinkedIn profile checked: ${talent.linkedinProfileChecked}`);
    }
    talent.linkedinProfileDate = moment().format()
    await talent.save()
  }
}

module.exports = {
  linkedinStatusCheck
}
