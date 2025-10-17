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
  requirements: "They must include an explanation of how stop market orders work.",
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
},
{
  subject: "Missing all the moves!",
  ticketNumber: "1001",
  requester: "jasonmuhmoa@gmail.com",
  requesterName: "Jason",
  channel: "Email",
  hoursAgo: 1.9,
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
  requirements: "Must include the below (They must state the general idea):\n1. Explanation of the error mentioning that their position size is too big for the accout size they have which is why the error is getting rejected.\n2. Include this link to the main website showing the contract size for each account - https://apextraderfunding.com/",
  category: "Support",
  intent: "",
  accountId: "",
  tags: [],
  scenario: "After finding the account in the reports page in NinjaTrader Dashboard, and looking at order details, you see this rejection error.",
  scenarioAttachments: [
    {
      type: "image",
      url: "https://i.imgur.com/wCVRBFk.png",
      title: "Scenario image"
    }
  ],
  body: "I just got this new evaluation and every time i try and take a trade it says its rejected?? Can you please do the needful, thanks."
},
{
  subject: "Help!",
  ticketNumber: "1002",
  requester: "heyramsgg@gmail.com",
  requesterName: "Henry Bukslo",
  channel: "Email",
  hoursAgo: 5.8,
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
  requirements: "Must include (does not have to be word for word, the general idea):\n1. An explanation about how stop market orders work.",
  category: "Support",
  intent: "",
  accountId: "",
  tags: [],
  scenario: "After searching the account in Ninjatrader Dashboard, and finding the order details in the reports page, you see this rejection error.",
  scenarioAttachments: [
    {
      type: "image",
      url: "https://i.imgur.com/J0vml1c.png",
      title: "Scenario image"
    }
  ],
  body: "I want to trade but nothing is working. I took a short at 20512.25 but got rejected. Why???"
},
{
  subject: "Give me what you owe me!",
  ticketNumber: "1003",
  requester: "bossgirlthangs@yahoo.com",
  requesterName: "Allison Miggy",
  channel: "Email",
  hoursAgo: 1.23,
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
  requirements: "Must include (does not have to be word for word, general idea):\n1. An explanation that the user had chosen the option to remove the account from their Rithmic dashboard and therefore the account was no longer able to be traded. \n2. An explanation that we cannot bring back removed accounts and include this FAQ link - https://support.apextraderfunding.com/hc/en-us/articles/31519807548699-Reset-Options-and-Invoice-Cancellations",
  category: "",
  intent: "",
  accountId: "",
  tags: [],
  scenario: "After looking at the account's trades in Rithmic, you notice this error.",
  scenarioAttachments: [
    {
      type: "image",
      url: "https://i.imgur.com/eRhMo3O.png",
      title: "Scenario image"
    }
  ],
  body: "What even happened?? I was trading just fine and then all of the sudden my account kept getting rejected. I tried to restart my ninjatrader and then the account disappeared!! Please tell me what you've done!"
},
{
  subject: "This is great!",
  ticketNumber: "1004",
  requester: "ICTlegend@outlook.com",
  requesterName: "Gunther Strioli",
  channel: "Email",
  hoursAgo: 1.67,
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
  requirements: "Must include (does not have to be word for word, just general idea):\n1. An explanation that they need to choose the correct front month contract, not the continuous contract. For example, NQ1 (continued) should instead be NQM5 (front month).",
  category: "Support",
  intent: "",
  accountId: "",
  tags: [],
  body: "You see this? Im literally trying to trade NQ which you offer and i cant. What a joke.",
  attachments: [
    {
      type: "image",
      url: "https://i.imgur.com/LeBHW1y.png",
      title: "Attachment"
    }
  ]
}
  ];
  res.end(JSON.stringify({ weights, seed }));
}
