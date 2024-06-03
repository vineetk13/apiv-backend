const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
  name: String,
  data: Schema.Types.Mixed,
  type: String,
  priority: Number,
  nextRunAt: Date,
  lastModifiedBy: String,
  lockedAt: Date,
  lastRunAt: Date,
  lastFinishedAt: Date,
  failReason: String,
  failCount: { type: Number, default: 0 },
  failedAt: Date,
  repeatInterval: String,
  repeatTimezone: String,
  repeatAt: String,
  repeatCount: Number,
  // Add other fields as needed
});

const AgendaJob = mongoose.model('AgendaJob', jobSchema)

module.exports = AgendaJob
