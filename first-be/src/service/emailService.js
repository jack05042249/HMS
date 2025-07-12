const nodemailer = require('nodemailer')
const moment = require('moment')
const { config } = require('../config')
const { codeToCountry, countryToCode } = require('../constants/countries')
const { FEEDBACK_STATUS } = require('../constants/feedback.const')
const { gmail_user, gmail_pass, gmail_cc, gmail_hr, gmail_reminders } = config
const { logger } = require('../utils/logger')
const { Talent } = require('../models')
const crypto = require('crypto')
const axios = require('axios')
const dotenv = require('dotenv');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID
const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`

const { OpenAI } = require('openai')
const openai = new OpenAI({ apiKey: process.env.openaiKey })

async function generatePostcardBackground(fullName, years, type) {
  const prompt =
    type === 'birthday'
      ? `Create a professional birthday greeting card with the following design elements:

Layout: Split vertically into two sections:

Left side: white background

Right side: solid red background (#C32C1D)

Top-Left: Company logo with bold black and red text ("COMMIT" in black and "OFFSHORE" in a red box beneath it).

Left Side Content:

Centered square headshot image of the employee

Below the image: Large, bold employee name (black text)

Thin light gray horizontal line under the name

Right Side Content:

Top-right corner: “Happy Birthday!” in large, bold, white text

Below: A birthday message, starting with “Dear ${fullName},” in bold white text

Message should use a friendly, professional tone, in white text, left-aligned, using a clean sans-serif font

Styling Details:

Subtle drop shadow around the photo and text for depth

Generous padding and spacing to avoid visual clutter

Font should be modern sans-serif (e.g., Montserrat or Lato)`
      : `Design a professional work anniversary postcard using Commit Offshore brand colors (blue and white). Include the text: “🎉 Congratulations on ${years} years with Commit Offshore, ${firstName}! #CommitOffshore” overlaid on the design. Keep the layout celebratory and clean.`
  // const chatResponse = await openai.chat.completions.create({
  //     model: 'gpt-4o',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: 'You are a professional prompt engineer. Refine the user\'s image prompt to be highly detailed and well-structured for DALL·E 3 image generation.',
  //       },
  //       {
  //         role: 'user',
  //         content: prompt,
  //       }
  //     ],
  //     temperature: 0.7,
  //   });

  //   console.log(`Refined prompt: ${chatResponse.choices[0].message.content}`);

  // const refinedPrompt = chatResponse.choices[0].message.content.trim();
  const refinedPrompt = `Design a professional square birthday greeting card, 1024×1024 pixels.

Layout: Vertically split into two equal halves:

Left side (white background, 512px wide):

In the top-left corner, reserve space (do not render any text or image) for a company logo. Size of reserved box: 180×60 pixels, positioned at 40px from the top and 40px from the left.

In the center of the left panel, place a gray placeholder box to represent a photo. The placeholder should be a rounded rectangle (250×250 pixels), positioned at 240px from the top and 131px from the left, with a subtle drop shadow to show depth.

Below the photo placeholder, write the employee name: ${fullName} in large bold black font, centered horizontally.

Add a thin light-gray horizontal line under the name, about 312px wide, aligned with the center, placed at 560px from the top.

Right side (solid red background: #C32C1D, 512px wide):

In the top-right corner, display the greeting:
“Happy Birthday!” in large bold white text.

Below, left-aligned white text with spacing and padding:

rust
Dear ${fullName},
Wishing you a wonderful birthday and a fantastic year ahead.

Thank you for your hard work and dedication.  
We're grateful to have you on our team!
Use a clean, professional sans-serif font (like Montserrat or Lato).

Ensure generous padding, good line spacing, and visually balanced layout. All text should remain within the 512px right panel.

Style notes:

Use flat design with subtle drop shadows only on the photo placeholder.

No decorative elements, no real photo, and no logo — placeholders only.

Prioritize clarity, alignment, and modern typography.

`
  const res = await openai.images.generate({
    model: 'gpt-image-1',
    prompt : refinedPrompt,
    size: '1024x1024',
    n: 1,
    quality: 'standard',
  })

  return res.data[0].url
}

