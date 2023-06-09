require('dotenv').config

const nodemailer = require("nodemailer");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require('fs');

//Google sheets
const creds = JSON.parse(process.env.credentials);
const doc = new GoogleSpreadsheet(process.env.spreadsheet_id);

// Mail Login
const mailsender = process.env.mailsender;
const mailpassword = process.env.mailpassword;

// Mail content
const html = fs.readFileSync("content.html","utf-8");
const txt = fs.readFileSync("content.txt","utf-8");

// Mail Title
const title = "Photo and video editing services!";

// Delay function like sleep() in python
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

// Create a transporter object
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mailsender,
    pass: mailpassword,
  },
});

// Define the email options
let mailOptions = {};

function changeMailOptions(mail) {
  return new Promise(function (resolve) {
    mailOptions = {
      from: mailsender,
      to: mail,
      subject: title,
      text: txt,
    };
    resolve();
  });
}

// Send the email
function mailSender() {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`${mailOptions.to} ${info.response}\nSend with: ${mailsender}\n`);
    }
  });
}

const currentSheet = [];

// bring sheet row into array "currentSheet"
async function updateSheet() {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  currentSheet.length = 0;
  // Imports sheet to array based on current row count
  for (let i = 0; i < rows.length; i++) {
    currentSheet.push(rows[i].Email);
  }
  return "Loaded current sheet with " + currentSheet.length + " entries mulaa\n";
}

async function main() {
  const min = process.env.min * 1000;
  const max = process.env.max * 1000;
  const result = await updateSheet();
  console.log(result);

  for (let i = 0; i < currentSheet.length; i++) {
    const now = new Date();
    const currentTime = now.toLocaleString("en-US", {
      timeZone: "Europe/Berlin",
    });
    await changeMailOptions(currentSheet[i]);
    mailSender();
    console.log(`${currentTime} Send to: ${currentSheet[i]} Index: ${i + 1}`);
    if (i + 1 < currentSheet.length){
        await delay(Math.floor(Math.random() * (max - min) + min));
    }
  }
  await delay(2000);
  console.log("\nNo more EMAILS! Pypenschuch, Bot ist fertig :)")
}

main();
