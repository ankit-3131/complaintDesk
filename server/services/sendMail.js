    import nodemailer from "nodemailer";
    import dotenv from "dotenv";
    dotenv.config();
    
    //mailer
    const transporter = nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      });
      
      async function sendEmail(toEmail, subject, text) {
        const mailOptions = {
          from: "ank008803@gmail.com",
          to: toEmail,
          subject: subject,
          text: text,
        };
      
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log("✅ Email sent: " + info.response);
        } catch (error) {
          console.error("❌ Error sending email:", error);
        }
      }
      
      // sendEmail(
      //   "ankitmuradpur@gmail.com, ank008801@gmail.com",
      //   "Message",
      //   "Message!"
      // );
    export {sendEmail};