async function composePostcard(aiBackgroundBuffer, talentPhotoBase64, logoPath) {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  // Load background (AI generated)
  const background = await loadImage(aiBackgroundBuffer);
  console.log('background', background);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Load company logo
  console.log('dirname ---> ', __dirname);
  const logo_Path = path.resolve(__dirname, logoPath);
  console.log('logo_path --> ', logo_Path);
  const logo = await loadImage('/home/hms/HMS/first-be/src/public/commit_logo.png');
  ctx.drawImage(logo, canvas.width - 180, 30, 150, 75);

  // Load talent photo from base64
  const base64Data = talentPhotoBase64.split(',')[1]; // remove "data:image/jpeg;base64,"
  const talentBuffer = Buffer.from(base64Data, 'base64');
  console.log('talentPhoto', talentBuffer);
  const talentImg = await loadImage(talentBuffer);
  console.log('talentImg', talentImg);
  ctx.drawImage(talentImg, 40, canvas.height - 240, 180, 180); // bottom-left corner

  return canvas.toBuffer('image/png');
}

async function downloadImageToBuffer(imageUrl) {
  console.log('imageUrl', imageUrl);
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  console.log('downloaded image', response);
  return Buffer.from(response.data, 'binary');
}


function savePostcardToPublic(buffer, filename) {
  console.log(buffer, ' --- ', filename);
  const filePath = path.join(__dirname, '../public', `${filename}.png`);
  console.log('filePath', filePath);

  // Make sure folder exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  fs.writeFileSync(filePath, buffer);
  return `https://coms.commit-offshore.com/public/${filename}.png`;
}

async function generateFinalPostcard({
  firstName,
  years,
  type,
  photoBase64,
}) {
  const aiUrl = await generatePostcardBackground(firstName, years, type);
  const bgBuffer = await downloadImageToBuffer(aiUrl);

  const finalBuffer = await composePostcard(
    bgBuffer,
    photoBase64,
    '../public/commit_logo.png'
  );

  const uploadedUrl = savePostcardToPublic(
    finalBuffer,
    `postcard_${firstName.replace(/\s+/g, '_')}_${Date.now()}`
  );

  return uploadedUrl;
}

const transporter = nodemailer.createTransport({
  pool: true,
  service: 'gmail',
  maxConnections: 10,
  auth: {
    user: gmail_user,
    pass: gmail_pass
  }
})

const sendResetPassword = async email => {
  const token = crypto.randomBytes(32).toString('hex')
  const resetLink = `https://coms.commit-offshore.com/talent/reset-password?token=${token}`
  console.log(resetLink)
  await Talent.update({ resetToken: token, resetTokenExpiry: Date.now() + 36000000 }, { where: { email } })
  const mailOptions = {
    from: gmail_user,
    to: email,
    cc: 'benjamin1993112@gmail.com',
    subject: `Password Reset for ${email}`,
    text: `Click the link to reset your password: ${resetLink}`
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(`Error sending reset password email: ${error}`)
    } else {
      logger.info(`Reset password email sent: ${info.response}`)
    }
  })
}

const getDateFormat = (startDate, endDate) => {
  if (moment(endDate).diff(moment(startDate), 'month') > 1) {
    return `${moment(startDate).format('YYYY MMMM')} to ${moment(endDate).format('MMMM')}`
  }
  return `${moment(startDate).format('MMM Do YYYY')} to ${moment(endDate).format('MMM Do YYYY')}`
}

const getContentPerCountry = (countriesArr, holidaysInfo) => {
  return countriesArr.map(country => {
    const { holidays, talents } = holidaysInfo[countryToCode[country]]
    const isSingleHoliday = holidays.length === 1
    const isSingleTalent = talents.length === 1
    return (
      `<div style='font-size: 14px'>
            <p style='margin-bottom: 20px;'>There will be a national holiday in ${country}, <strong>${talents.join(
        ', '
      )}</strong> will be observing them.</p>
            <p> <strong> Holidays are as following: </strong> </p>
            <ul style="margin-bottom: 20px;">` +
      holidays
        .map(
          item =>
            `<li style='margin-bottom: 10px;'> <span style='color: #4D4AEA'>${moment(item.date).format(
              'MMM Do YYYY'
            )}</span> ${item.name}.</li>`
        )
        .join('') +
      `</ul>
        </div>`
    )
  })
}

