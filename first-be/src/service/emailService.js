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
const dotenv = require('dotenv')
const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const path = require('path')
const { Blob, File } = require('buffer')
const { OpenAI } = require('openai')

dotenv.config()
const openai = new OpenAI({ apiKey: process.env.openaiKey })

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`

async function composePostcard(talentPhotoBase64, logoPath, fullName, years, type) {
  const canvas = createCanvas(1024, 1536)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'lightgray'
  ctx.fillRect(0, 0, 512, 1536)
  ctx.fillStyle = '#C32C1D'
  ctx.fillRect(512, 0, 512, 1536)

  // Load company logo
  const logo_Path = path.resolve(__dirname, logoPath)
  const logo = await loadImage(logo_Path)
  ctx.drawImage(logo, 60, 80, 300, 150)

  // Draw drop shadow (optional)
  ctx.save()
  ctx.shadowColor = 'rgba(244, 244, 248, 1)' // soft blue shadow
  ctx.shadowBlur = 16
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 8


  // Load talent photo from base64
  if (talentPhotoBase64 && talentPhotoBase64.startsWith('data:image/')) {
    // const base64Data = talentPhotoBase64.split(',')[1] // remove "data:image/jpeg;base64,"
    // const talentBuffer = Buffer.from(base64Data, 'base64')
    // const talentImg = await loadImage(talentBuffer)
    // ctx.drawImage(talentImg, x, y, width, height)
  } else {
    // Draw rounded rectangle background for the image
    const x = 50,
      y = 300,
      width = 460,
      height = 460,
      radius = 32
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fillStyle = '#fff' // white background
    ctx.fill()
    ctx.restore()

    // Draw border (optional)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.lineWidth = 6
    ctx.strokeStyle = '#fff' // Commit blue border
    ctx.stroke()
    ctx.restore()

    // Draw the talent image clipped to rounded rectangle
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.clip()

    ctx.fillStyle = 'white'
    ctx.fillRect(x, y, width, height)
  }
  ctx.restore()
  // end of drawing talent photo

  // drawing fullName of talent Name

  // Split fullName
  const [firstLine, ...rest] = fullName.split(' ')
  const secondLine = rest.join(' ')

  // Draw first part (first line)
  ctx.font = 'bold 50px Montserrat, sans-serif'
  ctx.fillStyle = 'black'
  ctx.fillText(firstLine, 120, 1000)

  // Draw second part (second line, only if exists)
  if (secondLine) {
    ctx.fillText(secondLine, 120, 1060)

    // Draw underline under the second line
    ctx.lineWidth = 2
    ctx.strokeStyle = 'gray'
    ctx.beginPath()
    ctx.moveTo(100, 1100) // start X, Y
    ctx.lineTo(395, 1100) // end X, Y
    ctx.stroke()
  } else {
    // If no second line, draw underline under the first line
    ctx.lineWidth = 2
    ctx.strokeStyle = 'gray'
    ctx.beginPath()
    ctx.moveTo(100, 1140)
    ctx.lineTo(395, 1140)
    ctx.stroke()
  }
  // end of drawing talent's fullName

  ctx.font = 'bold 60px Impact, Verdana, sans-serif'
  ctx.fillStyle = 'white'
  if (type == 'birthday') {
    ctx.fillText(`Happy`, 580, 200)
    ctx.fillText(`Birthday!`, 580, 280)
  } else {
    ctx.fillText(`Happy`, 580, 200)
    ctx.fillText(`Anniversary!`, 580, 280)
  }
  ctx.font = 'bold 35px Impact, Verdana, sans-serif'
  ctx.fillText(`Dear ${fullName.split(' ')[0]},`, 580, 380)
  ctx.font = '30px Impact, Verdana, sans-serif'
  const message1 =
    type === 'birthday'
      ? `Wishing you a&wonderful birthday&and a fantastic&year ahead.`
      : `Wishing you ${years} years&work anniversary&and continued success.`
  const lines1 = message1.split('&')
  lines1.forEach((line, i) => {
    ctx.fillText(line, 580, 525 + i * 46) // 40px vertical spacing between lines
  })

  const message2 = `Thank you for your&hard work and&dedication. We're&grateful to have you&on our team!`
  const lines2 = message2.split('&')
  lines2.forEach((line, i) => {
    ctx.fillText(line, 580, 725 + i * 46) // 40px vertical spacing between lines
  })

  return canvas.toBuffer('image/png')
}
function savePostcardToPublic(buffer, filename) {
  const filePath = path.join(__dirname, '../public', `${filename}.png`)

  // Make sure folder exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true })

  fs.writeFileSync(filePath, buffer)
  return `https://coms.commit-offshore.com/public/${filename}.png`
}

