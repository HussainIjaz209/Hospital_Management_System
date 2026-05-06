const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { User } = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital-db';

async function fixData() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users. Checking for plain-text passwords...`);

    for (const user of users) {
      let updated = false;

      // 1. Check if password needs hashing
      // Bcrypt hashes usually start with $2a$, $2b$, or $2y$ and are 60 chars long
      const isHashed = user.password.startsWith('$2a$') || 
                       user.password.startsWith('$2b$') || 
                       user.password.startsWith('$2y$');

      if (!isHashed) {
        console.log(`Hashing password for: ${user.email}`);
        user.password = await bcrypt.hash(user.password, 10);
        updated = true;
      }

      // 2. Normalizing role with mapping
      const roleMap = {
        'admin': 'Admin',
        'doctor': 'Doctor',
        'reception': 'Receptionist',
        'receptionist': 'Receptionist',
        'lab': 'Lab Technician',
        'lab technician': 'Lab Technician',
        'ward': 'Ward Manager',
        'ward manager': 'Ward Manager',
        'pharmacy': 'Pharmacist',
        'pharmacist': 'Pharmacist',
        'billing': 'Billing Specialist',
        'billing specialist': 'Billing Specialist',
        'nurse': 'Nurse'
      };

      const currentRole = user.role.toLowerCase();
      const mappedRole = roleMap[currentRole] || (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase());
      
      if (user.role !== mappedRole) {
        console.log(`Mapped role for ${user.email}: ${user.role} -> ${mappedRole}`);
        user.role = mappedRole;
        updated = true;
      }

      if (updated) {
        await user.save();
        console.log(`Updated user: ${user.email}`);
      }
    }

    console.log('Data migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

fixData();
