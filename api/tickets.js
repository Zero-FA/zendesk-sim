// /api/tickets.js
// Returns JSON: { weights, seed } for the front-end to build runtime tickets.

export default function handler(req, res) {
  if (req && req.method && req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  // You can tune these at any time without changing the client.
  const weights = {
    sections: 60,
    status: 25,
    assignee: 15,
    visibility: 10,
    pass: 80,
    sectionWeights: { Greeting: 8, Opener: 8, Solution: 67, Closer: 8, "Sign-Off": 9 }
  };

  // scenarioAttachments supported on any ticket.
  // Each item: { type: "image"|"file"|"link", url: string, title?: string }
  const seed = [
    {
      ticketNumber: "3001",
      subject: "Account not showing",
      requester: "Tester2025@gmail.com",
      requesterName: "Carlos M.",
      channel: "Email",
      hoursAgo: 240,
      requiredStatus: "Pending",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/GEN - Missing Info",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "Account info",
      accountId: "APEX-123456",
      tags: ["account_questions", "T1", "support"],
      body: "Hi Apex. Can you please tell me what happened to my acc?",
      attachments: [],
      scenario: "",
      scenarioAttachments: []
    },
    {
      ticketNumber: "3002",
      subject: "Account not showing",
      requester: "Tester2025@gmail.com",
      requesterName: "Bach John",
      channel: "Email",
      hoursAgo: 900,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/EVAL - Failed Drawdown Threshold - Revoked/Admin Only Status",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Support",
      intent: "Figure out what happened with their account",
      accountId: "APEX-123456",
      tags: [],
      scenario:
        "After checking the user's aMember, you see that the account APEX-123456-96 is blown once because the user breached the drawdown threshold",
      body:
        "Hi customer support\n\nI need your help... Today I tried to place a trade in my account APEX-123456-96, but it isn't letting me place a trade; it says something like admin only. I need your help right now. Thanks",
      attachments: [],
      scenarioAttachments: [
        {
          type: "link",
          url: "https://support.apextraderfunding.com/hc/en-us/articles/10973928895259",
          title: "FAQ: Error Messages & How To Fix"
        }
      ]
    },
    {
      ticketNumber: "3003",
      subject: "Account doesn't work",
      requester: "Tester2025@gmail.com",
      requesterName: "Raul Tester",
      channel: "Email",
      hoursAgo: 2000,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/EVAL - Failed TDV",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Must contain at least 1 screenshot",
      category: "Support",
      intent: "Looking for an explanation about their account",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      scenario:
        "After checking the user's aMember, you see that the user has effectively breached the threshold in their account",
      body:
        "Ey Apex, you are scammers!\n\nMy Tdv account APEX-15 appears as blown, and I have NEVER touched the drawdown! I KNOW HOW MY THRESHOLD IS 2500 AND I HAVE NEVER DROPPED MY ACCOUNT DOWN TO 2500!!!!\n\nI need my account restored right now!!!!",
      attachments: [],
      scenarioAttachments: []
    },
    {
      ticketNumber: "3004",
      subject: "How many accounts?",
      requester: "rafaga@gmail.com",
      requesterName: "Raul Tester",
      channel: "Email",
      hoursAgo: 1,
      requiredStatus: "Pending",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/GEN - Wrong Email",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Support",
      intent: "Looking for an explanation about their account",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      scenario:
        "You tried to pull up the user's account in aMember, but the email the user opened the ticket with is not connected to any Apex account",
      body:
        "Hi. I would like to ask you how many active PA accounts I have, cause I'm not sure if I have 20 or 21",
      attachments: [],
      scenarioAttachments: [
        {
          type: "link",
          url: "https://support.apextraderfunding.com/hc/en-us/articles/4407696269851",
          title: "FAQ: Evaluation Passed — Profit Target — Next Steps"
        }
      ]
    },
    {
      ticketNumber: "3005",
      subject: "2FA issues",
      requester: "rafaga@gmail.com",
      requesterName: "Raul Tester",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Pending",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/2FA Troubleshooting - 1st email",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Support",
      intent: "Looking for help about the 2FA",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      body: "Hi, I'm having issues setting up the 2 factor, please I need some assistance.",
      attachments: [],
      scenario: "",
      scenarioAttachments: []
    },
    {
      ticketNumber: "3006",
      subject: "No access, help",
      requester: "rafaga@gmail.com",
      requesterName: "Marina T.",
      channel: "Email",
      hoursAgo: 900001,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/Authentication Website Lockout",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "Looking for help to get access their Apex dashboard",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      scenario:
        "After checking the user's aMember, you see the following message in the upper part: ''This user exceeded Account Sharing Prevention limits and temporarily locked. You can temporarily disable auto-locking for this customer for 1 day and allow access for his account.''",
      body:
        "Ey bro, I have no access to my Apex dashboard, I'm being locked out when trying to log in",
      attachments: [],
      scenarioAttachments: [
        {
          type: "image",
          url: "https://i.imgur.com/9PZJpHs.png",
          title: "aMember: Account Sharing Prevention banner (example)"
        }
      ]
    },
    {
      ticketNumber: "3007",
      subject: "Data issues",
      requester: "rafaga@gmail.com",
      requesterName: "Rafael Garcia",
      channel: "Email",
      hoursAgo: 987654321,
      requiredStatus: "Pending",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/Data Generic 2.0 NEW",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      body:
        "Ey, this is terrible!!!! My data is the worst, and I have the best computer and internet in the whole country!",
      attachments: [],
      scenario: "",
      scenarioAttachments: []
    },
    {
      ticketNumber: "3008",
      subject: "Switch account",
      requester: "rafaga@gmail.com",
      requesterName: "Rafael Garcia",
      channel: "Email",
      hoursAgo: 0.1,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/Platform - Purchased Wrong Account Type",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "",
      accountId: "APEX-123456",
      tags: [],
      body:
        "Hi dear customer service. I would like to ask a change. By mistake, I purchased a Wealthcharts account just 5 minutes ago, but I want a Rithmic account. Can you please convert it?\n\nThank you, dears",
      attachments: [],
      scenario: "",
      scenarioAttachments: []
    },
    {
      ticketNumber: "3009",
      subject: "Delayed data",
      requester: "rafaga@gmail.com",
      requesterName: "Rafael Garcia",
      channel: "Email",
      hoursAgo: 123456789,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/TECH - Data Issue",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      body:
        "De de de la la la yed yed yed  Da da da ta ta ta\n\nApex, this Rithmic data is terrible, it's making me lose too much money cause it's too slow to load, basically it's super delayed!\nPlease reset the data right now! You should improve the way you feed the data to the accounts!",
      attachments: [],
      scenario: "",
      scenarioAttachments: []
    },
    {
      ticketNumber: "3010",
      subject: "Passed the test",
      requester: "rafaga@gmail.com",
      requesterName: "Rafael Garcia",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/EVAL - Passed Evaluation",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      body:
        "Finally, I passed the evaluation, what should I do now? I promise I will become millionaire and also I will lead Apex to the next level with all the profits coming on my side!!!!!",
      attachments: []
    },
    {
      ticketNumber: "4000",
      subject: "PA not showing",
      requester: "sara@gmail.com",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Open",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured", "freestyle"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "Write a professional public reply following the structure (Greeting, Opener, Solution, Closer, Sign-Off). It could combine wording from the macros /numerical order and /how to sign macros. The response should guide the user to sign for the lowest account number (-04) to activate their PA and should include one or more of the following FAQ links:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519770974235\nhttps://support.apextraderfunding.com/hc/en-us/articles/4407696269851",
      category: "Support",
      intent: "PA conversion",
      accountId: "APEX-1235",
      tags: [],
      scenario:
        "You go to aMember and check the Rithmic tab, verifying which evals are passed, signed, and paid for. The image attached shows what you find.",
      body:
        "Hi Apex help desk! \n\nI passed my Rithmic eval 2 days ago, and I'm trying to get my PA. I've already paid for and signed for it, but it's not showing up. The account I passed is -05. Can you help me activate it or tell me what I'm missing? Thank you. \n\nBest,\n\nSara",
      attachments: [],
      scenarioAttachments: [
        { type: "image", url: "https://i.imgur.com/lRpnmbP.png", title: "aMember — Rithmic tab snapshot" },
        {
          type: "link",
          url: "https://support.apextraderfunding.com/hc/en-us/articles/31519770974235",
          title: "FAQ: Evaluation Passed — Converting"
        }
      ]
    },
    {
      ticketNumber: "4001",
      subject: "Error Rejected at RMS",
      requester: "fixitplease@gmail.com",
      requesterName: "John",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Open",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "Personalized response should include this (paraphrase is fine): You will need to uncheck Liquidating Only in your RTrader dashboard. Right-click the account in Trader Dashboard and turn OFF “Enable Liquidating Only (Trader)”. Mention risk parameters if helpful. Include this FAQ link:\nhttps://support.apextraderfunding.com/hc/en-us/articles/10973928895259",
      category: "Support",
      intent: "",
      accountId: "APEX - 123411",
      tags: [],
      scenario: "You suspect the user has 'Liquidating Only' enabled in RTrader, blocking new orders.",
      body:
        "Hello!\n\nI'm getting this error and can't place trades. I'm sure my account is not blown, but I can't figure out what's wrong. Can you help me fix it?",
      attachments: [
        { type: "image", url: "https://i.imgur.com/cLRp8ku.png", title: "Attachment" }
      ],
      scenarioAttachments: [
        {
          type: "link",
          url: "https://support.apextraderfunding.com/hc/en-us/articles/10973928895259",
          title: "FAQ: Error Messages & How To Fix"
        }
      ]
    },
    {
      ticketNumber: "4002",
      subject: "Can't use Ninja Trader",
      requester: "dannytfixmyissue@hotmail.com",
      requesterName: "Danny T",
      channel: "Email",
      hoursAgo: 1,
      requiredStatus: "Open",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "Personalized response including info from the Rithmic & Ninja Connection Guide. Include the link:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519440985499",
      category: "Support",
      intent: "",
      accountId: "APEX - 543210",
      tags: [],
      scenario:
        "After checking the user's information, you see that everything on R-Manager and R-Trader seems to be ok.",
      body:
        "Hello.\n\nI feel absolutely frustrated because I purchased my Rithmic evaluation 5 days ago and was able to set everything up in RTrader, but I haven't been able to connect to NinjaTrader to trade. Can you help me? I need your guidance.\n\nIf you are unable to help me, then I would like a refund because I need to trade asap.",
      attachments: [],
      scenarioAttachments: [
        {
          type: "link",
          url: "https://support.apextraderfunding.com/hc/en-us/articles/31519440985499",
          title: "FAQ: Rithmic & Ninja Connection Guide"
        }
      ]
    },
    {
      ticketNumber: "4004",
      subject: "Can't connect to TradingView",
      requester: "wolfangamadeusmozart@gmail.com",
      requesterName: "Amadeus Mozart",
      channel: "Email",
      hoursAgo: 3.5,
      requiredStatus: "Open",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "Explain that the user must activate the TradingView plugin in Tradovate and include steps (or paraphrase) plus this link:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519470769947",
      category: "Support",
      intent: "Tradovate data",
      accountId: "APEX-000111",
      tags: ["tradovate_questions"],
      scenario:
        "You go to NTDash and ensure that the accounts are not blown, membership is ok, but TradingView is not appearing in their plugins.",
      body:
        "Hello Apex. It's been 2 days and I still can't log in to TradingView. I haven't failed the test, my account is almost at the original balance. Fix my issue!!!",
      attachments: [],
      scenarioAttachments: [
        {
          type: "link",
          url: "https://support.apextraderfunding.com/hc/en-us/articles/31519470769947",
          title: "FAQ: Tradovate Setup — TradingView"
        }
      ]
    },
    {
      subject: "3011 - Latest update",
      requester: "HetfieldJ@gmail.com",
      requesterName: "James Hetfield",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/TECH - Apex Investing Copier",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements:
        "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "",
      accountId: "APEX-789654",
      tags: ["account_questions"],
      body:
        "I am having trouble opening NT, it was recommended that I open the Apex Investing Toolkit->Install their latest update. can you help me ensure I have the latest update?",
      attachments: []
    },
    {
      subject: "3012 - Money back",
      ticketNumber: "3012",
      requester: "Hetfieldj@gmail.com",
      requesterName: "James Hetfield",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/EVAL - Forgot recurring cancel LESS 3k",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "",
      intent: "",
      accountId: "",
      tags: [],
      scenario: "Once you check aMember, you notice this user has spent $2999 USD with us",
      body: "مرحبًا، اليوم اشتريت 22 من تقييم الحسابات وكنت أرغب في شراء 21 فقط، يرجى إعادة مبلغ 1 منها، لم أستخدمها."
    },
    {
      subject: "3013 - Quiero ser parte de Apex",
      ticketNumber: "3013",
      requester: "fernando53@gmail.com",
      requesterName: "Fernando",
      channel: "Email",
      hoursAgo: 1e+49,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/GEN - Promotion/Discount Code Inquiry",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "",
      intent: "",
      accountId: "",
      tags: [],
      body: "Hola amigos, soy nuevo en el trading y quisiera unirme a su empresa y quisiera un cupon de descuento, prometo hacer mucho dinero, de hecho puedo hacerlo con cuentas Rithmic, Wealthcharts o Tradovate porque ya las conozco todas, solo esperen y ya verán."
    },
    {
      subject: "3014 - Cuenta en vivo",
      ticketNumber: "3013",
      requester: "ramiroperez@gmail.com",
      requesterName: "Ramiro",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/PA - Sign Agreement",
      grading: { allowedModes: ["macro"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "",
      intent: "",
      accountId: "APEX-123555",
      tags: [],
      body: "hola, ya pasé mi cuenta, envienme el contrato para firmarlo en de inmediato, quiero operar ya mismo"
    },
    {
      subject: "3015 - Llevo media hora esperando",
      ticketNumber: "3015",
      requester: "Benedicto16@gmail.com",
      requesterName: "Benedicto",
      channel: "Email",
      hoursAgo: 1e-9,
      requiredStatus: "Open",
      requiredAssignee: "Myself",
      macroOnly: true,
      macroCommand: "/PA - Activations (Numerical Order)",
      grading: { allowedModes: ["macro","structured"], defaultMode: "macro" },
      internalRequired: false,
      sections: [],
      requirements: "The ticket has to be answered by using the macro /PA - Activations (Numerical Order) or by customizing the wording in there, telling the user they signed account APEX-355063-24 and paid for account APEX-355063-17, and they have to sign for account APEX-355063-17 in order to get their new PA account. The account numbers can be paraphrased or shortened to 17, 24, Apex-17, Apex-24.",
      category: "",
      intent: "",
      accountId: "APEX-355063",
      tags: [],
      scenario: "Once you check aMember you notice the user signed account 24 but paid for account 17",
      scenarioAttachments: [
        {
          type: "image",
          url: "https://i.imgur.com/zvZjSJn.png",
          title: "Scenario image"
        }
      ],
      body: "Hola, ya firmé y pagué mi cuenta live y no la he recibido. Cuanto tardarán en asignarmela? llevo esperando media hora. Thanks"
    },
    {
      subject: "You are wrong",
      ticketNumber: "2099",
      requester: "Martinmatias@gmail.com",
      requesterName: "Martin M.",
      channel: "Email",
      hoursAgo: 0,
      requiredStatus: "Open",
      requiredAssignee: "Support Tier 3",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["freestyle"], defaultMode: "freestyle" },
      internalRequired: true,
      sections: [
        "Greeting",
        "Opener",
        "Solution",
        "Closer",
        "Sign-Off"
      ],
      requirements: "Brief Summary of the Issue:\n \nAccount Numbers Affected:\nAPEX-951753-25",
      category: "",
      intent: "",
      accountId: "Apex-951753-25",
      tags: [],
      body: "Hey, I understand your message about the supposedly violated drawdown threshold in my account 25, but you are wrong!!!! Look at the attached picture in this message, I made a huge profit! Your math is wrong!",
      attachments: [
        {
          type: "image",
          url: "https://imgur.com/a/SEqVMGi",
          title: "Attachment"
        }
      ]
    },
    {
      subject: "Balance not restored yet",
      ticketNumber: "2098",
      requester: "Sergiomendez@gmail.com",
      requesterName: "Sergio M.",
      channel: "Email",
      hoursAgo: 0,
      requiredStatus: "Open",
      requiredAssignee: "Support Tier 3",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["freestyle"], defaultMode: "freestyle" },
      internalRequired: true,
      sections: [
        "Greeting",
        "Opener",
        "Solution",
        "Closer",
        "Sign-Off"
      ],
      requirements: "Brief Summary of the Issue:\n\n \nAccount Numbers Affected:\nApex-123446789-89",
      category: "",
      intent: "",
      accountId: "Apex-123446789",
      tags: [],
      body: "Hi Apex, I'm one of the users affected by yesterday's outage in Tradovate, which you mentioned in your Discord channel. I already talked with Duvan and Maria, they were so nice but my strt of the day balance in my account 89 haven't been reset yet. Please help"
    },
    {
      subject: "Rittmik not created",
      ticketNumber: "2097",
      requester: "KerryKing@gmail.com",
      requesterName: "Kerry",
      channel: "Email",
      hoursAgo: 0.01,
      requiredStatus: "Open",
      requiredAssignee: "Support Tier 3",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["freestyle"], defaultMode: "freestyle" },
      internalRequired: true,
      sections: [
        "Greeting",
        "Opener",
        "Solution",
        "Closer",
        "Sign-Off"
      ],
      requirements: "Brief Summary of the Issue:\n\n \nAccount Numbers Affected:\nApex-7896123-239",
      category: "",
      intent: "",
      accountId: "Apex-7896123",
      tags: [],
      scenario: "Once you check aMember, you can see the mentioned account populates in there, but is doesn't appear in Rtrader Pro and R Manager",
      body: "Hi. Yesterday I purchased a new account 239, but it still doesn't populate in my Quantower and yes, I already followed all the steps mentioned in the connection guide, I have used your accounts for years and now how it works. Please fix asap"
    },
    {
      subject: "What's wrong?",
      ticketNumber: "2096",
      requester: "Mariana34@hotmail.com",
      requesterName: "Mariana",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Open",
      requiredAssignee: "Payout",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: [
        "Greeting",
        "Opener",
        "Solution",
        "Closer",
        "Sign-Off"
      ],
      requirements: "Brief Summary of the Issue:",
      category: "",
      intent: "",
      accountId: "APEX-8787574",
      tags: [],
      body: "I followed all your guidelines and adjusted my rr to the 5:1 rule and you are still denying my payout, what's wrong with you guys?"
    },
    {
      subject: "4005 - Failed my eval :(",
      requester: "dianatesterticket@email.com",
      requesterName: "Diana",
      channel: "Email",
      hoursAgo: 10,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "The personalized response should include the different options a user has to continue trading: they can either purchase a new account or reset their current one either manually or with the automatic reset. The wording should include some of the following information:\n\nNext Steps:\n\n1. Automatic Reset Upon Subscription Renewal: If you choose to maintain your subscription, your account will automatically reset on your next renewal date. This reset will restore your account balance, trailing drawdown, and trading days to their initial states, allowing you to start the evaluation anew without any additional cost. \n2. Manual Reset Option: If you’d like to restart your evaluation before the scheduled renewal, you have the option to purchase a manual reset. This will immediately reset your account balance, trailing drawdown, and trading days, enabling you to begin the evaluation process again right away. Please note that a manual reset does not alter your subscription’s renewal or expiration date.\n3. Canceling Your Subscription: If you prefer not to continue, you can cancel your subscription through your member’s area. Keep in mind that canceling will terminate your current evaluation, and any progress will be lost.\n\nOne or more of the following links should be included:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519807548699-Reset-Options-and-Invoice-Cancellations#h_01JF05B3PWSD0PSC0D7TC294NW\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519807548699-Reset-Options-and-Invoice-Cancellations\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519779551387-Evaluation-Subscription-Billing#h_01JEZPZ29SAV4377H6Y5F9E0BT\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519779551387-Evaluation-Subscription-Billing\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519807548699-Reset-Options-and-Invoice-Cancellations#h_01JF058RTNTAC6MTT91X6KB81B\nhttps://support.apextraderfunding.com/hc/en-us/articles/4404866626203-How-to-Reset-an-Account",
      category: "",
      intent: "",
      accountId: "APEX-111222",
      tags: [],
      body:
        "Hi :( I failed my eval 2 days ago and feel absolutely frustrated. It's my eval #2 and I've put so much hard work on it I just feel so sad and frustrated. It's the first time I fail an eval so I'm not sure what's next. I want to continue trading. Can you help me? Is there a way to reset?",
      attachments: []
    },
    {
      subject: "4006 - Payment failed",
      requester: "matthew.testtrader@agmail.com",
      requesterName: "Matthew Test",
      channel: "Email",
      hoursAgo: 0.5,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "The personalized response should include the explanation of the 72 hour grace period and how to pay from the user's dashboard manually, including wording from one of the following links and the corresponding link attached:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519779551387-Evaluation-Subscription-Billing#h_01JF7E9HWAEMBXCE9BFRFSVXYX\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519779551387-Evaluation-Subscription-Billing#h_01JEZPZ29SSWQHFKG7SXY28RMS\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519779551387-Evaluation-Subscription-Billing",
      category: "Support/Billing",
      intent: "Payment failure",
      accountId: "APEX-654321-10",
      tags: [],
      scenario:
        "After checking the user's invoices in the invoices/access tab in aMember, you see that indeed account APEX-654321-10 failed its rebill this morning.",
      body:
        "Hello support. My credit card expired, and my monthly renewal was today, but I think it didn't go through. Is there a way to make the payment directly on the Apex platform? I'm about to pass my eval, and I don't want to lose all the profit I've gained. Please help me!!",
      attachments: []
    },
    {
      subject: "4007 - Pa Fees",
      requester: "parkerpet.spider@hotmail.com",
      requesterName: "Peter Parker",
      channel: "Email",
      hoursAgo: 0.1,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "The personalized response should include the response to both questions with the following information (it could be paraphrased). The PA fees are not the same as the evaluation fees. There are monthly and lifetime fees, depending on the size and type of account. Further information can be found in this link (either of the following links can be included in the response):\n\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519770974235-Evaluation-Passed-Converting-to-a-PA-PA-Fees-and-How-to-Activate#h_01JEZQTN6FCD7F4KHPJJ3A0FYC\nhttps://support.apextraderfunding.com/hc/en-us/articles/11316873486491-PA-Account-Fees-Lifetime-and-Monthly\n\nAdditionally, the response should include the explanation of the 1 day to pass, which could be paraphrased this: as long as there is an ongoing promotion with the 1 day to pass, users can pass their evaluation in 1 day.",
      category: "",
      intent: "",
      accountId: "",
      tags: [],
      body:
        "Hello Apex!\n\nI want to start trading with you, but I still have some questions about the process. Is the PA fee the same as the eval, or are there any other fees to pay? I can't seem to find this information on your website. Also, can I pass my eval in 1 day? Thanks in advance",
      attachments: []
    },
    {
      subject: "4008 - WC Tradeable Instruments",
      requester: "MeghannT@gmail.com",
      requesterName: "Meghan T",
      channel: "Email",
      hoursAgo: 3,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "The personalized response should include the FAQ link to guide the user on how to find the WealthCharts instruments: https://support.apextraderfunding.com/hc/en-us/articles/40229823264411-WealthCharts-Commissions-Instruments",
      category: "",
      intent: "Instrument information",
      accountId: "APEX-333663-01",
      tags: [],
      body:
        "I just purchased a WealthCharts account, but I can't make it work, and I think the instrument I tried is not allowed. Can you send me the list of the permitted instruments and commissions for this platform?",
      attachments: []
    },
    {
      subject: "4010 - Question",
      requester: "dannytesting.o@gmail.com",
      requesterName: "Dan O",
      channel: "Email",
      hoursAgo: 0,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "The personalized response should include (could be paraphrased) the following information:  \nError Message: Market data failed get_order_book error: 13 - This indicates missing level 2 data. You must add level 2 data for order book. For Rithmic, under Rithmic Addons. For Tradovate, on their web platform, go to Settings, Subscriptions, and add level 2 data. Any of the following links can be included: \nhttps://support.apextraderfunding.com/hc/en-us/articles/10973928895259-Error-Messages-and-How-To-Fix-Them \nhttps://support.apextraderfunding.com/hc/en-us/articles/31519452005019-Rithmic-Trading-Tools-Add-ons-Orderbook-Market-Data-2nd-Login-CME \nhttps://support.apextraderfunding.com/hc/en-us/articles/31519523978779-Tradovate-Trading-Tools-Add-ons-Orderflow-Level-2-Data",
      category: "Support",
      intent: "",
      accountId: "APEX-654321-02",
      tags: [],
      body:
        "Hi! I'm getting the order book error, how do I fix it?",
      attachments: [
        {
          type: "image",
          url: "https://imgur.com/a/AyolLJW",
          title: "Attachment"
        }
      ]
    },
    {
      subject: "4010 - Question",
      requester: "mytestershawn@gmail.com",
      requesterName: "Shawn M",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Solved",
      requiredAssignee: "Myself",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["structured"], defaultMode: "structured" },
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "The personalized response should include (could be paraphrased) the following information: \n• Sundays: Trading on Sundays counts as part of Monday’s trading day. A trading day is defined as 6:00 PM ET one day until 4:59 PM ET the next day.\n• Holidays: You can trade on holidays if the market is open. However, half-day holidays do not count as a trading day.\nIt should also include one or more of the following links:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519769997083-Evaluation-Rules\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519769997083-Evaluation-Rules#h_01JEZNR8EW5FS94WX5RH5R3P9E",
      category: "",
      intent: "",
      accountId: "APEX-654321-02",
      tags: [],
      body:
        "Do Sundays and holidays count as trading days?",
      attachments: []
    },
    {
      subject: "Not able to pay",
      ticketNumber: "2000",
      requester: "Lisacatrader@gmail.com",
      requesterName: "Lisa T",
      channel: "Email",
      hoursAgo: 1,
      requiredStatus: "Open",
      requiredAssignee: "Support Tier 2",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["freestyle"], defaultMode: "freestyle" },
      internalRequired: true,
      sections: [
        "Greeting",
        "Opener",
        "Solution",
        "Closer",
        "Sign-Off"
      ],
      requirements: "Internal note must include the Escalation - Internal Note Structure macro structure, it could be paraphrased, but it should include at least items from numbers 1 and 2 of the following:\n1. Brief Summary of the Issue: something in the lines of the user is getting error 609\n2. Account Numbers Affected: APEX-896543-05\n3. Any Additional Information (Screenshots, Related Findings, Troubleshooting steps taken) - this one should be optional and they can describe that they would include that they checked admin logs and saw they have error 609.",
      category: "Billing",
      intent: "Billing Issues",
      accountId: "APEX-896543-05",
      tags: [],
      scenario: "You go to Admin Logs and see there was a Failed Rebill for APEX-896543-05, it has the remark \"Error 609\".",
      body: "Hi. I am so frustrated. I can't pay. it says ERROR 609, how am I supposed to know what that is? I thought Apex was available in India. Heeelp!!!!"
    },
    {
      subject: "Voglio fare trading",
      ticketNumber: "2002",
      requester: "fiorellathetrader@gmail.com",
      requesterName: "Fiorella",
      channel: "Email",
      hoursAgo: 2,
      requiredStatus: "Open",
      requiredAssignee: "Fraud General",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["freestyle"], defaultMode: "freestyle" },
      internalRequired: true,
      sections: [
        "Greeting",
        "Opener",
        "Solution",
        "Closer",
        "Sign-Off"
      ],
      requirements: "The internal note must include the description of what was found: user is banned due to multiple accounts.",
      category: "",
      intent: "",
      accountId: "APEX-000111",
      tags: [],
      scenario: "You go to aMember and see the user is banned. In the comment section you see that the reason is multiple accounts.",
      body: "Buongiorno, \n\nSono stato bannato. Voglio fare trading con Apex :( per favore. Prometto che questa volta rispetterò le regole. Per favore rimuovimi dal ban.\n\nSaluti,\n\nFiorella"
    },
    {
      subject: "PA not activated",
      ticketNumber: "2001",
      requester: "testingjulie.bmember@hotmail.com",
      requesterName: "Julie B",
      channel: "Email",
      hoursAgo: 8,
      requiredStatus: "Open",
      requiredAssignee: "Support Tier 2",
      macroOnly: false,
      macroCommand: "",
      grading: { allowedModes: ["freestyle"], defaultMode: "freestyle" },
      internalRequired: true,
      sections: [
        "Greeting",
        "Opener",
        "Solution",
        "Closer",
        "Sign-Off"
      ],
      requirements: "Internal note must include the Escalation - Internal Note Structure macro structure, it could be paraphrased, but it should include at least items from numbers 1 and 2 of the following: \n1. Brief Summary of the Issue: something in the lines of the user signed for the lowest account number but the payment is assigned to the highest account number or the payment needs to be changed.\n2. Account Numbers Affected: APEX-000000-49 and APEX-000000-50\n3. Any Additional Information (Screenshots, Related Findings, Troubleshooting steps taken) - this one should be optional and could include the description of the procedure with wording similar to: the signatures and payment tab (or the Rithmic tab) in aMembershows that the payment is assigned to the highest passed account number, but the signature is for the lowest passed account number. (or a description of of the image)",
      category: "PA/Account",
      intent: "",
      accountId: "APEX-000000-49",
      tags: [],
      scenario: "You go to aMember to the Rithmic tab and see that the payment is assigned to the highest passed account number, but the signature is for the lowest passed account number.",
      scenarioAttachments: [
        {
          type: "image",
          url: "https://i.imgur.com/kTrKRFu.png",
          title: "Scenario image"
        }
      ],
      body: "Hi APEX\n\nWhy is my PA not active yet? I'm losing trading days in profit, give my account NOW!!!\n\nBest,\n\nJulie"
    },
    {
  subject: "Cant trade",
  ticketNumber: "5000",
  requester: "Tendy",
  requesterName: "Sean",
  channel: "Email",
  hoursAgo: 2,
  requiredStatus: "Solved",
  requiredAssignee: "Myself",
  macroOnly: false,
  macroCommand: "",
  internalRequired: false,
  sections: [
    "Greeting",
    "Opener",
    "Solution",
    "Closer",
    "Sign-Off"
  ],
  requirements: "They msut include an explanation of how stop market orders work.",
  category: "",
  intent: "",
  accountId: "",
  tags: [],
  body: "Hey i tried to take trades but theya re getting rejected! Whats going on??",
  attachments: [
    {
      type: "image",
      url: "https://i.imgur.com/fm2xDNi.png",
      title: "Attachment"
    }
  ]
}
  ];

  res.end(JSON.stringify({ weights, seed }));
}