async function generateMask(width, height, rect) {
  // rect: { x, y, w, h }
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'white'
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  return canvas.toBuffer('image/png')
}

async function refinePostcard(imgBuffer, firstName, type, photoBase64) {

  // Define the rectangle region to protect (example: left panel photo area)

    // Define the rectangle region to protect (example: left panel photo area)
  const maskRect = { x: 50, y: 400, w: 420, h: 450 }
  const maskBuffer = await generateMask(1024, 1536, maskRect)
  const maskBlob = new Blob([maskBuffer], { type: 'image/png' })
  const maskFile = new File([maskBlob], 'mask.png', { type: maskBlob.type })

  const imgBlob = new Blob([imgBuffer], { type: 'image/png' })
  const file = new File([imgBlob], 'image.png', { type: imgBlob.type })
  let isImageFile = false
  if (photoBase64 && photoBase64.startsWith('data:image/')) isImageFile = true
  // const talentBuffer = Buffer.from(base64Data, 'base64')
  // const talentImg = await loadImage(talentBuffer)
  //  ctx.drawImage(talentImg, x, y, width, height)
  let refinedPrompt = '';
  if (type == 'birthday') {
    refinedPrompt =
      isImageFile
        ? `This image shows postcard for congratulating employee's birthday.
    Please redesign this birthday greeting image so that the text block is consistently aligned and constrained to the same width as the 'Happy Birthday!' title. Maintain a clean, balanced look by adjusting line breaks so that each line fills the same approximate width, avoiding short or overly long lines. Ensure the overall design (balloons, background color, and confetti) stays festive and professional.

    And decorate the underline on the bottom of the fullName of employee on left side.

    Decorate the postcard with tasteful and festive birthday-themed elements. For each generation, vary the decoration style—for example, use different combinations of balloons, confetti, streamers, ribbons, sparkles, or birthday icons. Change the layout, decoration density, and placement subtly per card. Use a rotating color palette that aligns with our company branding but allows for creative variations. Ensure the design stays professional, clean, and celebratory. 
    Keep the greeting content clearly readable, and do not obstruct the logo or the main image.

    Add a small note tag in the bottom right corner inside a light semi-transparent rounded rectangle. The tag should say: 'Note: ${firstName}. We appreciate your hard work and dedication. Have a wonderful year ahead!' in a clean, sans-serif font and if the content is cut via low height, please increase the height more containing the whole texts of note tag.
 
    You must ensure the note tag's rounded rectangle is fully inside of the whole square by reducing the content of tag and font size.
` : `This image shows postcard for congratulating employee's birthday.
    Please redesign this birthday greeting image so that the text block is consistently aligned and constrained to the same width as the 'Happy Birthday!' title. Maintain a clean, balanced look by adjusting line breaks so that each line fills the same approximate width, avoiding short or overly long lines. Ensure the overall design (balloons, background color, and confetti) stays festive and professional.

    Please insert a cheerful 25-year-old male/female cartoon Starfleet officer(concerning to fullName : ${firstName}) celebrating him/her birthday, in a simplified Star Trek: Enterprise-inspired uniform with colored piping randomly with orange/blue bg. 
    Then the cartoon Starfleet officer is smiling with a colorful party hat, surrounded by confetti and birthday decorations. Style: playful, modern 2D cartoon illustration. but not overly childish. Place it in the white square in the middle of left panel as where the photo would be, inside the same frame or layout.
    
    And decorate the underline on the bottom of the fullName of employee on left side.

    Decorate the postcard with tasteful and festive birthday-themed elements. For each generation, vary the decoration style—for example, use different combinations of balloons, confetti, streamers, ribbons, sparkles, or birthday icons. Change the layout, decoration density, and placement subtly per card. Use a rotating color palette that aligns with our company branding but allows for creative variations. Ensure the design stays professional, clean, and celebratory. 
    Keep the greeting content clearly readable, and do not obstruct the logo or the main image.

    Add a small note tag in the bottom right corner inside a light semi-transparent rounded rectangle. The tag should say: 'Note: ${firstName}. We appreciate your hard work and dedication. Have a wonderful year ahead!' in a clean, sans-serif font and if the content is cut via low height, please increase the height more containing the whole texts of note tag.

    You must ensure the note tag's rounded rectangle is fully inside of the whole square by reducing the content of tag and font size.
`
  } else {
    refinedPrompt = `This image shows postcard for congratulating employee's anniversary.
    Please redesign this anniversary greeting image so that the text block is consistently aligned and constrained to the same width as the 'Happy anniversary!' title. Maintain a clean, balanced look by adjusting line breaks so that each line fills the same approximate width, avoiding short or overly long lines. Ensure the overall design (balloons, background color, and confetti) stays festive and professional.

    If ${isImageFile} is false, please insert a cheerful 25-year-old male/female cartoon Starfleet officer(concerning to fullName : ${firstName}) celebrating him/her anniversary, in a simplified Star Trek: Enterprise-inspired uniform with colored piping randomly with orange/blue bg. 
    Then the cartoon Starfleet officer is smiling with a colorful party hat, surrounded by confetti and anniversary decorations. Style: playful, modern 2D cartoon illustration. but not overly childish. Place it in the white square in the middle of left panel as where the photo would be, inside the same frame or layout.
    If ${isImageFile} is true, place the photo on the postcard without altering its content, adjusting only the overall size to fit the postcard dimensions. Use a soft, neutral background that blends well with the postcard’s design, and subtly blur it if needed to keep the focus on the person.
    
    And decorate the underline on the bottom of the fullName of employee on left side.

    Decorate the postcard with tasteful and festive anniversary-themed elements. For each generation, vary the decoration style—for example, use different combinations of balloons, confetti, streamers, ribbons, sparkles, or anniversary icons. Change the layout, decoration density, and placement subtly per card. Use a rotating color palette that aligns with our company branding but allows for creative variations. Ensure the design stays professional, clean, and celebratory. 
    Keep the greeting content clearly readable, and do not obstruct the logo or the main image.

    Add a small note tag in the bottom right corner inside a light semi-transparent rounded rectangle. The tag should say: 'Note: ${firstName}. We appreciate your hard work and dedication. Have a wonderful year ahead!' in a clean, sans-serif font and if the content is cut via low height, please increase the height more containing the whole texts of note tag.

    You must ensure the note tag's rounded rectangle is fully inside of the whole square by reducing the content of tag and font size.
`
  }

  const res = isImageFile ? await openai.images.edit({
    model: 'gpt-image-1',
    prompt: refinedPrompt,
    size: '1024x1536',
    n: 1,
    quality: 'high',
    image: file,
    mask: maskFile
  }) : await openai.images.edit({
    model: 'gpt-image-1',
    prompt: refinedPrompt,
    size: '1024x1536',
    n: 1,
    quality: 'high',
    image: file,
  });

  return Buffer.from(res.data[0].b64_json, 'base64')
}


