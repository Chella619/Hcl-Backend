const fs = require('fs');
const path = require('path');
const coursesFileName = 'courses.txt';
const DashboardService = require('../services/dashboard.service')

const express = require('express');
const router = express.Router();

const getDashboardStats = async (req, res) => {
  try {
    const coursesFilePath = path.join(__dirname, '..', 'data', coursesFileName);
    const data = fs.readFileSync(coursesFilePath, 'utf-8');
    const courses = JSON.parse(data);

    const allRecords = courses.root.records.flatMap(r => r.records || []);

    // 1. Course Title Count
    const courseCounts = {};
    allRecords.forEach(course => {
      const title = course.course_title;
      courseCounts[title] = (courseCounts[title] || 0) + 1;
    });

    // 2. User Status Breakdown
    const statusCounts = {};
    allRecords.forEach(course => {
      const status = course.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // 3. Training Provider Insights
    const providerCounts = {};
    allRecords.forEach(course => {
      const provider = course.training_provider;
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });

    res.json({
      courseCounts,
      statusCounts,
      providerCounts
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

router.get('/', getDashboardStats);

module.exports = { router, getDashboardStats };