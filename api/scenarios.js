// api/scenarios.js
import scenarios from '../data/scenarios.json' assert { type: 'json' };

export default function handler(req, res) {
  // You can filter fields here to hide trainer-only data from trainees if needed.
  res.status(200).json(scenarios);
}
