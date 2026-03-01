// models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    required: true
  },
  path: {
    type: String,
    required: true
  },
  params: {
    type: mongoose.Schema.Types.Mixed
  },
  query: {
    type: mongoose.Schema.Types.Mixed
  },
  body: {
    type: mongoose.Schema.Types.Mixed
  },
  ip: String,
  userAgent: String,
  statusCode: Number,
  response: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
auditLogSchema.index({ admin: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);