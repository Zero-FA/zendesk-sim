// /api/tickets.js
// Returns JSON: { weights, seed } for the front-end to build runtime tickets.
// Why server endpoint: lets you update/rotate ticket sets without touching the front-end.

module.exports = function handler(req, res) {
  if (req && req.method && req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end(JSON.stringify({ error: "Method Not Allowed" }));
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

  // New: scenarioAttachments supported on any ticket.
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
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Support",
      intent: "Figure out what happened with their account",
      accountId: "APEX-123456",
      tags: [],
      scenario: "After checking the user's aMember, you see that the account APEX-123456-96 is blown once because the user breached the drawdown threshold",
      body: "Hi customer support\n\nI need your help... Today I tried to place a trade in my account APEX-123456-96, but it isn't letting me place a trade; it says something like admin only. I need your help right now. Thanks",
      attachments: [],
      scenarioAttachments: [
        {
          type: "link",
          url: "https://support.apextraderfunding.com/hc/en-us/articles/10973928895259-Error-Messages-and-How-To-Fix",
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
      internalRequired: false,
      sections: [],
      requirements: "Must contain at least 1 screenshot",
      category: "Support",
      intent: "Looking for an explanation about their account",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      scenario: "After checking the user's aMember, you see that the user has effectively breached the threshold in their account",
      body: "Ey Apex, you are scammers!\n\nMy Tdv account APEX-15 appears as blown, and I have NEVER touched the drawdown! I KNOW HOW MY THRESHOLD IS 2500 AND I HAVE NEVER DROPPED MY ACCOUNT DOWN TO 2500!!!!\n\nI need my account restored right now!!!!",
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
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Support",
      intent: "Looking for an explanation about their account",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      scenario: "You tried to pull up the user's account in aMember, but the email the user opened the ticket with is not connected to any Apex account",
      body: "Hi. I would like to ask you how many active PA accounts I have, cause I'm not sure if I have 20 or 21",
      attachments: [],
      scenarioAttachments: [
        {
          type: "link",
          url: "https://support.apextraderfunding.com/hc/en-us/articles/4407696269851-Evaluation-Passed-Profit-Target-Next-Steps",
          title: "FAQ: Next Steps After Passing"
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
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "Looking for help to get access their Apex dashboard",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      scenario: "After checking the user's aMember, you see the following message in the upper part: ''This user exceeded Account Sharing Prevention limits and temporarily locked. You can temporarily disable auto-locking for this customer for 1 day and allow access for his account.''",
      body: "Ey bro, I have no access to my Apex dashboard, I'm being locked out when trying to log in",
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
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      body: "Ey, this is terrible!!!! My data is the worst, and I have the best computer and internet in the whole country!",
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
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "",
      accountId: "APEX-123456",
      tags: [],
      body: "Hi dear customer service. I would like to ask a change. By mistake, I purchased a Wealthcharts account just 5 minutes ago, but I want a Rithmic account. Can you please convert it?\n\nThank you, dears",
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
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      body: "De de de la la la yed yed yed  Da da da ta ta ta\n\nApex, this Rithmic data is terrible, it's making me lose too much money cause it's too slow to load, basically it's super delayed!\nPlease reset the data right now! You should improve the way you feed the data to the accounts!",
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
      internalRequired: false,
      sections: [],
      requirements: "Use the specified macro; no additional prose is required.",
      category: "Account",
      intent: "",
      accountId: "APEX-123456",
      tags: ["account_questions"],
      body: "Finally, I passed the evaluation, what should I do now? I promise I will become millionaire and also I will lead Apex to the next level with all the profits coming on my side!!!!!",
      attachments: [],
      scenario: "",
      scenarioAttachments: []
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
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "Write a professional public reply following the structure (Greeting, Opener, Solution, Closer, Sign-Off). It could combine wording from the macros /numerical order and /how to sign macros. The response should guide the user to sign for the lowest account number (-04) to activate their PA, wording from one of the following FAQs and should include one or more of the following FAQ links: \nhttps://support.apextraderfunding.com/hc/en-us/articles/31519770974235-Evaluation-Passed-Converting… \nhttps://support.apextraderfunding.com/hc/en-us/articles/4407696269851-Evaluation-Passed-Profit-Targ…",
      category: "Support",
      intent: "PA conversion",
      accountId: "APEX-1235",
      tags: [],
      scenario:
        "You go to aMember and check the Rithmic tab, verifying which evals are passed, signed, and paid for. The image attached shows what you find.",
      body:
        "Hi Apex help desk! \n\nI passed my Rithmic eval 2 days ago, and I'm trying to get my PA. I've already paid for and signed for it, but it's not showing up. The account I passed is -05. Can you help me activate it or tell me what I'm missing? Thank you. \n\nBest,\n\nSara",
      attachments: [
        { type: "image", url: "https://i.imgur.com/lRpnmbP.png", title: "Attachment" }
      ],
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
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "Personalized response should include this information (could be paraphrased): You will need to uncheck Liquidating Only option in your RTrader dashboard. Right click on the account in trader dashboard and turn OFF Enable Liquidating Only (Trader). The response could mention a screenshot describing where to turn it off and mention risk parameters. The following FAQ link should be added:\nhttps://support.apextraderfunding.com/hc/en-us/articles/10973928895259-Error-Messages-and-How-To-Fi…",
      category: "Support",
      intent: "",
      accountId: "APEX - 123411",
      tags: [],
      body:
        "Hello!\n\nI'm getting this error and can't place trades. I'm sure my account is not blown, but I can't figure out what's wrong. Can you help me fix it?",
      attachments: [
        { type: "image", url: "https://i.imgur.com/cLRp8ku.png", title: "Attachment" }
      ],
      scenario: "You suspect the user has 'Liquidating Only' enabled in RTrader, blocking new orders.",
      scenarioAttachments: [
        { type: "image", url: "https://i.imgur.com/cLRp8ku.png", title: "RTrader — Liquidating Only toggle (example)" },
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
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "Personalized response including information from the FAQ Rithmic & Ninja Connection Guide and corresponding link: https://support.apextraderfunding.com/hc/en-us/articles/31519440985499-Rithmic-Ninja-Connection-Gui…",
      category: "Support",
      intent: "",
      accountId: "APEX - 543210",
      tags: [],
      scenario: "After checking the user's information, you see that everything on R-Manager and R-Trader seems to be ok.",
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
      internalRequired: false,
      sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
      requirements:
        "Personalized response explaining that the user should activate the TradingView plugin. The message should include the explanation on how to activate the plugin (or addon) from Tradovate and/or some wording from the following FAQ and the link to it: https://support.apextraderfunding.com/hc/en-us/articles/31519470769947-Tradovate-Setup-TradingView.",
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
    }
  ];

  res.end(JSON.stringify({ weights, seed }));
};
