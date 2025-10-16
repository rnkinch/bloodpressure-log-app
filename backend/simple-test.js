// Simple test for AI service without external dependencies
const AIAnalysisService = require('./services/aiAnalysisService');

console.log('Testing AI Analysis Service...');

const aiService = new AIAnalysisService();

// Test with minimal data
const testReadings = [
  {
    id: '1',
    systolic: 120,
    diastolic: 80,
    heartRate: 72,
    timestamp: new Date('2024-01-01T08:00:00Z')
  },
  {
    id: '2',
    systolic: 125,
    diastolic: 82,
    heartRate: 75,
    timestamp: new Date('2024-01-02T08:00:00Z')
  }
];

async function test() {
  try {
    console.log('Generating analysis...');
    const analysis = await aiService.generateAdvancedAnalysis(testReadings, [], []);
    console.log('✅ Analysis generated successfully!');
    console.log('Risk Assessment:', analysis.riskAssessment?.overall || 'N/A');
    console.log('Data Quality:', analysis.dataQuality?.quality || 'N/A');
    console.log('Confidence Score:', analysis.confidenceScore || 'N/A');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();