const sendHolidaysEmail = async (data, startDate, endDate) => {
  const { fullName, email, ...rest } = data
  const countriesArr = Object.keys(rest).map(code => codeToCountry[code])
  // const html = `<div>
  //     <p>Dear ${fullName},</p>
  //     <p>
  //         I hope this email finds you well. This is a reminder about the upcoming national holidays in <strong>${countriesArr.join(', ')}</strong>.
  //     </p>
  //     ${getContentPerCountry(countriesArr, rest).join(' ')}
  //     <p>
  //         Please note that these holidays are observed nationwide, and most businesses and government offices will be closed on these days. <br />
  //         I hope this reminder assists you in effectively organizing your schedule. Should you have any inquiries, please feel free to contact me without hesitation.
  //     </p>
  //     <p>Best regards, ITSOFT team.</p>
  // </div>`;
  const cidLogo = 'itsoft_logo@unique'
  const cidStakeholderMail = 'itsoft_stakeholderMail@unique'
  const itsoftMail = 'sales@itsoft.co.il'
  const itsoftLink = 'www.itsoft.co.il'
  const html = `
    <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    </head>
    <div style='padding-top: 25px; margin: 0 auto; padding-left: 95px; padding-right: 95px; font-size: 14px; width: 600px;'>
    <img src='cid:${cidLogo}' alt='ITSOFT_LOGO'>
    <div style='margin: 0 auto;'>
        <img style='margin: 0 auto; display: block;'  src='cid:${cidStakeholderMail}' alt='ITSOFT_STAKEHOLDERMAIL'>
    </div>
    <div style='width: 600px; margin-top: 80px; font-family: "Poppins", sans-serif;'>
        <p style='margin-bottom: 20px'>Dear <strong>${fullName}</strong>,</p>
        <p style='margin-bottom: 20px'>I hope this email finds you well. This is a reminder about the upcoming national holidays in ${countriesArr.join(
          ', '
        )}</p>
        ${getContentPerCountry(countriesArr, rest).join(' ')}
        <p style='margin-bottom: 20px;'>Please note that these holidays are observed nationwide, and most businesses and government offices will be closed on these days.</p>
        <p style='margin-bottom: 20px'>I hope this reminder assists you in effectively organizing your schedule. Should you have any inquiries, please feel free to contact me without hesitation.</p>
        <span style='margin-bottom: 1px'>Best regards</span>
        <p style='margin-bottom: 20px'> <strong> Commit Offshore </strong> </span>
        <footer style='background-color: #4D4AEA; color: #F5F5F5; font-size: 12px;  width: 100%; height: 55px; text-align: center;'>
        <div style='margin: auto 0; '>
          <p style='text-align: center;'> <span> +972 545 937 383 </span> | <span>  <a style='color: #F5F5F5;'>${itsoftMail}</a> </span>  </p>
          <p style='text-align: center;'> <span> <a style='color: #F5F5F5;'>${itsoftLink}</a> </span> </p>
        </div>
        </footer>
    </div>
</div>
`
  const mailOptions = {
    from: { address: gmail_user, name: 'Commit Offshore Holidays Reminder System' },
    to: email,
    subject: `National Holidays from ${getDateFormat(startDate, endDate)}`,
    cc: gmail_cc,
    html,
    contentDisposition: 'inline',
    attachments: [
      {
        contentDisposition: 'inline',
        filename: 'itsoft_logo.png',
        path: 'src/public/itsoft_logo.png',
        cid: cidLogo
      },
      {
        contentDisposition: 'inline',
        filename: 'itsoft_stakeholderMail.png',
        path: 'src/public/itsoft_stakeholderMail.png',
        cid: cidStakeholderMail
      }
    ]
  }
  await sendMail(mailOptions)
}

const sendMail = async mailOptions => {
  return transporter
    .sendMail(mailOptions)
    .then(info => {
      console.log(`${moment().format('DD/MM/YYYY')} - Done, message was sent to `, mailOptions.to)
    })
    .catch(error => {
      logger(`Error on send EMAIL: `, { error, mailOptions })
      console.error(error)
      console.error(`Message WAS NOT sent to ${mailOptions.to}`)
    })
}

const isImageFile = filename => {
  const regex = /[^\\s]+(\.(jpe?g|png|gif|bmp)$)/i
  return regex.test(filename)
}

