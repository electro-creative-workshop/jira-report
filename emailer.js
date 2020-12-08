import nodemailer from 'nodemailer';

const smtpTransport = nodemailer.createTransport({
    host: "smtp-relay.gmail.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.GS_USER,
        pass: process.env.GS_PASS
    }
});

async function send(options) {
    console.log(process.env.GS_PASS)
    console.log(smtpTransport.options.auth)

    const htmlPayload = options.html ? options.html : `
        <html>
            <head>
                <title>${options.subject}</title>
            </head>
            <body>
                ${options.message}
                <p>
                    Thanks,<br>
                    James + Jira Report Bot
                </p>
            </body>
        </html>`;

    let mailOptions = {
        from: "electro.test.automation@clorox.com",
        to: options.recipient,
        subject: options.subject,
        generateTextFromHTML: true,
        html: htmlPayload
    };

    if (options.cc){
        mailOptions.cc = options.cc;
    }

    smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response);
        smtpTransport.close();
    });
}

export {
    send,
}