#!/usr/bin/env node

/**
 * Health check script for Docker
 * Tests database connectivity and basic API functionality
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function healthCheck() {
  try {
    // Test MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Database connection successful');

    // Test basic query
    const db = mongoose.connection.db;
    const collections = await db.collections();
    console.log(`✅ Found ${collections.length} collections`);

    // Close connection
    await mongoose.connection.close();

    console.log('✅ Health check passed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

healthCheck();