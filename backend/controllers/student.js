const expressAsyncHandler = require('express-async-handler');
const System = require('../models/system');

const validateQR = expressAsyncHandler(async (req, res) => {
  const { qrId, systemId } = req.body;

  if (!qrId || !systemId) {
    res.status(400);
    throw new Error("qrId and systemId are required");
  }

  const system = await System.findById(systemId);
  if (!system || !system.qrData) {
    res.status(404);
    throw new Error("System or QR data not found");
  }

  if (system.qrData.qrId !== qrId) {
    return res.status(401).json({ success: false, message: 'Invalid QR ID' });
  }

  const now = new Date();
  const createdAt = new Date(system.qrData.createdAt);
  const timeDiff = now - createdAt; 
  const maxAge = 30 * 60 * 1000;

  if (timeDiff > maxAge) {
    return res.status(410).json({ success: false, message: 'QR Code has expired' });
  }

  return res.status(200).json({ success: true, message: 'QR Code is valid' });
});

module.exports = validateQR;