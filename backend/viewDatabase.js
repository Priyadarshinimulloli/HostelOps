// Quick script to view database contents
const { sequelize } = require('./config/database');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

async function viewDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    
    console.log('👥 USERS TABLE:');
    console.log('================');
    if (users.length === 0) {
      console.log('No users yet. Register some users first!\n');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
      });
      console.log(`Total Users: ${users.length}\n`);
    }

    // Get all complaints
    const complaints = await Complaint.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('📋 COMPLAINTS TABLE:');
    console.log('====================');
    if (complaints.length === 0) {
      console.log('No complaints yet. Submit some complaints first!\n');
    } else {
      complaints.forEach(complaint => {
        console.log(`\nID: ${complaint.id}`);
        console.log(`  Student: ${complaint.User.name} (${complaint.User.email})`);
        console.log(`  Category: ${complaint.category} | Priority: ${complaint.priority}`);
        console.log(`  Status: ${complaint.status}`);
        console.log(`  Description: ${complaint.description.substring(0, 60)}...`);
        console.log(`  Created: ${complaint.createdAt}`);
      });
      console.log(`\nTotal Complaints: ${complaints.length}`);
      
      // Stats
      const pending = complaints.filter(c => c.status === 'Pending').length;
      const inProgress = complaints.filter(c => c.status === 'In Progress').length;
      const resolved = complaints.filter(c => c.status === 'Resolved').length;
      
      console.log('\n📊 STATUS BREAKDOWN:');
      console.log(`   Pending: ${pending}`);
      console.log(`   In Progress: ${inProgress}`);
      console.log(`   Resolved: ${resolved}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

viewDatabase();