async function pastePhotoOnBuffer(refinedBuffer, photoBase64, rect = { x: 50, y: 400, w: 420, h: 450 }) {
  const canvas = createCanvas(1024, 1536)
  const ctx = canvas.getContext('2d')

  // Draw the refined postcard as background
  const bgImg = await loadImage(refinedBuffer)
  ctx.drawImage(bgImg, 0, 0, 1024, 1536)

  // Draw the photoBase64 image in the specified rectangle
  if (photoBase64 && photoBase64.startsWith('data:image/')) {
    const base64Data = photoBase64.split(',')[1]
    const photoBuffer = Buffer.from(base64Data, 'base64')
    const photoImg = await loadImage(photoBuffer)
    ctx.save()
    // Clip to rounded rectangle if needed
    const { x, y, w, h } = rect
    const radius = 32
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + w - radius, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
    ctx.lineTo(x + w, y + h - radius)
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    ctx.lineTo(x + radius, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(photoImg, x, y, w, h)
    ctx.restore()
  }

  return canvas.toBuffer('image/png')
}

async function generateFinalPostcard({ firstName, years, type, photoBase64 }) {
  const finalBuffer = await composePostcard(photoBase64, '../public/commit_logo.png', firstName, years, type)

  const refinedBuffer = await refinePostcard(finalBuffer, firstName, type, photoBase64)

  const pastePhotoBuffer = await pastePhotoOnBuffer(refinedBuffer, photoBase64)

  const uploadedUrl = savePostcardToPublic(
    pastePhotoBuffer,
    `${type}_postcard_${firstName.replace(/\s+/g, '_')}_${Date.now()}`
  )

  return uploadedUrl
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
  await Talent.update({ resetToken: token, resetTokenExpiry: Date.now() + 36000000 }, { where: { email } })
  const mailOptions = {
    from: gmail_user,
    to: email,
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
        <footer style='background-color: #4D4AEA; color: #F5F5F5; font-size: 12px;  width: 35%; height: 48px; text-align: center;'>
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

const sendTalentBirthdaysToHR = async (talents, talentsForToday, { monthName, dayNumber }) => {
  let raw = ''
  if (fs.existsSync('birthdayData.json')) {
    raw = fs.readFileSync('birthdayData.json', 'utf-8')
  }
  const savedBirthdayData = raw ? JSON.parse(raw) : []
  await Promise.all(
    savedBirthdayData.map(async (data, i) => {
      const imageUrl = data.imageUrl
      const blessingText = data.blessing
      const chatID = -687487949 // Replace with your actual chat ID
      const payload = {
        chat_id: chatID,
        caption: `${blessingText}`,
        photo: imageUrl // Must be publicly accessible
      }
      try {
        const res = await axios.post(url, payload)
        console.log('Postcard sent:', res.data)
      } catch (err) {
        console.error('Telegram error:', err.response?.data || err.message)
      }
    })
  )
  let birthdayDataArr = []
  if (talents.length > 0) {
    const talentsBlockArr = await Promise.all(
      talents.map(async (user, i) => {
        // ...async code...
        return `<div>${i + 1}.&nbsp;${user.fullName} (Birthday: ${moment(user.birthday).format(
          'D MMMM'
        )})<br />Email: ${user.email}</div>`
      })
    )
    const talentsBlock = talentsBlockArr.join('')
    // Email HTML with talentsBlock and postcard grid
    const html = `
    <div style="font-family: 'Poppins', Arial, sans-serif; background: #f8fafc; padding: 32px;">
      <p style="font-size: 20px; color: #333; margin-bottom: 32px;">Hi, Sona!<br>These employees have birthdays in 1 day:</p>
      <div style="margin-bottom: 32px;">
        ${talentsBlock}
      </div>
    </div>
  `

    const mailOptions = {
      from: { address: gmail_user, name: 'Commit Offshore Holidays Reminder System' },
      to: gmail_reminders,
      subject: 'Upcoming talent birthdays in 1 day',
      cc: gmail_cc,
      html
    }

    await sendMail(mailOptions)

    // Await all postcard blocks

    await Promise.all(
      talents.map(async user => {
        const imageUrl = await generateFinalPostcard({
          firstName: user.fullName,
          years: 0,
          type: 'birthday',
          photoBase64: user.picture
        })

        const shortBlessing = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Write a short birthday blessing for ${user.fullName.split(' ')[0]
                } as 2 sentences starting exactly with "🎉 Happy Birthday ${user.fullName.split(' ')[0]} ! ${user.telegram ? user.telegram[0] == '@' ? user.telegram : '' : ''
                }". Make it warm and friendly, but not too formal.`
            }
          ]
        })

        const blessingText = shortBlessing.choices[0].message.content
        birthdayDataArr.push({ imageUrl, blessing: blessingText })

        const chatID = 622544436
        const payload = {
          chat_id: chatID,
          caption: `${blessingText}`,
          photo: imageUrl // Must be publicly accessible
        }
        try {
          const res = await axios.post(url, payload)
          console.log('Postcard sent:', res.data)
        } catch (err) {
          console.error('Telegram error:', err.response?.data || err.message)
        }
      })
    )
  }
  fs.writeFileSync('birthdayData.json', JSON.stringify(birthdayDataArr, null, 2))
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

  await sendMail(mailOptions)
}