const sendCustomersMail = async (toEmail, subject, text, file) => {
  const cid = `${Date.now()}_unique_cid`
  const html = `
    <div style='width: 100%;'>
       <div style='margin: 0 auto; display: inline-block; text-align: left;'>
          ${text} 
       </div>
       <div style='max-width: 800px; margin: 0 auto; max-height: 650px'>
         <img src="cid:${cid}" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
       </div>
    </div>
`

  const mailOptions = {
    from: { address: gmail_user, name: 'Commit Offshore Notifications' },
    to: toEmail,
    subject: subject,
    html
  }
  if (file) {
    const isImage = isImageFile(file.originalname)
    if (isImage) {
      mailOptions.attachments = [
        {
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
          cid: cid,
          contentDisposition: 'inline'
        }
      ]
    } else {
      mailOptions.attachments = [
        {
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
          contentDisposition: 'attachment'
        }
      ]
    }
  }

  await sendMail(mailOptions)
}
const sendTalentCredentialMail = async (talent, password, mailCase) => {
  const cidLogo = 'commit_logo@unique'
  const cidStakeholderMail = 'itsoft_stakeholderMail@unique'
  const itsoftMail = 'sales@itsoft.co.il'
  const itsoftLink = 'www.itsoft.co.il'
  let html
  if (mailCase === 'create') {
    html = `
     <div style='padding-top: 25px; margin: 0 auto; padding-left: 95px; padding-right: 95px; font-size: 14px; width: 600px;'>
    <img style = 'width: 50%' src='cid:${cidLogo}' alt='COMMIT_LOGO'>
    <div style='margin: 0 auto;'>
        <img style='margin: 0 auto; display: block;'  src='cid:${cidStakeholderMail}' alt='ITSOFT_STAKEHOLDERMAIL'>
    </div>
    <div style='width: 600px; margin-top: 80px; font-family: "Poppins", sans-serif;'>
        <p style='margin-bottom: 20px'>Dear <strong>${talent.fullName}</strong>,</p>
        <p style='margin-bottom: 20px'>Welcome to COMS. Please see below the credentials to login to the system here:</p>
        <p style='margin-bottom: 5px;'>Login: ${talent.email}</p>
        <p style='margin-bottom: 1px'>Password: ${password}</p>
        <p style='margin-bottom: 5px'> The link to the COMS profile: <a style="text-decoration: underline; color: #15c" href="https://coms.commit-offshore.com/talent/login" target="_blank">https://coms.commit-offshore.com/talent/login</a>  </p>
        <p style='margin-bottom: 5px'> You can find the COMS Tutorial <a style="text-decoration: underline; color: #15c" href="https://www.notion.so/commit-offshore/COMS-Tutorial-3a1d3c965ee741ff97f7be1381aa40d6?source=copy_link" target="_blank"> here </a> </p>
        <span style='margin-bottom: 1px'>Best regards</span>
        <p style='margin-bottom: 20px'> <strong> Commit Offshore team </strong> </span>
        <footer style='background-color: #4D4AEA; color: #F5F5F5; font-size: 12px;  width: 100%; height: 55px; text-align: center;'>
        <div style='margin: auto 0; '>
          <p style='text-align: center;'> <span> +972 545 937 383 </span> | <span>  <a style='color: #F5F5F5;'>${itsoftMail}</a> </span>  </p>
          <p style='text-align: center;'> <span> <a style='color: #F5F5F5;'>${itsoftLink}</a> </span> </p>
        </div>
        </footer>
    </div>
</div>
        `
  } else if (mailCase === 'update') {
    html = `
     <div style='padding-top: 25px; margin: 0 auto; padding-left: 95px; padding-right: 95px; font-size: 14px; width: 600px;'>
    <img src='cid:${cidLogo}' alt='ITSOFT_LOGO'>
    <div style='margin: 0 auto;'>
        <img style='margin: 0 auto; display: block;'  src='cid:${cidStakeholderMail}' alt='ITSOFT_STAKEHOLDERMAIL'>
    </div>
    <div style='width: 600px; margin-top: 80px; font-family: "Poppins", sans-serif;'>
        <p style='margin-bottom: 20px'>Dear <strong>${talent.fullName}</strong>,</p>
        <p style='margin-bottom: 20px'>Your login credentials have been updated. Please see below the new credentials to login to the system here:</p>
        <p style='margin-bottom: 5px;'>Login: ${talent.email}</p>
        <p style='margin-bottom: 5px'>Password: ${password}</p>
        <span style='margin-bottom: 1px'>Best regards</span>
        <p style='margin-bottom: 20px'> <strong> Commit Offshore team </strong> </span>
        <footer style='background-color: #4D4AEA; color: #F5F5F5; font-size: 12px;  width: 100%; height: 55px; text-align: center;'>
        <div style='margin: auto 0; '>
          <p style='text-align: center;'> <span> +972 545 937 383 </span> | <span>  <a style='color: #F5F5F5;'>${itsoftMail}</a> </span>  </p>
          <p style='text-align: center;'> <span> <a style='color: #F5F5F5;'>${itsoftLink}</a> </span> </p>
        </div>
        </footer>
    </div>
</div>
        `
  }
  try {
    const mailOptions = {
      from: { address: gmail_user, name: 'Commit Offshore Notifications' },
      to: talent.email,
      subject: mailCase === 'create' ? 'Welcome to ITMS!' : 'Your password updated!',
      html,
      contentDisposition: 'inline',
      attachments: [
        {
          contentDisposition: 'inline',
          filename: 'commit_logo.png',
          path: 'src/public/commit_logo.png',
          cid: cidLogo
        },
        {
          contentDisposition: 'inline',
          filename: 'itsoft_stakeholderMail.png',
          path: 'src/public/itsoft_stakeholderMail.png',
          cid: cidStakeholderMail
        }
      ]
    }
    await sendMail(mailOptions)
  } catch (error) {
    console.log(error)
  }
}

