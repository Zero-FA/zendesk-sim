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
    ticketNumber: "2099",
    subject: "You are wrong",
    requester: "Martinmatias@gmail.com",
    requesterName: "Martin M.",
    channel: "Email",
    hoursAgo: 0,
    requiredStatus: "Open",
    requiredAssignee: "Support Tier 3",
    macroOnly: false,
    macroCommand: "",
    internalRequired: true,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Brief Summary of the Issue:\n\nAccount Numbers Affected:\nAPEX-951753-25",
    category: "",
    intent: "",
    accountId: "APEX-951753",
    tags: [],
    body: "Hey, I understand your message about the supposedly violated drawdown threshold in my account 25, but you are wrong!!!! Look at the attached picture in this message, I made a huge profit! Your math is wrong!",
    attachments: [
      { type: "image", url: "https://imgur.com/a/SEqVMGi", title: "Attachment" }
    ]
  },
  {
    ticketNumber: "2098",
    subject: "Balance not restored yet",
    requester: "Sergiomendez@gmail.com",
    requesterName: "Sergio M.",
    channel: "Email",
    hoursAgo: 0,
    requiredStatus: "Open",
    requiredAssignee: "Support Tier 3",
    macroOnly: false,
    macroCommand: "",
    internalRequired: true,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Brief Summary of the Issue:\n\nAccount Numbers Affected:\nAPEX-123446789-89",
    category: "",
    intent: "",
    accountId: "APEX-123446789",
    tags: [],
    body: "Hi Apex, I'm one of the users affected by yesterday's outage in Tradovate, which you mentioned in your Discord channel. I already talked with Duvan and Maria, they were so nice but my start of the day balance in my account 89 hasn't been reset yet. Please help"
  },
  {
    ticketNumber: "2097",
    subject: "Rithmic not created",
    requester: "KerryKing@gmail.com",
    requesterName: "Kerry",
    channel: "Email",
    hoursAgo: 0,
    requiredStatus: "Open",
    requiredAssignee: "Support Tier 3",
    macroOnly: false,
    macroCommand: "",
    internalRequired: true,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Brief Summary of the Issue:\n\nAccount Numbers Affected:\nAPEX-7896123-239",
    category: "",
    intent: "",
    accountId: "APEX-7896123",
    tags: [],
    scenario: "Once you check aMember, the mentioned account appears there, but it doesn't show in RTrader Pro or Rithmic Manager.",
    body: "Hi. Yesterday I purchased a new account 239, but it still doesn't populate in my Quantower and yes, I already followed all the steps mentioned in the connection guide. I've used your accounts for years and know how it works. Please fix asap"
  },
  {
    ticketNumber: "2096",
    subject: "What's wrong?",
    requester: "Mariana34@hotmail.com",
    requesterName: "Mariana",
    channel: "Email",
    hoursAgo: 2,
    requiredStatus: "Open",
    requiredAssignee: "Payout",
    macroOnly: false,
    macroCommand: "",
    internalRequired: false,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Brief Summary of the Issue:",
    category: "",
    intent: "",
    accountId: "APEX-8787574",
    tags: [],
    body: "I followed all your guidelines and adjusted my RR to the 5:1 rule and you are still denying my payout, what's wrong with you guys?"
  },
  {
    ticketNumber: "4002",
    subject: "Can't use Ninja Trader",
    requester: "dannytfixmyissue@hotmail.com",
    requesterName: "Danny T",
    channel: "Email",
    hoursAgo: 1,
    requiredStatus: "Solved",
    requiredAssignee: "Myself",
    macroOnly: false,
    macroCommand: "",
    internalRequired: false,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Personalized response including information from the FAQ Rithmic & Ninja Connection Guide and corresponding link: https://support.apextraderfunding.com/hc/en-us/articles/31519440985499-Rithmic-Ninja-Connection-Guide",
    category: "Support",
    intent: "",
    accountId: "APEX-543210",
    tags: [],
    scenario: "After checking the user's information, everything on Rithmic Manager and RTrader looks OK.",
    body: "Hello.\n\nI purchased my Rithmic evaluation 5 days ago and set everything up in RTrader, but I haven't been able to connect to NinjaTrader to trade. Can you help me? I need your guidance.\n\nIf you are unable to help me, I would like a refund because I need to trade asap.",
    attachments: []
  },
  {
    ticketNumber: "4005",
    subject: "Failed my eval :(",
    requester: "dianatesterticket@email.com",
    requesterName: "Diana",
    channel: "Email",
    hoursAgo: 10,
    requiredStatus: "Solved",
    requiredAssignee: "Myself",
    macroOnly: false,
    macroCommand: "",
    internalRequired: false,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Include options to continue trading (auto reset on renewal, manual reset now, or cancel) and one or more of these links:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519807548699-Reset-Options-and-Invoice-Cancellations#h_01JF05B3PWSD0PSC0D7TC294NW\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519807548699-Reset-Options-and-Invoice-Cancellations\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519779551387-Evaluation-Subscription-Billing#h_01JEZPZ29SAV4377H6Y5F9E0BT\nhttps://support.apextraderfunding.com/hc/en-us/articles/4404866626203-How-to-Reset-an-Account",
    category: "",
    intent: "",
    accountId: "APEX-111222",
    tags: [],
    body: "Hi :( I failed my eval 2 days ago and feel absolutely frustrated. It's my eval #2 and I've put so much hard work into it. It's the first time I fail an eval so I'm not sure what's next. I want to continue trading. Can you help me? Is there a way to reset?"
  },
  {
    ticketNumber: "4006",
    subject: "Payment failed",
    requester: "matthew.testtrader@agmail.com",
    requesterName: "Matthew Test",
    channel: "Email",
    hoursAgo: 1,
    requiredStatus: "Solved",
    requiredAssignee: "Myself",
    macroOnly: false,
    macroCommand: "",
    internalRequired: false,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Explain the 72-hour grace period and how to pay manually from the dashboard. Include one of:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519779551387-Evaluation-Subscription-Billing#h_01JF7E9HWAEMBXCE9BFRFSVXYX\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519779551387-Evaluation-Subscription-Billing#h_01JEZPZ29SSWQHFKG7SXY28RMS\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519779551387-Evaluation-Subscription-Billing",
    category: "Support/Billing",
    intent: "Payment failure",
    accountId: "APEX-654321-10",
    tags: [],
    scenario: "In aMember invoices/access, APEX-654321-10 failed its rebill this morning.",
    body: "Hello support. My credit card expired, and my monthly renewal was today, but I think it didn't go through. Is there a way to make the payment directly on the Apex platform? I'm about to pass my eval, and I don't want to lose all the profit I've gained. Please help me!!"
  },
  {
    ticketNumber: "4007",
    subject: "PA Fees",
    requester: "parkerpet.spider@hotmail.com",
    requesterName: "Peter Parker",
    channel: "Email",
    hoursAgo: 0,
    requiredStatus: "Solved",
    requiredAssignee: "Myself",
    macroOnly: false,
    macroCommand: "",
    internalRequired: false,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Explain PA fees vs evaluation fees (monthly/lifetime) and include one link:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519770974235-Evaluation-Passed-Converting-to-a-PA-PA-Fees-and-How-to-Activate#h_01JEZQTN6FCD7F4KHPJJ3A0FYC\nhttps://support.apextraderfunding.com/hc/en-us/articles/11316873486491-PA-Account-Fees-Lifetime-and-Monthly\nAlso clarify 1-day-to-pass when promotion is active.",
    category: "",
    intent: "",
    accountId: "",
    tags: [],
    body: "Hello Apex!\n\nI want to start trading with you, but I still have some questions about the process. Is the PA fee the same as the eval, or are there any other fees to pay? I can't seem to find this information on your website. Also, can I pass my eval in 1 day? Thanks in advance"
  },
  {
    ticketNumber: "4008",
    subject: "WC Tradeable Instruments",
    requester: "MeghannT@gmail.com",
    requesterName: "Meghan T",
    channel: "Email",
    hoursAgo: 3,
    requiredStatus: "Solved",
    requiredAssignee: "Myself",
    macroOnly: false,
    macroCommand: "",
    internalRequired: false,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Include the FAQ link for WealthCharts instruments/commissions:\nhttps://support.apextraderfunding.com/hc/en-us/articles/40229823264411-WealthCharts-Commissions-Instruments",
    category: "",
    intent: "Instrument information",
    accountId: "APEX-333663-01",
    tags: [],
    body: "I just purchased a WealthCharts account, but I can't make it work, and I think the instrument I tried is not allowed. Can you send me the list of the permitted instruments and commissions for this platform?"
  },
  {
    ticketNumber: "4010-A",
    subject: "Question",
    requester: "dannytesting.o@gmail.com",
    requesterName: "Dan O",
    channel: "Email",
    hoursAgo: 0,
    requiredStatus: "Solved",
    requiredAssignee: "Myself",
    macroOnly: false,
    macroCommand: "",
    internalRequired: false,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Include explanation for error: Market data failed get_order_book error: 13 (missing level 2 data). Add steps and at least one link:\nhttps://support.apextraderfunding.com/hc/en-us/articles/10973928895259-Error-Messages-and-How-To-Fix-Them\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519452005019-Rithmic-Trading-Tools-Add-ons-Orderbook-Market-Data-2nd-Login-CME\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519523978779-Tradovate-Trading-Tools-Add-ons-Orderflow-Level-2-Data",
    category: "Support",
    intent: "",
    accountId: "APEX-654321-02",
    tags: [],
    body: "Hi! I'm getting the order book error, how do I fix it?",
    attachments: [
      { type: "image", url: "https://imgur.com/a/AyolLJW", title: "Attachment" }
    ]
  },
  {
    ticketNumber: "4010-B",
    subject: "Question",
    requester: "mytestershawn@gmail.com",
    requesterName: "Shawn M",
    channel: "Email",
    hoursAgo: 2,
    requiredStatus: "Solved",
    requiredAssignee: "Myself",
    macroOnly: false,
    macroCommand: "",
    internalRequired: false,
    sections: ["Greeting","Opener","Solution","Closer","Sign-Off"],
    requirements: "Include:\n• Sundays: Trading on Sundays counts toward Monday’s trading day (6:00 PM ET → 4:59 PM ET next day).\n• Holidays: You can trade if the market is open; half-days do not count as a trading day.\nInclude one or more links:\nhttps://support.apextraderfunding.com/hc/en-us/articles/31519769997083-Evaluation-Rules",
    category: "",
    intent: "",
    accountId: "APEX-654321-02",
    tags: [],
    body: "Do Sundays and holidays count as trading days?"
  }
]

  ];

  res.end(JSON.stringify({ weights, seed }));
}
