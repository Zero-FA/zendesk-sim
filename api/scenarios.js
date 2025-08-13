const fs = require('fs');
const path = require('path');
module.exports = (req, res) => {
  try {
    const fp = path.join(process.cwd(), 'data', 'scenarios.json');
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load scenarios', detail: String(e) });
  }
};
