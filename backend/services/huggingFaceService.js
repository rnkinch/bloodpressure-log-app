const axios = require('axios');

class HuggingFaceService {
  constructor() {
    this.apiUrl = 'https://api-inference.huggingface.co/models';
    this.apiKey = process.env.HUGGINGFACE_API_KEY || null;
    this.defaultModel = 'distilbert-base-uncased-finetuned-sst-2-english'; // Sentiment analysis model
    this.medicalModel = 'emilyalsentzer/Bio_ClinicalBERT'; // Medical BERT model
    this.selectedModel = null; // User-selected model preference
    this.requestTimeout = 60000; // 60 second timeout for API calls
  }

  // Method to set API key dynamically (from frontend)
  setApiKey(apiKey) {
    console.log('Setting API key:', apiKey ? 'present' : 'missing');
    this.apiKey = apiKey;
    console.log('API key after setting:', this.apiKey ? 'present' : 'missing');
  }

  // Method to set selected model
  setSelectedModel(modelName) {
    console.log('Setting selected model:', modelName);
    this.selectedModel = modelName;
  }

  async generateInsights(analysisData) {
    try {
      console.log('generateInsights called with API key:', this.apiKey ? 'present' : 'missing');
      if (!this.apiKey) {
        console.warn('Hugging Face API key not provided, using fallback responses');
        return this.getFallbackInsights(analysisData);
      }

      const prompt = this.createMedicalPrompt(analysisData);
      console.log('Calling Hugging Face API with prompt length:', prompt.length);
      const response = await this.callHuggingFaceAPI(prompt, this.medicalModel);
      
      return {
        insights: response,
        source: 'huggingface',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Hugging Face API error:', error);
      return this.getFallbackInsights(analysisData);
    }
  }

  async generateRecommendations(riskAssessment, lifestyleData) {
    try {
      if (!this.apiKey) {
        return this.getFallbackRecommendations(riskAssessment);
      }

      const prompt = this.createRecommendationPrompt(riskAssessment, lifestyleData);
      const response = await this.callHuggingFaceAPI(prompt, this.defaultModel);
      
      return {
        recommendations: [response], // Convert to array
        source: 'huggingface',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Hugging Face recommendations error:', error);
      return this.getFallbackRecommendations(riskAssessment);
    }
  }

  async answerQuestion(question, userData) {
    try {
      if (!this.apiKey) {
        return this.getFallbackAnswer(question, userData);
      }

      const prompt = this.createQuestionPrompt(question, userData);
      const response = await this.callHuggingFaceAPI(prompt, this.defaultModel);
      
      return {
        answer: response,
        source: 'huggingface',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Hugging Face Q&A error:', error);
      return this.getFallbackAnswer(question, userData);
    }
  }

  async callHuggingFaceAPI(prompt, model = null) {
    const startTime = Date.now();
    const modelToUse = model || this.selectedModel || this.defaultModel;
    
    console.log(`Making real HuggingFace API call to model: ${modelToUse}`);
    console.log(`Prompt length: ${prompt.length} characters`);
    
    try {
      console.log(`Making HuggingFace API call to ${this.apiUrl}/${modelToUse}`);
      console.log(`API Key (first 5 chars): ${this.apiKey ? this.apiKey.substring(0, 5) + '...' : 'missing'}`);
      
      const response = await axios.post(
        `${this.apiUrl}/${modelToUse}`,
        {
          inputs: prompt
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.requestTimeout
        }
      );
      
      console.log(`HuggingFace API call succeeded with status: ${response.status}`);
      console.log(`Response data type: ${typeof response.data}`);
      console.log(`Response headers: ${JSON.stringify(response.headers)}`);
      console.log(`X-Request-ID: ${response.headers['x-request-id'] || 'not present'}`);
      console.log(`X-Compute-Type: ${response.headers['x-compute-type'] || 'not present'}`);
      console.log(`X-Compute-Time: ${response.headers['x-compute-time'] || 'not present'}`);

      const responseTime = Date.now() - startTime;
      console.log(`HuggingFace API response received in ${responseTime}ms`);
      console.log('Raw response:', JSON.stringify(response.data, null, 2));

      // Extract text from various possible response formats
      let generatedText = '';
      
      if (Array.isArray(response.data)) {
        // Some models return an array of objects
        if (response.data.length > 0 && response.data[0].generated_text) {
          generatedText = response.data[0].generated_text;
        } else if (response.data.length > 0 && response.data[0].text) {
          generatedText = response.data[0].text;
        }
      } else if (response.data.generated_text) {
        // Some models return a single object with generated_text
        generatedText = response.data.generated_text;
      } else if (response.data.text) {
        // Some models return text field
        generatedText = response.data.text;
      } else if (typeof response.data === 'string') {
        // Some models return plain text
        generatedText = response.data;
      }

      if (!generatedText || generatedText.trim().length === 0) {
        console.warn('Empty response from HuggingFace API, falling back to mock response');
        return this.getFallbackResponse(prompt);
      }

      console.log(`Successfully extracted text: ${generatedText.substring(0, 100)}...`);
      return generatedText.trim();

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`HuggingFace API error after ${responseTime}ms:`, error.message);
      
      if (error.response) {
        console.error('API Response Status:', error.response.status);
        console.error('API Response Data:', error.response.data);
        
        // Handle specific error cases
        if (error.response.status === 401) {
          console.error('Invalid API key');
          throw new Error('Invalid HuggingFace API key');
        } else if (error.response.status === 503) {
          console.error('Model is loading, this can take up to 60 seconds');
          throw new Error('Model is loading, please try again in a moment');
        } else if (error.response.status === 429) {
          console.error('Rate limit exceeded');
          throw new Error('Rate limit exceeded, please try again later');
        }
      } else if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
        throw new Error('Request timeout - model may be loading');
      }
      
      // Fall back to mock response for any other errors
      console.log('Falling back to mock response due to API error');
      return this.getFallbackResponse(prompt);
    }
  }

  getFallbackResponse(prompt) {
    // Generate more dynamic responses based on the prompt content
    let response = "AI-generated insight: ";
    
    if (prompt.includes('risk') || prompt.includes('dangerous') || prompt.includes('high')) {
      response += "Your blood pressure data shows some elevated readings that warrant attention. ";
      response += "Consider lifestyle modifications and consult with a healthcare provider. ";
    } else if (prompt.includes('normal') || prompt.includes('good') || prompt.includes('healthy')) {
      response += "Your blood pressure readings appear to be within normal ranges. ";
      response += "Continue your current monitoring routine and maintain healthy habits. ";
    } else if (prompt.includes('trend') || prompt.includes('pattern') || prompt.includes('change')) {
      response += "Your blood pressure shows consistent patterns. ";
      response += "Monitor for any significant changes and maintain regular check-ups. ";
    } else if (prompt.includes('exercise') || prompt.includes('activity') || prompt.includes('fitness')) {
      response += "Regular physical activity can help maintain healthy blood pressure. ";
      response += "Consider incorporating moderate exercise into your routine. ";
    } else if (prompt.includes('diet') || prompt.includes('food') || prompt.includes('sodium')) {
      response += "Diet plays a crucial role in blood pressure management. ";
      response += "Focus on a balanced diet with reduced sodium intake. ";
    } else if (prompt.includes('stress') || prompt.includes('anxiety') || prompt.includes('relax')) {
      response += "Stress management is important for blood pressure control. ";
      response += "Consider relaxation techniques and stress reduction strategies. ";
    } else {
      response += "Based on your blood pressure data, continue regular monitoring. ";
      response += "Maintain a healthy lifestyle and consult healthcare providers as needed. ";
    }
    
    response += "Continue monitoring regularly and consult with healthcare providers for personalized advice.";
    
    return response;
  }

  createMedicalPrompt(analysisData) {
    const { riskAssessment, trendAnalysis, dataQuality, lifestyleCorrelation, circadianAnalysis, predictiveInsights } = analysisData;
    
    // Extract weight data for inclusion in the prompt
    const weightData = lifestyleCorrelation?.weight || {};
    const weightTrend = weightData?.trend || 'unknown';
    const weightCorrelation = weightData?.correlation || 0;
    const weightImpact = weightData?.impact || 'no data';
    const bmiCategory = weightData?.bmiCategory || 'unknown';
    const recentWeight = weightData?.recentWeight || 'no data';
    
    return `You are a medical AI assistant specializing in cardiology and hypertension management. Analyze this blood pressure data and provide evidence-based clinical insights:

PATIENT DATA OVERVIEW:
- Total Readings: ${dataQuality?.totalReadings || 0}
- Time Span: ${dataQuality?.timeSpanDays || 0} days
- Data Quality: ${dataQuality?.quality || 'unknown'}
- Monitoring Frequency: ${dataQuality?.averageFrequency?.toFixed(1) || 0} readings/day

RISK ASSESSMENT:
- Current Risk: ${riskAssessment?.current || 'unknown'}
- Historical Risk: ${riskAssessment?.historical || 'unknown'}
- Lifestyle Impact: ${riskAssessment?.lifestyle || 'unknown'}
- Overall Risk: ${riskAssessment?.overall || 'unknown'}
- Risk Score: ${riskAssessment?.riskScore || 0}

TREND ANALYSIS:
- Systolic Trend: ${trendAnalysis?.systolic?.direction || 'stable'} (Confidence: ${trendAnalysis?.systolic?.confidence || 'unknown'})
- Diastolic Trend: ${trendAnalysis?.diastolic?.direction || 'stable'} (Confidence: ${trendAnalysis?.diastolic?.confidence || 'unknown'})
- Heart Rate Trend: ${trendAnalysis?.heartRate?.direction || 'stable'} (Confidence: ${trendAnalysis?.heartRate?.confidence || 'unknown'})
- Volatility Level: ${trendAnalysis?.volatility?.level || 'unknown'}

LIFESTYLE CORRELATIONS:
- Smoking Impact: ${lifestyleCorrelation?.smoking?.impact || 'no data'} (Correlation: ${lifestyleCorrelation?.smoking?.correlation || 0}%)
- Alcohol Impact: ${lifestyleCorrelation?.alcohol?.moderateDrinking?.impact || lifestyleCorrelation?.alcohol?.lightDrinking?.impact || 'no data'}
- Combined Lifestyle Impact: ${lifestyleCorrelation?.overallImpact || 0}

WEIGHT ANALYSIS:
- Recent Weight: ${recentWeight}
- BMI Category: ${bmiCategory}
- Weight Trend: ${weightTrend}
- BP Correlation: ${weightCorrelation.toFixed(2)}
- Impact on BP: ${weightImpact}
- Weight Recommendations: ${weightData?.recommendations?.join(', ') || 'none available'}

CIRCADIAN PATTERNS:
- Morning Average: ${circadianAnalysis?.morning?.averageSystolic || 0}/${circadianAnalysis?.morning?.averageDiastolic || 0}
- Afternoon Average: ${circadianAnalysis?.afternoon?.averageSystolic || 0}/${circadianAnalysis?.afternoon?.averageDiastolic || 0}
- Evening Average: ${circadianAnalysis?.evening?.averageSystolic || 0}/${circadianAnalysis?.evening?.averageDiastolic || 0}
- Optimal Time: ${circadianAnalysis?.optimalTime || 'unknown'}

PREDICTIVE INSIGHTS:
- Short-term Prediction: ${predictiveInsights?.shortTerm?.systolic || 0}/${predictiveInsights?.shortTerm?.diastolic || 0}
- Long-term Projection: ${predictiveInsights?.longTerm?.projected30Day?.systolic || 0}/${predictiveInsights?.longTerm?.projected30Day?.diastolic || 0}
- Confidence Level: ${predictiveInsights?.confidence || 0}

Based on current medical guidelines from organizations like the American Heart Association and European Society of Cardiology, provide a concise clinical analysis of:
1. The patient's current hypertension status and cardiovascular risk level
2. Significant patterns in the blood pressure data, especially concerning trends
3. How lifestyle factors (including weight) are specifically affecting this patient's blood pressure
4. The clinical significance of the circadian patterns observed
5. What the predictive trends suggest about future cardiovascular risk
6. Weight management recommendations based on the correlation between weight and blood pressure

Include specific medical insights that would be valuable for both the patient and healthcare providers. Refer to specific readings and patterns in your analysis.`;
  }

  createRecommendationPrompt(riskAssessment, lifestyleData) {
    const riskLevel = riskAssessment?.overall || 'unknown';
    const hasSmoking = lifestyleData?.smoking?.impact === 'significant';
    const hasAlcohol = lifestyleData?.alcohol?.impact === 'significant';
    
    // Extract weight data
    const weightData = lifestyleData?.weight || {};
    const weightImpact = weightData?.impact || 'no data';
    const weightTrend = weightData?.trend || 'unknown';
    const weightCorrelation = weightData?.correlation || 0;
    const bmiCategory = weightData?.bmiCategory || 'unknown';
    const recentWeight = weightData?.recentWeight || 'no data';
    const hasWeightIssue = weightImpact === 'significant' || weightImpact === 'moderate' || bmiCategory === 'overweight' || bmiCategory === 'obese';

    return `You are a medical professional specializing in hypertension management. Based on this blood pressure assessment, provide evidence-based recommendations following clinical guidelines:

RISK ASSESSMENT:
- Overall Risk: ${riskLevel}
- Risk Score: ${riskAssessment?.riskScore || 0}

LIFESTYLE ANALYSIS:
- Smoking Impact: ${lifestyleData?.smoking?.impact || 'no data'} (Correlation: ${lifestyleData?.smoking?.correlation || 0}%)
- Alcohol Impact: ${lifestyleData?.alcohol?.moderateDrinking?.impact || lifestyleData?.alcohol?.lightDrinking?.impact || 'no data'}
- Combined Lifestyle Impact: ${lifestyleData?.overallImpact || 0}

WEIGHT DATA:
- Recent Weight: ${recentWeight}
- BMI Category: ${bmiCategory}
- Weight Trend: ${weightTrend}
- BP Correlation: ${weightCorrelation.toFixed(2)}
- Impact on BP: ${weightImpact}

TREND DATA:
- Systolic Trend: ${riskAssessment?.progression || 'unknown'}
- Lifestyle Risk: ${riskAssessment?.lifestyle || 'unknown'}

Provide 3-5 specific, actionable health recommendations following current medical guidelines. For each recommendation:
1. Explain the specific intervention (what to do)
2. Provide the expected benefit based on clinical evidence
3. Include measurable goals or targets where appropriate
4. Suggest a realistic timeframe for implementation

${hasWeightIssue ? 'INCLUDE SPECIFIC WEIGHT MANAGEMENT RECOMMENDATIONS based on the correlation between weight and blood pressure. Be specific about dietary approaches, caloric targets, and exercise recommendations appropriate for this patient.' : ''}

Focus on evidence-based lifestyle modifications, monitoring practices, and when medical consultation is warranted. Be specific about dietary approaches (like DASH diet), physical activity recommendations, and stress management techniques appropriate for this patient's risk level.

Include a disclaimer that these recommendations do not replace professional medical advice.`;
  }

  createQuestionPrompt(question, userData) {
    const recentReadings = userData?.readings?.slice(0, 5) || [];
    const avgSystolic = recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length;
    const avgDiastolic = recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length;
    const totalReadings = userData?.readings?.length || 0;
    const smokingEntries = userData?.cigars?.length || 0;
    const drinkingEntries = userData?.drinks?.length || 0;
    
    // Extract weight data
    const weightEntries = userData?.weights || [];
    const hasWeightData = weightEntries.length > 0;
    let recentWeight = 'No data';
    let weightTrend = 'Unknown';
    let bmiCategory = 'Unknown';
    
    if (hasWeightData) {
      // Sort weight entries by date (newest first)
      const sortedWeights = [...weightEntries].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      // Get most recent weight
      recentWeight = sortedWeights[0].weight;
      
      // Calculate BMI if height is available (using a default height of 6ft/1.83m if not available)
      const height = userData?.height || 1.83; // Default height of 6ft (1.83m) if not available
      const bmi = recentWeight / (height * height);
      
      // Determine BMI category
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi < 25) bmiCategory = 'Normal';
      else if (bmi < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
      
      // Determine weight trend if multiple entries
      if (sortedWeights.length > 1) {
        const oldestWeight = sortedWeights[sortedWeights.length - 1].weight;
        if (Math.abs(recentWeight - oldestWeight) < 1) {
          weightTrend = 'Stable';
        } else {
          weightTrend = recentWeight > oldestWeight ? 'Increasing' : 'Decreasing';
        }
      }
    }
    
    // Calculate BP category based on JNC 8 guidelines
    let bpCategory = "Normal";
    if (avgSystolic >= 180 || avgDiastolic >= 120) bpCategory = "Hypertensive Crisis";
    else if (avgSystolic >= 140 || avgDiastolic >= 90) bpCategory = "Stage 2 Hypertension";
    else if (avgSystolic >= 130 || avgDiastolic >= 80) bpCategory = "Stage 1 Hypertension";
    else if (avgSystolic >= 120 && avgDiastolic < 80) bpCategory = "Elevated";

    return `You are a clinical hypertension specialist answering a patient question. Provide an evidence-based response following current medical guidelines.

USER QUESTION: "${question}"

PATIENT DATA:
- Recent BP Average: ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg (${bpCategory})
- Total BP Readings: ${totalReadings}
- Recent Weight: ${recentWeight} ${hasWeightData ? `(${bmiCategory}, Trend: ${weightTrend})` : ''}
- Smoking Entries: ${smokingEntries}
- Drinking Entries: ${drinkingEntries}

LIFESTYLE FACTORS:
- Recent Smoking: ${userData?.cigars?.slice(0, 3).map(c => c.timestamp).join(', ') || 'No recent entries'}
- Recent Drinking: ${userData?.drinks?.slice(0, 3).map(d => d.timestamp).join(', ') || 'No recent entries'}
- Weight Entries: ${hasWeightData ? weightEntries.slice(0, 3).map(w => `${w.weight}kg (${new Date(w.timestamp).toLocaleDateString()})`).join(', ') : 'No data'}

Provide a concise, accurate answer that:
1. Directly addresses the patient's specific question
2. References relevant clinical guidelines where appropriate (JNC 8, AHA, ESC)
3. Interprets the patient's blood pressure data in context
4. Considers ALL lifestyle factors in your response, including weight if relevant to the question
5. Uses plain language while maintaining medical accuracy
6. Includes a brief disclaimer that this is not a substitute for medical advice

If the question is about weight and blood pressure, explain the relationship between weight management and hypertension control according to medical research.

If the question is about a medical emergency or requires immediate attention based on the readings, emphasize the importance of seeking prompt medical care.`;
  }

  getFallbackInsights(analysisData) {
    const { riskAssessment, trendAnalysis } = analysisData;
    const riskLevel = riskAssessment?.overall || 'unknown';
    const trend = trendAnalysis?.systolic?.direction || 'stable';

    let insight = '';
    if (riskLevel === 'high') {
      insight = 'Your blood pressure readings indicate elevated cardiovascular risk. Consistent monitoring and lifestyle modifications are recommended.';
    } else if (riskLevel === 'moderate') {
      insight = 'Your blood pressure shows moderate risk levels. Continue monitoring and consider preventive measures.';
    } else {
      insight = 'Your blood pressure readings are within normal ranges. Maintain your current healthy lifestyle.';
    }

    if (trend === 'increasing') {
      insight += ' However, there is an upward trend that warrants attention.';
    } else if (trend === 'decreasing') {
      insight += ' The downward trend is positive and encouraging.';
    }

    return {
      insights: insight,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  }

  getFallbackRecommendations(riskAssessment) {
    const riskLevel = riskAssessment?.overall || 'unknown';
    
    const recommendations = {
      low: [
        'Continue regular blood pressure monitoring',
        'Maintain a balanced diet and regular exercise',
        'Keep stress levels manageable'
      ],
      moderate: [
        'Increase monitoring frequency to daily',
        'Focus on diet modifications (reduce sodium)',
        'Consider stress management techniques'
      ],
      high: [
        'Consult with a healthcare provider immediately',
        'Implement aggressive lifestyle changes',
        'Monitor blood pressure multiple times daily'
      ]
    };

    return {
      recommendations: recommendations[riskLevel] || recommendations.low,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  }

  getFallbackAnswer(question, userData) {
    const recentReadings = userData?.readings?.slice(0, 5) || [];
    const avgSystolic = recentReadings.length > 0 ? 
      recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length : 0;
    const avgDiastolic = recentReadings.length > 0 ? 
      recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length : 0;

    // Simple keyword-based responses
    if (question.toLowerCase().includes('normal') || question.toLowerCase().includes('good')) {
      return {
        answer: `Normal blood pressure is typically below 120/80 mmHg. Your recent average of ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg ${avgSystolic < 120 && avgDiastolic < 80 ? 'is within normal range' : 'may indicate elevated levels'}.`,
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    if (question.toLowerCase().includes('high') || question.toLowerCase().includes('elevated')) {
      return {
        answer: `High blood pressure (hypertension) is generally considered 140/90 mmHg or higher. Your recent readings average ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg. ${avgSystolic >= 140 || avgDiastolic >= 90 ? 'These levels suggest elevated blood pressure that should be discussed with a healthcare provider.' : 'Your levels appear to be within acceptable ranges.'}`,
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    return {
      answer: `Based on your recent blood pressure readings averaging ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg, I recommend continuing regular monitoring and maintaining a healthy lifestyle. For specific medical advice, please consult with a healthcare provider.`,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = HuggingFaceService;
