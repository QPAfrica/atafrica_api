import * as dotenv from "dotenv";
import express from "express";
import { Discussions } from "../models/Discussions.js";
import sendGrid from "@sendgrid/mail";


dotenv.config();

const router = express.Router();

sendGrid.setApiKey(process.env.SEND_GRID_API_KEY);

router.get("/all", async (req, res) => {
  try {
    const discussions = await Discussions.find();
    res.status(201).json(discussions);
  } catch (error) {
    res.json(error);
  }
});

router.get("/single/:id", async (req, res) => {
  try {
    const discussion = await Discussions.findById(req.params.id);
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post("/add", async (req, res) => {

  const newDiscussion = new Discussions({
    firstName: req.body.first_name,
    lastName: req.body.last_name,
    email: req.body.email,
    phone: req.body.phone,
    message: req.body.message,
  });

  const messageData = {
    to: req.body.email,
    from: {
      email: "content@atafrica.org",
      name: "ATAfrica",
    },
    subject: "Message Received",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
          <!--[if !mso]><!-->
          <meta http-equiv="X-UA-Compatible" content="IE=Edge">
          <!--<![endif]-->
          <!--[if (gte mso 9)|(IE)]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
          <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {width: 550px;margin: 0 auto;}
        table {border-collapse: collapse;}
        table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
        img {-ms-interpolation-mode: bicubic;}
      </style>
    <![endif]-->
          <style type="text/css">
        body, p, div {
          font-family: arial,helvetica,sans-serif;
          font-size: 14px;
        }
        body {
          color: #000000;
        }
        body a {
          color: #1188E6;
          text-decoration: none;
        }
        p { margin: 0; padding: 0; }
        table.wrapper {
          width:100% !important;
          table-layout: fixed;
          -webkit-font-smoothing: antialiased;
          -webkit-text-size-adjust: 100%;
          -moz-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        img.max-width {
          max-width: 100% !important;
        }
        .column.of-2 {
          width: 50%;
        }
        .column.of-3 {
          width: 33.333%;
        }
        .column.of-4 {
          width: 25%;
        }
        ul ul ul ul  {
          list-style-type: disc !important;
        }
        ol ol {
          list-style-type: lower-roman !important;
        }
        ol ol ol {
          list-style-type: lower-latin !important;
        }
        ol ol ol ol {
          list-style-type: decimal !important;
        }
        @media screen and (max-width:480px) {
          .preheader .rightColumnContent,
          .footer .rightColumnContent {
            text-align: left !important;
          }
          .preheader .rightColumnContent div,
          .preheader .rightColumnContent span,
          .footer .rightColumnContent div,
          .footer .rightColumnContent span {
            text-align: left !important;
          }
          .preheader .rightColumnContent,
          .preheader .leftColumnContent {
            font-size: 80% !important;
            padding: 5px 0;
          }
          table.wrapper-mobile {
            width: 100% !important;
            table-layout: fixed;
          }
          img.max-width {
            height: auto !important;
            max-width: 100% !important;
          }
          a.bulletproof-button {
            display: block !important;
            width: auto !important;
            font-size: 80%;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .columns {
            width: 100% !important;
          }
          .column {
            display: block !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .social-icon-column {
            display: inline-block !important;
          }
        }
      </style>
          <!--user entered Head Start--><!--End Head user entered-->
        </head>
        <body>
          <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#f5f5f5;">
            <div class="webkit">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#f5f5f5">
                <tr>
                  <td valign="top" bgcolor="#f5f5f5" width="100%">
                    <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="100%">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td>
                                <!--[if mso]>
        <center>
        <table><tr><td width="550">
      <![endif]-->
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:550px;" align="center">
                                          <tr>
                                            <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#F5F5F5" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
        <tr>
          <td role="module-content">
            <p>We've received your message and will respond shortly. Explore our wealthtech products in the meantime!</p>
          </td>
        </tr>
      </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a452cce7-ee65-4bcb-8303-61e97a73b9af">
        <tbody>
          <tr>
            <td style="font-size:6px; line-height:10px; padding:30px 10px 30px 10px;" valign="top" align="left">
              <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:25% !important; width:25%; height:auto !important;" width="138" alt="" data-proportionally-constrained="true" data-responsive="true" src="http://cdn.mcauto-images-production.sendgrid.net/6aabe8179b53a529/75fe6958-888d-4c0e-8b7e-8f853c9b4c67/540x184.png">
            </td>
          </tr>
        </tbody>
      </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 10px 20px 10px;" bgcolor="#FFFFFF" data-distribution="1">
        <tbody>
          <tr role="module-content">
            <td height="100%" valign="top"><table width="510" style="width:510px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
          <tbody>
            <tr>
              <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="381881a7-aa43-493a-90fc-ff8a053a209e" data-mc-module-version="2019-10-22">
        <tbody>
          <tr>
            <td style="padding:10px 0px 5px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="color: #222222; background-color: transparent; font-weight: 400; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; vertical-align: baseline; white-space-collapse: preserve; text-wrap: wrap; font-family: helvetica, sans-serif; font-size: 14px">Dear ${req.body.first_name},</span><span style="font-family: helvetica, sans-serif; font-size: 14px">&nbsp;</span></div><div></div></div></td>
          </tr>
        </tbody>
      </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="6fe76b10-6428-4950-8e0c-8baf7a8d14c2" data-mc-module-version="2019-10-22">
        <tbody>
          <tr>
            <td style="padding:5px 0px 5px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="color: #222222; background-color: transparent; font-weight: 400; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; vertical-align: baseline; white-space-collapse: preserve; text-wrap: wrap; font-family: helvetica, sans-serif; font-size: 14px">Thank you for reaching out to ATAfrica. We have received your message and will get back to you as soon as possible. Your inquiry is important to us, and we appreciate your patience.</span><span style="font-family: helvetica, sans-serif; font-size: 14px">&nbsp;</span></div><div></div></div></td>
          </tr>
        </tbody>
      </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="bd65c6fd-fcca-4517-966b-7b997732409d" data-mc-module-version="2019-10-22">
        <tbody>
          <tr>
            <td style="padding:5px 0px 20px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: inherit"><span style="color: #222222; background-color: transparent; font-weight: 400; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; vertical-align: baseline; white-space-collapse: preserve; text-wrap: wrap; font-family: helvetica, sans-serif; font-size: 14px">In the meantime, we invite you to explore our website and learn more about our wealthtech products</span><span style="font-family: helvetica, sans-serif; font-size: 14px">&nbsp;</span></div><div></div></div></td>
          </tr>
        </tbody>
      </table><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="4570014d-fe49-40e3-8613-5cf33b0e96ec">
          <tbody>
            <tr>
              <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 0px 0px;">
                <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                  <tbody>
                    <tr>
                    <td align="center" bgcolor="#333333" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                      <a href="https://atafrica.org/" style="border:1px solid #33333; border-color:#33333; border-radius:6px; border-width:1px; color:#ffffff; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid; background-color:#333333;" target="_blank">Explore</a>
                    </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table></td>
            </tr>
          </tbody>
        </table></td>
          </tr>
        </tbody>
      </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 10px 0px 10px;" bgcolor="#F5F5F5" data-distribution="1">
        <tbody>
          <tr role="module-content">
            <td height="100%" valign="top"><table width="510" style="width:510px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
          <tbody>
            <tr>
              <td style="padding:0px;margin:0px;border-spacing:0;"><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="f127c490-22b0-4715-9674-51f639b87930" data-mc-module-version="2019-10-22">
        <tbody>
          <tr>
            <td style="padding:10px 0px 1px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #000000; background-color: transparent; font-weight: 400; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; vertical-align: baseline; white-space-collapse: preserve; text-wrap: wrap; font-family: helvetica, sans-serif; font-size: 12px">This email is intended to: ${req.body.email}</span><span style="font-family: helvetica, sans-serif; font-size: 12px">&nbsp;</span></div><div></div></div></td>
          </tr>
        </tbody>
      </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="fe42f8de-a1e4-4c58-a054-133d265fac20" data-mc-module-version="2019-10-22">
        <tbody>
          <tr>
            <td style="padding:1px 0px 1px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #000000; background-color: transparent; font-weight: 400; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; vertical-align: baseline; white-space-collapse: preserve; text-wrap: wrap; font-family: helvetica, sans-serif; font-size: 12px">If you do not wish to receive this email please <a style="text-decoration: underline, color: inherit" href="">unsubscribe</a>.</span><span style="font-family: helvetica, sans-serif; font-size: 12px">&nbsp;</span></div><div></div></div></td>
          </tr>
        </tbody>
      </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="037169a1-f56e-401a-889a-fa79fc579f01" data-mc-module-version="2019-10-22">
        <tbody>
          <tr>
            <td style="padding:1px 0px 1px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="line-height: 1.656; margin-top: 0pt; margin-bottom: 0pt; color: #000000; background-color: transparent; font-weight: 400; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; vertical-align: baseline; white-space-collapse: preserve; text-wrap: wrap; font-family: helvetica, sans-serif; font-size: 12px">For more information please visit us at</span><a href="https://atafrica.org/"><span style="font-family: helvetica, sans-serif; font-size: 12px"> </span><span style="line-height: 1.656; margin-top: 0pt; margin-bottom: 0pt; text-decoration-line: underline; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; color: #1155cc; background-color: transparent; font-weight: 400; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; text-decoration-skip-ink: none; vertical-align: baseline; white-space-collapse: preserve; text-wrap: wrap; font-family: helvetica, sans-serif; font-size: 12px">https://atafrica.org</span></a></div><div></div></div></td>
          </tr>
        </tbody>
      </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="363d6947-a084-495e-9d13-c2e7e2d2d6a9" data-mc-module-version="2019-10-22">
        <tbody>
          <tr>
            <td style="padding:1px 0px 1px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="line-height: 1.656; margin-top: 0pt; margin-bottom: 0pt; color: #000000; background-color: transparent; font-weight: 400; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; vertical-align: baseline; white-space-collapse: preserve; text-wrap: wrap; font-family: helvetica, sans-serif; font-size: 12px">© ATAfrica 2024</span></div>
    <div style="font-family: inherit; text-align: center"><span style="line-height: 1.656; margin-top: 0pt; margin-bottom: 0pt; color: #000000; background-color: transparent; font-weight: 400; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-variant-position: normal; text-decoration-line: none; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; vertical-align: baseline; white-space-collapse: preserve; text-wrap: wrap; font-family: helvetica, sans-serif; font-size: 12px">A Venture Studio for WealthTech in Africa</span></div><div></div></div></td>
          </tr>
        </tbody>
      </table></td>
            </tr>
          </tbody>
        </table></td>
          </tr>
        </tbody>
      </table></td>
                                          </tr>
                                        </table>
                                        <!--[if mso]>
                                      </td>
                                    </tr>
                                  </table>
                                </center>
                                <![endif]-->
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          </center>
        </body>
      </html>`
  }


  try {
    const savedDiscussion = await newDiscussion.save();
    await sendGrid.send(messageData)
    res.status(201).json({
      data: savedDiscussion,
      msg: "Discussion Creation Successful and email sent.",
    });
  } catch (error) {
    res.json(error);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    await Discussions.findByIdAndDelete(req.params.id);
    res.status(200).json("Discussion has been deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
})

export default router;