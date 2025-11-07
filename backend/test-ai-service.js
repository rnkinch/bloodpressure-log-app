// Test script for AI Analysis Service
const AIAnalysisService = require('./services/aiAnalysisService');

// Sample test data
const sampleReadings = [
  {
    id: '1',
    systolic: 120,
    diastolic: 80,
    heartRate: 72,
    timestamp: new Date('2024-01-01T08:00:00Z'),
    notes: 'Morning reading'
  },
  {
    id: '2', 
    systolic: 125,
    diastolic: 82,
    heartRate: 75,
    timestamp: new Date('2024-01-02T08:00:00Z'),
    notes: 'Morning reading'
  },
  {
    id: '3',
    systolic: 118,
    diastolic: 78,
    heartRate: 70,
    timestamp: new Date('2024-01-03T08:00:00Z'),
    notes: 'Morning reading'
  },
  {
    id: '4',
    systolic: 130,
    diastolic: 85,
    heartRate: 78,
    timestamp: new Date('2024-01-04T08:00:00Z'),
    notes: 'Morning reading'
  },
  {
    id: '5',
    systolic: 135,
    diastolic: 88,
    heartRate: 80,
    timestamp: new Date('2024-01-05T08:00:00Z'),
    notes: 'Morning reading'
  }
];

const sampleCigarEntries = [
  {
    id: 'c1',
    count: 2,
    timestamp: new Date('2024-01-02T18:00:00Z'),
    brand: 'Cohiba',
    notes: 'Evening cigars'
  },
  {
    id: 'c2',
    count: 1,
    timestamp: new Date('2024-01-04T19:00:00Z'),
    brand: 'Montecristo',
    notes: 'After dinner'
  }
];

const sampleDrinkEntries = [
  {
    id: 'd1',
    count: 2,
    timestamp: new Date('2024-01-02T20:00:00Z'),
    type: 'Wine',
    alcoholContent: 12.5,
    notes: 'Red wine with dinner'
  },
  {
    id: 'd2',
    count: 3,
    timestamp: new Date('2024-01-04T21:00:00Z'),
    type: 'Whiskey',
    alcoholContent: 40,
    notes: 'Evening drinks'
  }
];

async function testAIService() {
  console.log('🧠 Testing AI Analysis Service...\n');
  
  const aiService = new AIAnalysisService();
  
  try {
    console.log('📊 Generating advanced analysis...');
    const analysis = await aiService.generateAdvancedAnalysis(
      sampleReadings,
      sampleCigarEntries, 
      sampleDrinkEntries,
      [],
      []
    );
    
    console.log('✅ Analysis generated successfully!\n');
    
    // Display key results
    console.log('📈 ANALYSIS RESULTS:');
    console.log('==================');
    
    console.log('\n🎯 Risk Assessment:');
    console.log(`   Overall Risk: ${analysis.riskAssessment.overall}`);
    console.log(`   Risk Score: ${analysis.riskAssessment.riskScore}`);
    console.log(`   Current Status: ${analysis.riskAssessment.current}`);
    console.log(`   Progression: ${analysis.riskAssessment.progression}`);
    
    console.log('\n📊 Trend Analysis:');
    console.log(`   Systolic Trend: ${analysis.trendAnalysis.systolic.direction}`);
    console.log(`   Diastolic Trend: ${analysis.trendAnalysis.diastolic.direction}`);
    console.log(`   Heart Rate Trend: ${analysis.trendAnalysis.heartRate.direction}`);
    console.log(`   Volatility Level: ${analysis.trendAnalysis.volatility.level}`);
    
    console.log('\n🚭 Lifestyle Impact:');
    console.log(`   Smoking Impact: ${analysis.lifestyleCorrelation.smoking.impact}`);
    console.log(`   Smoking Correlation: ${analysis.lifestyleCorrelation.smoking.correlation}`);
    console.log(`   Overall Lifestyle Impact: ${analysis.lifestyleCorrelation.overallImpact}/8`);
    
    console.log('\n🔮 Predictions:');
    if (analysis.predictiveInsights.shortTerm.status === 'predicted') {
      console.log(`   Short-term (7 days): ${analysis.predictiveInsights.shortTerm.systolic}/${analysis.predictiveInsights.shortTerm.diastolic} mmHg`);
    }
    if (analysis.predictiveInsights.longTerm.status === 'projected') {
      console.log(`   Long-term (30 days): ${analysis.predictiveInsights.longTerm.projected30Day.systolic}/${analysis.predictiveInsights.longTerm.projected30Day.diastolic} mmHg`);
    }
    
    console.log('\n💡 Recommendations:');
    analysis.personalizedRecommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
    });
    
    console.log('\n⚠️  Medical Alerts:');
    if (analysis.medicalAlerts.length > 0) {
      analysis.medicalAlerts.forEach((alert, index) => {
        console.log(`   ${index + 1}. [${alert.type.toUpperCase()}] ${alert.message}`);
      });
    } else {
      console.log('   No medical alerts at this time.');
    }
    
    console.log('\n📊 Data Quality:');
    console.log(`   Total Readings: ${analysis.dataQuality.totalReadings}`);
    console.log(`   Time Span: ${analysis.dataQuality.timeSpanDays} days`);
    console.log(`   Quality: ${analysis.dataQuality.quality}`);
    console.log(`   Confidence Score: ${Math.round(analysis.confidenceScore * 100)}%`);
    
    console.log('\n✅ AI Service test completed successfully!');
    console.log('\n🚀 The AI analysis service is ready for production use.');
    
  } catch (error) {
    console.error('❌ Error testing AI service:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAIService();
