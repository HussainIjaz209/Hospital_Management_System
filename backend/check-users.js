const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const { User } = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const users = await User.find({}, { email:1, role:1, password:1 }).lean();
    console.log(JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
