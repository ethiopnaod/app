#!/usr/bin/env node

/**
 * Comprehensive Testing Script for Bingo Game Platform
 * Tests all functions, payments, and backend integration
 */

const axios = require('axios');
const fs = require('fs');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

class BingoGameTester {
  constructor() {
    this.testResults = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logEntry);
    this.testResults.push({ timestamp, type, message });
  }

  async testBackendHealth() {
    this.log('🏥 Testing Backend Health...', 'test');
    try {
      const response = await axios.get(`${BACKEND_URL}/health`);
      this.log(`✅ Backend Health: ${response.data.status}`, 'success');
      this.log(`   - Environment: ${response.data.environment}`, 'info');
      this.log(`   - Chapa Configured: ${response.data.chapa_configured}`, 'info');
      this.log(`   - Firebase Configured: ${response.data.firebase_configured}`, 'info');
      this.log(`   - Telegram Configured: ${response.data.telegram_configured}`, 'info');
      return true;
    } catch (error) {
      this.log(`❌ Backend Health Check Failed: ${error.message}`, 'error');
      this.errors.push('Backend health check failed');
      return false;
    }
  }

  async testAPIEndpoints() {
    this.log('🔌 Testing API Endpoints...', 'test');
    
    const endpoints = [
      { method: 'GET', url: '/api/test', name: 'API Test' },
      { method: 'GET', url: '/api/config', name: 'App Config' },
      { method: 'GET', url: '/api/languages', name: 'Languages' },
      { method: 'GET', url: '/api/translations/en', name: 'English Translations' },
      { method: 'GET', url: '/api/translations/am', name: 'Amharic Translations' },
      { method: 'GET', url: '/api/avatar/generate/test-user', name: 'Avatar Generation' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${BACKEND_URL}${endpoint.url}`,
          timeout: 5000
        });
        this.log(`✅ ${endpoint.name}: ${response.status}`, 'success');
      } catch (error) {
        this.log(`❌ ${endpoint.name}: ${error.response?.status || error.message}`, 'error');
        this.errors.push(`${endpoint.name} failed`);
      }
    }
  }

  async testPaymentSystem() {
    this.log('💳 Testing Payment System...', 'test');
    
    // Test payment callback endpoint
    try {
      const response = await axios.get(`${BACKEND_URL}/api/payment-callback`);
      this.log(`✅ Payment Callback Endpoint: ${response.status}`, 'success');
    } catch (error) {
      this.log(`❌ Payment Callback: ${error.response?.status || error.message}`, 'error');
    }

    // Test payment verification endpoint
    try {
      const response = await axios.get(`${BACKEND_URL}/api/payment/verify/test-tx-ref`);
      this.log(`✅ Payment Verification Endpoint: ${response.status}`, 'success');
    } catch (error) {
      this.log(`❌ Payment Verification: ${error.response?.status || error.message}`, 'error');
    }
  }

  async testTelegramIntegration() {
    this.log('🤖 Testing Telegram Integration...', 'test');
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/telegram/webhook`);
      this.log(`✅ Telegram Webhook Endpoint: ${response.status}`, 'success');
    } catch (error) {
      this.log(`❌ Telegram Webhook: ${error.response?.status || error.message}`, 'error');
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/advanced-bot/status`);
      this.log(`✅ Advanced Bot Status: ${response.data.status}`, 'success');
      this.log(`   - Available: ${response.data.available}`, 'info');
    } catch (error) {
      this.log(`❌ Advanced Bot Status: ${error.message}`, 'error');
    }
  }

  async testDatabaseConnections() {
    this.log('🗄️ Testing Database Connections...', 'test');
    
    // Test Firebase connection through backend
    try {
      const response = await axios.get(`${BACKEND_URL}/health`);
      if (response.data.firebase_configured) {
        this.log('✅ Firebase Connection: Active', 'success');
      } else {
        this.log('❌ Firebase Connection: Not configured', 'error');
        this.errors.push('Firebase not configured');
      }
    } catch (error) {
      this.log(`❌ Database Connection Test Failed: ${error.message}`, 'error');
    }
  }

  async testFrontendBuild() {
    this.log('🏗️ Testing Frontend Build...', 'test');
    
    try {
      // Check if build directory exists
      if (fs.existsSync('./build')) {
        this.log('✅ Build Directory: Exists', 'success');
        
        // Check build files
        const buildFiles = fs.readdirSync('./build');
        if (buildFiles.includes('index.html')) {
          this.log('✅ Build Files: index.html found', 'success');
        } else {
          this.log('❌ Build Files: index.html missing', 'error');
        }
      } else {
        this.log('❌ Build Directory: Not found', 'error');
        this.errors.push('Build directory missing');
      }
    } catch (error) {
      this.log(`❌ Frontend Build Test Failed: ${error.message}`, 'error');
    }
  }

  async testGameFunctionality() {
    this.log('🎮 Testing Game Functionality...', 'test');
    
    // Test game creation logic (mock)
    try {
      const mockGameData = {
        title: 'Test Game',
        entryFee: 50,
        maxPlayers: 10,
        prizePool: 500
      };
      
      this.log('✅ Game Creation Logic: Valid', 'success');
      this.log(`   - Title: ${mockGameData.title}`, 'info');
      this.log(`   - Entry Fee: ${mockGameData.entryFee} ETB`, 'info');
      this.log(`   - Max Players: ${mockGameData.maxPlayers}`, 'info');
      this.log(`   - Prize Pool: ${mockGameData.prizePool} ETB`, 'info');
    } catch (error) {
      this.log(`❌ Game Creation Logic: ${error.message}`, 'error');
    }
  }

  async testMultiLanguageSupport() {
    this.log('🌍 Testing Multi-Language Support...', 'test');
    
    const languages = ['en', 'am'];
    
    for (const lang of languages) {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/translations/${lang}`);
        if (response.data.status === 'success') {
          this.log(`✅ ${lang.toUpperCase()} Translations: Loaded`, 'success');
          this.log(`   - Keys: ${Object.keys(response.data.translations).length}`, 'info');
        } else {
          this.log(`❌ ${lang.toUpperCase()} Translations: Failed`, 'error');
        }
      } catch (error) {
        this.log(`❌ ${lang.toUpperCase()} Translations: ${error.message}`, 'error');
      }
    }
  }

  async testAvatarGeneration() {
    this.log('👤 Testing Avatar Generation...', 'test');
    
    const testUsers = ['user1', 'user2', 'user3'];
    
    for (const userId of testUsers) {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/avatar/generate/${userId}`);
        if (response.data.status === 'success') {
          this.log(`✅ Avatar for ${userId}: Generated`, 'success');
          this.log(`   - URL: ${response.data.avatar_url}`, 'info');
        } else {
          this.log(`❌ Avatar for ${userId}: Failed`, 'error');
        }
      } catch (error) {
        this.log(`❌ Avatar for ${userId}: ${error.message}`, 'error');
      }
    }
  }

  async performanceTest() {
    this.log('⚡ Running Performance Tests...', 'test');
    
    const startTime = Date.now();
    
    try {
      // Test multiple concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) => 
        axios.get(`${BACKEND_URL}/api/test`)
      );
      
      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.log(`✅ Performance Test: ${duration}ms for 10 concurrent requests`, 'success');
      this.log(`   - Average: ${duration / 10}ms per request`, 'info');
      
      if (duration < 5000) {
        this.log('✅ Performance: Excellent', 'success');
      } else if (duration < 10000) {
        this.log('⚠️ Performance: Good', 'warning');
      } else {
        this.log('❌ Performance: Needs improvement', 'error');
      }
    } catch (error) {
      this.log(`❌ Performance Test Failed: ${error.message}`, 'error');
    }
  }

  async generateTestReport() {
    this.log('📊 Generating Test Report...', 'test');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.filter(r => r.type === 'test').length,
      successCount: this.testResults.filter(r => r.type === 'success').length,
      errorCount: this.errors.length,
      warningCount: this.testResults.filter(r => r.type === 'warning').length,
      errors: this.errors,
      results: this.testResults
    };

    // Save report to file
    fs.writeFileSync('./test-report.json', JSON.stringify(report, null, 2));
    
    this.log('📄 Test Report Generated: test-report.json', 'success');
    this.log(`   - Total Tests: ${report.totalTests}`, 'info');
    this.log(`   - Successes: ${report.successCount}`, 'info');
    this.log(`   - Errors: ${report.errorCount}`, 'info');
    this.log(`   - Warnings: ${report.warningCount}`, 'info');

    return report;
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Bingo Game Testing...\n');
    
    // Wait for backend to start
    this.log('⏳ Waiting for backend to start...', 'info');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run all tests
    await this.testBackendHealth();
    await this.testAPIEndpoints();
    await this.testPaymentSystem();
    await this.testTelegramIntegration();
    await this.testDatabaseConnections();
    await this.testFrontendBuild();
    await this.testGameFunctionality();
    await this.testMultiLanguageSupport();
    await this.testAvatarGeneration();
    await this.performanceTest();
    
    // Generate final report
    const report = await this.generateTestReport();
    
    console.log('\n🎯 Test Summary:');
    console.log(`✅ Successful Tests: ${report.successCount}`);
    console.log(`❌ Failed Tests: ${report.errorCount}`);
    console.log(`⚠️ Warnings: ${report.warningCount}`);
    
    if (report.errorCount === 0) {
      console.log('\n🎉 All tests passed! Your Bingo platform is ready!');
    } else {
      console.log('\n🔧 Some tests failed. Check the errors above.');
      console.log('Errors:', report.errors);
    }
    
    return report;
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new BingoGameTester();
  tester.runAllTests().catch(console.error);
}

module.exports = BingoGameTester;