const sendTalentsAnniversaryToHR = async (talents, talentsForToday) => {
  const today = moment()

  const talentsBlock = talentsForToday
    .map(async (talent, i) => {
      const start = moment(talent.startDate)
      const today = moment()
      let years = today.year() - start.year()

      if (today.format('MM-DD') < start.format('MM-DD')) {
        years -= 1
      }

      const count = years + 1

      const imageUrl = await generateFinalPostcard({
        firstName: talent.fullName,
        years: count,
        type: 'anniversary',
        photoBase64: talent.picture
      })

      const shortBlessing = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Write a short anniversary blessing for ${talent.fullName.split(' ')[0]
              } as 2 sentences starting exactly with "🎉 Happy Anniversary ${talent.fullName.split(' ')[0]} ! ${talent.email ? talent.email + ',' : ''
              }". Make it warm and friendly, but not too formal.`
          }
        ]
      })

      const htmlToTalent = `
  <div style="font-family: 'Poppins', Arial, sans-serif; background: #f8fafc; padding: 32px 0;">
    <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(77,74,234,0.08); padding: 32px 32px 24px 32px;">
      <h2 style="margin-top: 0; color: #4D4AEA; font-size: 28px; font-weight: 700; margin-bottom: 12px;">
        Hi, ${talent.fullName.split(' ')[0]}!
      </h2>
      <p style="font-size: 18px; color: #333; margin-bottom: 28px;">
        ${shortBlessing.choices[0].message.content}
      </p>
      <div style="text-align: center; margin-bottom: 8px;">
        <img src="${imageUrl}" alt="Personalized Postcard" style="max-width: 100%; border-radius: 12px; box-shadow: 0 2px 12px rgba(77,74,234,0.10);" />
      </div>
    </div>
  </div>
`

      const mailOptionsForTalent = {
        from: { address: gmail_user, name: 'Commit Offshore Holidays Reminder System' },
        to: talent.email,
        subject: `Happy Anniversary!`,
        // cc: gmail_hr,
        html: htmlToTalent
      }

      sendMail(mailOptionsForTalent)

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

  await sendMail(mailOptions)
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