const sendEmployeeNotificationOnVacationManipulate = async (toEmail, vacationData, talentName, informType) => {
  let html = ''
  const cidLogo = 'itsoft_logo@unique'
  const cidStakeholderMail = 'itsoft_stakeholderMail@unique'
  const itsoftMail = 'sales@itsoft.co.il'
  const itsoftLink = 'www.itsoft.co.il'

  switch (informType) {
    case 'approved':
      html = `
            <div style="width: 100%; text-align: center;">
    <div style="max-width: 900px; margin: 0 auto; text-align: left;">
            <img src='cid:${cidLogo}' alt='ITSOFT_LOGO'>
                <div style="max-width: 900px; text-align: center">
    <div style='margin: 0 auto;'>
        <img style='margin: 0 auto; display: block;'  src='cid:${cidStakeholderMail}' alt='ITSOFT_STAKEHOLDERMAIL'>
    </div>
                <p style='font-size: 24px'>Dear ${talentName}</p>
                <p style='font-size: 18px'>We are pleased to inform you that your vacation/sick leave/unpaid leave request has been approved.</p>
                <div style='margin: 0 auto; max-width: 800px; max-height: 650px; padding: 20px;'>
                  <p style='font-size: 18px'>
                    Details of your approved vacation request:
                  </p>
                  <p style='font-size: 16px'>
                    Type of request: ${vacationData.type} leave
                  </p>
                  <p style='font-size: 16px'>
                    Start Date: ${moment(vacationData.startDate).format('DD-MM-YYYY')}
                  </p>
                  <p style='font-size: 16px'>
                    End Date: ${moment(vacationData.endDate).format('DD-MM-YYYY')}
                  </p>
                </div>
                <p style='font-size: 18px'>We wish you a wonderful and refreshing vacation!</p>
                 <p style='font-size: 14px'>
                  <span style="display: block">Best regards,</span>
                  <span style="display: block">Sona Baghdasaryan</span>
                  <span style="display: block">Head of HR</span>
                 </p>
                <footer style='background-color: #4D4AEA; color: #F5F5F5; font-size: 12px;  width: 100%; height: 55px; text-align: center;'>
        <div style='margin: auto 0; '>
          <p style='text-align: center;'> <span> +972 545 937 383 </span> | <span>  <a style='color: #F5F5F5;'>${itsoftMail}</a> </span>  </p>
          <p style='text-align: center;'> <span> <a style='color: #F5F5F5;'>${itsoftLink}</a> </span> </p>
        </div>
        </footer>
              </div>
            </div>
            </div>
            `
      break

    case 'rejected':
      html = `
            <div style="width: 100%; text-align: center;">
    <div style="max-width: 900px; margin: 0 auto; text-align: left;">
            <img src='cid:${cidLogo}' alt='ITSOFT_LOGO'>
                <div style="max-width: 900px; text-align: center">
    <div style='margin: 0 auto;'>
        <img style='margin: 0 auto; display: block;'  src='cid:${cidStakeholderMail}' alt='ITSOFT_STAKEHOLDERMAIL'>
    </div>
                <p style='font-size: 24px'>Dear ${talentName}</p>
                <p style='font-size: 18px'>We regret to inform you that your vacation request has been denied.</p>
                <div style='margin: 0 auto; max-width: 800px; max-height: 650px; padding: 20px;'>
                  <p style='font-size: 18px'>
                     Details of your denied vacation request:
                  </p>
                  <p style='font-size: 16px'>
                    Type of request: ${vacationData.type} leave
                  </p>
                  <p style='font-size: 16px'>
                    Start Date: ${moment(vacationData.startDate).format('DD-MM-YYYY')}
                  </p>
                  <p style='font-size: 16px'>
                    End Date: ${moment(vacationData.endDate).format('DD-MM-YYYY')}
                  </p>
                </div>
                <p style='font-size: 18px'>If you have any questions or concerns, please feel free to reach out to our HR department.</p>
                 <p style='font-size: 14px'>
                  <span style="display: block">Best regards,</span>
                  <span style="display: block">Sona Baghdasaryan</span>
                  <span style="display: block">Head of HR</span>
                 </p>
                <footer style='background-color: #4D4AEA; color: #F5F5F5; font-size: 12px;  width: 100%; height: 55px; text-align: center;'>
        <div style='margin: auto 0; '>
          <p style='text-align: center;'> <span> +972 545 937 383 </span> | <span>  <a style='color: #F5F5F5;'>${itsoftMail}</a> </span>  </p>
          <p style='text-align: center;'> <span> <a style='color: #F5F5F5;'>${itsoftLink}</a> </span> </p>
        </div>
        </footer>
              </div>
            </div>
            </div>
            `
      break
  }
  try {
    const mailOptions = {
      from: { address: gmail_user, name: 'Commit Offshore Notifications' },
      to: toEmail,
      subject: 'Notification regarding your vacation request',
      html,
      contentDisposition: 'inline',
      attachments: [
        {
          contentDisposition: 'inline',
          filename: 'itsoft_logo.png',
          path: 'src/public/itsoft_logo.png',
          cid: cidLogo
        },
        {
          contentDisposition: 'inline',
          filename: 'itsoft_stakeholderMail.png',
          path: 'src/public/itsoft_stakeholderMail.png',
          cid: cidStakeholderMail
        }
      ]
    }
    await sendMail(mailOptions)
  } catch (error) {
    console.error(error)
  }
}
const sendMailToEmployeeOnChangeVacationBalance = async (toEmail, balanceData, talentName) => {
  const html = `
    <div>
       <p style='font-size: 24px'>Dear ${talentName}</p>
       <p style='font-size: 20px'>We hope this email finds you well. We are pleased to inform you that your vacation balance has been increased.</p>
       <div style='margin: 0 auto; max-width: 800px; max-height: 650px; padding: 20px;'>
         <b style='font-size: 18px'>New Vacation Balance Details:</b>
         <p style='font-size: 16px'>Vacation days: ${balanceData.vacationDays}</p>
         <p style='font-size: 16px'>Sick days: ${balanceData.sickDays}</p>
         <p style='font-size: 16px'>Unpaid leave days: ${balanceData.unpaidDays}</p>
       </div>
    </div>
`
  try {
    const mailOptions = {
      from: { address: gmail_user, name: 'Commit Offshore Notifications' },
      to: toEmail,
      subject: 'Your vacation balances was increased',
      html
    }
    await sendMail(mailOptions)
  } catch (error) {
    console.error(error)
  }
}

