const Notification = require('../models/Notification');
const { User } = require('../models/User');
const Doctor = require('../models/Doctor');

const sendNotification = async ({ recipientEmail, recipientId, title, message, type, priority, link }) => {
  try {
    let targetId = recipientId;
    
    // If we only have email, find the user
    if (!targetId && recipientEmail) {
      const user = await User.findOne({ email: recipientEmail });
      if (user) targetId = user._id;
    }

    if (!targetId) {
      console.warn(`Could not send notification: No recipient found for ${recipientEmail || recipientId}`);
      return null;
    }

    const notification = new Notification({
      recipient: targetId,
      title,
      message,
      type,
      priority: priority || 'Normal',
      link
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

module.exports = { sendNotification };
