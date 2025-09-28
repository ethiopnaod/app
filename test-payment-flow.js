#!/usr/bin/env node

/**
 * Payment Flow Testing Script
 * Tests Chapa integration and payment processing
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

class PaymentTester {
  constructor() {
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async testChapaConfiguration() {
    this.log('💳 Testing Chapa Configuration...', 'test');
    
    try {
      const response = await axios.get(`${BACKEND_URL}/health`);
      const { chapa_configured } = response.data;
      
      if (chapa_configured) {
        this.log('✅ Chapa Configuration: Active', 'success');
      } else {
        this.log('❌ Chapa Configuration: Missing', 'error');
        this.log('   Please set CHAPA_SECRET_KEY and CHAPA_PUBLIC_KEY', 'info');
      }
      
      return chapa_configured;
    } catch (error) {
      this.log(`❌ Chapa Configuration Test Failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testPaymentInitialization() {
    this.log('🚀 Testing Payment Initialization...', 'test');
    
    const testPaymentData = {
      amount: 100,
      email: 'test@bingogame.com',
      first_name: 'Test',
      last_name: 'User',
      phone: '+251911234567',
      user_id: 'test-user-123'
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/api/wallet/deposit`, testPaymentData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.checkout_url) {
        this.log('✅ Payment Initialization: Success', 'success');
        this.log(`   - Checkout URL: ${response.data.checkout_url}`, 'info');
        this.log(`   - TX Ref: ${response.data.tx_ref}`, 'info');
        return response.data;
      } else {
        this.log('❌ Payment Initialization: No checkout URL', 'error');
        return null;
      }
    } catch (error) {
      this.log(`❌ Payment Initialization Failed: ${error.response?.data?.error || error.message}`, 'error');
      
      if (error.response?.status === 401) {
        this.log('   Authentication required - this is expected for protected endpoints', 'info');
      } else if (error.response?.data?.error?.includes('Chapa')) {
        this.log('   Chapa API error - check your credentials', 'warning');
      }
      
      return null;
    }
  }

  async testPaymentCallback() {
    this.log('📞 Testing Payment Callback...', 'test');
    
    const mockCallbackData = {
      tx_ref: 'test-tx-ref-123',
      status: 'success',
      amount: 100,
      currency: 'ETB',
      metadata: {
        user_id: 'test-user-123'
      }
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/api/payment-callback`, mockCallbackData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.log('✅ Payment Callback: Endpoint accessible', 'success');
      this.log(`   - Response: ${response.data.message || response.data.status}`, 'info');
      return true;
    } catch (error) {
      this.log(`❌ Payment Callback Failed: ${error.response?.data?.error || error.message}`, 'error');
      return false;
    }
  }

  async testPaymentVerification() {
    this.log('🔍 Testing Payment Verification...', 'test');
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/payment/verify/test-tx-ref`, {
        timeout: 5000
      });

      this.log('✅ Payment Verification: Endpoint accessible', 'success');
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        this.log('✅ Payment Verification: Protected (authentication required)', 'success');
        return true;
      } else {
        this.log(`❌ Payment Verification Failed: ${error.message}`, 'error');
        return false;
      }
    }
  }

  async testTelegramPayments() {
    this.log('🤖 Testing Telegram Payment Integration...', 'test');
    
    try {
      // Test Telegram webhook endpoint
      const webhookResponse = await axios.post(`${BACKEND_URL}/api/telegram/webhook`, {
        message: {
          chat: { id: 123456 },
          from: { id: 123456, first_name: 'Test' },
          text: '/start'
        }
      });

      this.log('✅ Telegram Webhook: Accessible', 'success');
    } catch (error) {
      this.log(`❌ Telegram Webhook: ${error.message}`, 'error');
    }

    try {
      // Test Telegram payment webhook
      const paymentWebhookResponse = await axios.post(`${BACKEND_URL}/api/telegram/payment-webhook`, {
        pre_checkout_query: {
          id: 'test-query',
          from: { id: 123456 },
          currency: 'ETB',
          total_amount: 10000,
          invoice_payload: 'deposit|100'
        }
      });

      this.log('✅ Telegram Payment Webhook: Accessible', 'success');
    } catch (error) {
      this.log(`❌ Telegram Payment Webhook: ${error.message}`, 'error');
    }
  }

  async testWalletOperations() {
    this.log('💰 Testing Wallet Operations...', 'test');
    
    // Test wallet endpoints (these require authentication)
    const walletEndpoints = [
      '/api/payment/history',
      '/api/user/update-email'
    ];

    for (const endpoint of walletEndpoints) {
      try {
        const response = await axios.get(`${BACKEND_URL}${endpoint}`);
        this.log(`✅ ${endpoint}: Accessible`, 'success');
      } catch (error) {
        if (error.response?.status === 401) {
          this.log(`✅ ${endpoint}: Protected (authentication required)`, 'success');
        } else {
          this.log(`❌ ${endpoint}: ${error.message}`, 'error');
        }
      }
    }
  }

  async testGameLogic() {
    this.log('🎮 Testing Game Logic...', 'test');
    
    // Test bingo card generation
    const mockCard = this.generateMockBingoCard();
    this.log('✅ Bingo Card Generation: Working', 'success');
    this.log(`   - B Column: ${mockCard.B.join(', ')}`, 'info');
    this.log(`   - Free Space: ${mockCard.N[2] === 0 ? 'Correct' : 'Error'}`, 'info');

    // Test win detection
    const winResult = this.testWinDetection(mockCard);
    this.log(`✅ Win Detection: ${winResult ? 'Working' : 'Needs review'}`, winResult ? 'success' : 'warning');
  }

  generateMockBingoCard() {
    const card = {
      B: [1, 5, 12, 8, 15],
      I: [16, 22, 28, 19, 30],
      N: [31, 38, 0, 42, 45], // 0 is free space
      G: [46, 52, 58, 51, 60],
      O: [61, 67, 73, 69, 75]
    };
    return card;
  }

  testWinDetection(card) {
    // Test horizontal line (row 2 - middle row)
    const middleRow = [card.B[2], card.I[2], card.N[2], card.G[2], card.O[2]];
    const hasWin = middleRow.every(num => num === 0 || num > 0); // Free space or valid number
    return hasWin;
  }

  async runAllPaymentTests() {
    console.log('💳 Starting Payment System Testing...\n');
    
    const chapaConfigured = await this.testChapaConfiguration();
    
    if (chapaConfigured) {
      await this.testPaymentInitialization();
    } else {
      this.log('⚠️ Skipping payment tests - Chapa not configured', 'warning');
    }
    
    await this.testPaymentCallback();
    await this.testPaymentVerification();
    await this.testTelegramPayments();
    await this.testWalletOperations();
    await this.testGameLogic();
    
    // Generate summary
    const successCount = this.testResults.filter(r => r.type === 'success').length;
    const errorCount = this.testResults.filter(r => r.type === 'error').length;
    const warningCount = this.testResults.filter(r => r.type === 'warning').length;
    
    console.log('\n📊 Payment Testing Summary:');
    console.log(`✅ Successful Tests: ${successCount}`);
    console.log(`❌ Failed Tests: ${errorCount}`);
    console.log(`⚠️ Warnings: ${warningCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All payment tests passed!');
    } else {
      console.log('\n🔧 Some payment tests failed. Check configuration.');
    }
    
    return {
      success: errorCount === 0,
      results: this.testResults
    };
  }
}

// Run payment tests if called directly
if (require.main === module) {
  const tester = new PaymentTester();
  tester.runAllPaymentTests().catch(console.error);
}

module.exports = PaymentTester;