const sendTalentBirthdaysToHR = async (talentsList, { monthName, dayNumber }) => {
  const talentsBlock = talentsList
    .map(async (user, i) => {
        console.log('name', user.fullName)
      const imageUrl = await generateFinalPostcard({
        firstName: user.fullName,
        years: 0,
        type: 'birthday',
        photoBase64: user.picture
      })

      const payload = {
        chat_id: CHAT_ID,
        caption: `🎉 Happy Birthday, ${user.telegram ? user.telegram : user.fullName}! #CommitOffshore`,
        photo: imageUrl // Must be publicly accessible
      }

      console.log('payload', payload);

      try {
        const res = await axios.post(url, payload)
        console.log('Postcard sent:', res.data)
      } catch (err) {
        console.error('Telegram error:', err.response?.data || err.message)
      }

      return `<div>${i + 1}.&nbsp;${user.fullName} (Birthday: ${moment(user.birthday).format('D MMMM')})<br />Email: ${
        user.email
      }</div>`
    })
    .join('')

  const html = `
    <div>
    <p>Hi, Sona!</p>
    <p>These employees have theirs birthdays in 1 day:</p>
    ${talentsBlock}
    </div>`

  const mailOptions = {
    from: { address: gmail_user, name: 'Commit Offshore  Holidays Reminder System' },
    to: gmail_reminders,
    subject: 'Upcoming talent birthdays in 1 day',
    cc: gmail_cc,
    html
  }

  //   await sendMail(mailOptions)
}

const sendCustomerBirthdaysToHR = async (customersList, { monthName, dayNumber }) => {
  const customerBlock = customersList
    .map((user, i) => `<div>${i + 1}.&nbsp;<span>&nbsp;${user.fullName}</span><div>Email: ${user.email}</div></div>`)
    .join('')

  const html = `
    <div>
    <p>Hi, Sona!</p>
    <p>These customers have theirs birthdays in 1 day:</p>
    ${customerBlock}
    </div>`

  const mailOptions = {
    from: { address: gmail_user, name: 'Commit Offshore Holidays Reminder System' },
    to: gmail_reminders,
    subject: `Upcoming customer birthdays for in 1 day`,
    cc: gmail_cc,
    html
  }

  //   await sendMail(mailOptions);
}

