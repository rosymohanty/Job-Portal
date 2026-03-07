const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {

  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  const info = await transporter.sendMail({
    from: '"TransHire" <no-reply@transhire.com>',
    to,
    subject,
    html
  });

  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

};

module.exports = sendEmail;