const sendTalentsAnniversaryToHR = async talentsList => {
  const today = moment()

  const talentsBlock = talentsList
    .map(async (talent, i) => {
      const start = moment(talent.startDate)
      const today = moment()
      let years = today.year() - start.year()

      if (today.format('MM-DD') < start.format('MM-DD')) {
        years -= 1
      }

      const count = years + 1

      const imageUrl = `https://example.com/path/to/image/${talent.id}.png`

      const payload = {
        chat_id: CHAT_ID,
        caption: `🎉 Congratulations on ${count} years with Commit Offshore, ${
          talent.telegram ? talent.telegram : talent.fullName
        }! #CommitOffshore`,
        photo: imageUrl // Must be publicly accessible
      }

      try {
        const res = await axios.post(url, payload)
        console.log('Postcard sent:', res.data)
      } catch (err) {
        console.error('Telegram error:', err.response?.data || err.message)
      }

      return `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${talent.fullName}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${count} years</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${talent.email}</td>
            </tr>
        `
    })
    .join('')

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hi, Sona!</p>
        <p>These employees have their anniversaries in 5 days:</p>
        <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
            <thead>
                <tr style="background-color: #f4f4f4;">
                    <th style="padding: 8px; border: 1px solid #ddd;">#</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Full Name</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Anniversary</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Email</th>
                </tr>
            </thead>
            <tbody>
                ${talentsBlock}
            </tbody>
        </table>
        <p style="margin-top: 20px;">Best Regards,<br><strong>ITSOFT Holidays Reminder System</strong></p>
    </div>
    `

  const mailOptions = {
    from: { address: gmail_user, name: 'Commit Offshore Holidays Reminder System' },
    to: gmail_hr,
    subject: `Anniversary for ${today.add(5, 'days').format('DD')} ${today.format('MMMM')}`,
    cc: gmail_cc,
    html
  }

  //   await sendMail(mailOptions)
}

const sendFeedbackEmail = async (talent, link, type) => {
  let html = ''
  const cidLogoFeedback = 'itsoft_logoFeedback@unique'
  const cidFeedback = 'itsoft_feedbackMail@unique'
  const itsoftMail = 'sales@itsoft.co.il'
  const itsoftLink = 'www.itsoft.co.il'

  let subject = ''

  switch (type) {
    case FEEDBACK_STATUS.SENT:
      subject = `${talent.fullName},  Request for Your Valuable Feedback`
      html = `
    <head>
        <link rel='preconnect' href='https://fonts.googleapis.com'>
        <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>
        <link href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap' rel='stylesheet'>
    </head>
    <div style='padding-top: 25px; margin: 0 auto; padding-left: 95px; padding-right: 95px; font-size: 14px; width: 600px;'>
    <img src='cid:${cidLogoFeedback}' alt='ITSOFTFEEDBACK_LOGO'>
    <div style='margin: 0 auto;'>
        <img style='margin: 0 auto; display: block;'  src='cid:${cidFeedback}' alt='ITSOFT_FEEDBACKMAIL'>
    </div>
    <div style='width: 600px; margin-top: 80px; font-family: "Poppins", sans-serif; text-align: center'>
        <p style='margin-bottom: 20px; text-align: center;'>Dear <strong>${talent.fullName}</strong>,</p>
        <p style='margin-bottom: 20px; text-align: center;'>We kindly request you to take a few moments to fill out the feedback form.</p>
        <a href="${link}" 
    style="
        display: inline-block; 
        background: #4D4AEA; 
        color: #fff; 
        padding: 10px 20px; 
        text-align: center; 
        text-decoration: none; 
        border-radius: 5px; 
        font-family: 'Poppins', sans-serif; 
        font-weight: bold;
        width: 215px;
    " 
    target="_blank">
    Leave Your Feedback Now
</a>
        <p style='margin-bottom: 20px'> Your input is highly appreciated, and it will contribute significantly to our ongoing efforts to improve and provide better services. </p>
        <p style='margin-bottom: 20px;'>Thank you for your time and valuable contribution.</p>
        <span style='margin-bottom: 1px'>Best regards,</span>
        <p style='margin-bottom: 20px'> <strong> Commit Offshore team </strong> </span>
        <footer style='background-color: #4D4AEA; color: #F5F5F5; font-size: 12px;  width: 100%; height: 55px; text-align: center;'>
        <div style='margin: auto 0; '>
          <p style='text-align: center;'> <span> +972 545 937 383 </span> | <span>  <a style='color: #F5F5F5;'>${itsoftMail}</a> </span>  </p>
          <p style='text-align: center;'> <span> <a style='color: #F5F5F5;'>${itsoftLink}</a> </span> </p>
        </div>
        </footer>
    </div>
</div>
`
      break
    case FEEDBACK_STATUS.RESENT:
      subject = `${talent.fullName}, Friendly Reminder: Your Feedback is Important to Us`
      html = `
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel='preconnect' href='https://fonts.googleapis.com'>
        <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>
        <link href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap' rel='stylesheet'>
    </head>
    <div style='padding-top: 25px; margin: 0 auto; padding-left: 95px; padding-right: 95px; font-size: 14px; width: 600px;'>
    <img src='cid:${cidLogoFeedback}' alt='ITSOFTFEEDBACK_LOGO'>
    <div style='margin: 0 auto;'>
        <img style='margin: 0 auto; display: block;'  src='cid:${cidFeedback}' alt='ITSOFT_FEEDBACKMAIL'>
    </div>
    <div style='width: 600px; margin-top: 80px; font-family: "Poppins", sans-serif; text-align: center'>
        <p style='margin-bottom: 20px; text-align: center;'>Dear <strong>${talent.fullName}</strong>,</p>
        <p style='margin-bottom: 20px; text-align: center;'>I hope this email finds you well. We appreciate your commitment to ITSoft and value your input in helping us enhance our services.</p>
        <p style='margin-bottom: 20px; text-align: center'>We noticed that you haven't had a chance to fill out the feedback form yet. Your feedback is crucial to our continuous improvement efforts, and we would greatly appreciate it if you could spare a few minutes to share your thoughts. </p>
        <p style='margin-bottom: 20px; text-align: center;'>Please click on the button link to access the form</p>
<p style='margin-bottom: 20px; text-align: center;'>
    <a href="${link}" 
        style="
            display: inline-block; 
            background: #4D4AEA; 
            color: #fff; 
            padding: 10px 20px; 
            text-align: center; 
            text-decoration: none; 
            border-radius: 5px; 
            font-family: 'Poppins', sans-serif; 
            font-weight: bold;
            width: 215px;
        " 
        target="_blank">
        Leave Your Feedback Now
    </a>
</p>        <p style='margin-bottom: 20px'> We thank you in advance for taking the time to provide your feedback. If you have any questions or need assistance, please feel free to reach out. </p>
        <p style='margin-bottom: 20px;'>Thank you for your cooperation.</p>
        <span style='margin-bottom: 1px'>Best regards,</span>
        <p style='margin-bottom: 20px'> <strong> Commit Offshore team </strong> </span>
        <footer style='background-color: #4D4AEA; color: #F5F5F5; font-size: 12px;  width: 100%; height: 55px; text-align: center;'>
        <div style='margin: auto 0; '>
          <p style='text-align: center;'> <span> +972 545 937 383 </span> | <span>  <a style='color: #F5F5F5;'>${itsoftMail}</a> </span>  </p>
          <p style='text-align: center;'> <span> <a style='color: #F5F5F5;'>${itsoftLink}</a> </span> </p>
        </div>
        </footer>
    </div>
</div>
`
      break
  }

  const mailOptions = {
    from: { address: gmail_user, name: 'ITSOFT Feedback System' },
    to: talent.email,
    subject: subject,
    html,
    attachments: [
      {
        filename: 'itsoft_logo.png',
        path: 'src/public/itsoft_logo.png',
        cid: cidLogoFeedback,
        contentDisposition: 'inline'
      },
      {
        filename: 'feedback_img.png',
        path: 'src/public/feedback_img.png',
        cid: cidFeedback,
        contentDisposition: 'inline'
      }
    ]
  }

  await sendMail(mailOptions)
}

const sendTalentListToAdminOnNovember = async talentsList => {
  let html
  if (talentsList.length >= 1) {
    const talentsBlock = talentsList
      .map(
        (user, i) =>
          `<div>${i + 1}&nbsp;<span>&nbsp;Full Name: ${user.fullName}</span><span>Email: ${user.email}</span></div>`
      )
      .join('')
    html = `
        <div>
          <p>Hi, Sona!</p>
          <p>These talents still have 10 or more vacation days unused:</p>
          ${talentsBlock}
        </div>`
  } else {
    html = `
        <div>
          <p>Hi, Sona!</p>
          <p>As of November 1, there are no talents with 10 or more unused vacation days</p>
        </div>`
  }

  const mailOptions = {
    from: { address: gmail_user, name: 'Commit Offshore Holidays Reminder System' },
    to: gmail_hr,
    subject: `Talents still have more then 10 vacation days`,
    cc: gmail_cc,
    html
  }

  await sendMail(mailOptions)
}

module.exports = {
  sendHolidaysEmail,
  sendCustomersMail,
  sendEmployeeNotificationOnVacationManipulate,
  sendMailToEmployeeOnChangeVacationBalance,
  sendTalentCredentialMail,
  sendTalentBirthdaysToHR,
  sendTalentsAnniversaryToHR,
  sendFeedbackEmail,
  sendTalentListToAdminOnNovember,
  sendCustomerBirthdaysToHR,
  sendResetPassword
}
