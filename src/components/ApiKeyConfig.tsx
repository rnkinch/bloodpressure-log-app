import React, { useState, useEffect, useCallback } from 'react';
import { Key, Eye, EyeOff, Save, Check, AlertCircle } from 'lucide-react';

interface ApiKeyConfigProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('distilbert-base-uncased-finetuned-sst-2-english');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Available models with descriptions
  const availableModels = [
    {
      id: 'distilbert-base-uncased-finetuned-sst-2-english',
      name: 'DistilBERT SST-2',
      description: 'Sentiment analysis model, guaranteed to work with Inference API',
      category: 'Classification'
    },
    {
      id: 'emilyalsentzer/Bio_ClinicalBERT',
      name: 'Bio_ClinicalBERT',
      description: 'Medical model trained on clinical text, ideal for health data',
      category: 'Medical'
    },
    {
      id: 'medicalai/ClinicalBERT',
      name: 'ClinicalBERT',
      description: 'Specialized for medical text analysis and clinical notes',
      category: 'Medical'
    },
    {
      id: 'facebook/bart-large-mnli',
      name: 'BART MNLI',
      description: 'Text classification and entailment model',
      category: 'Classification'
    }
  ];

  const checkApiKeyStatus = useCallback(async () => {
    try {
      // Check if API key exists in database
      const settingsResponse = await fetch(`${apiUrl}/api/settings/huggingface_api_key`);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.value) {
          setApiKey(settingsData.value);
          setIsConfigured(true);
        }
      }
      
      // Check for model preference
      const modelResponse = await fetch(`${apiUrl}/api/settings/huggingface_model`);
      if (modelResponse.ok) {
        const modelData = await modelResponse.json();
        if (modelData.value) {
          setSelectedModel(modelData.value);
        }
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    // Check if API key is already configured
    checkApiKeyStatus();
  }, [checkApiKeyStatus]);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage('Please enter your Hugging Face API key');
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    setMessage('Validating API key...');

    try {
      // Test the API key by making a request to Hugging Face
      const response = await fetch(`${apiUrl}/api/analysis/test-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey, model: selectedModel }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setIsValid(true);
          setMessage(`API key is valid! Using model: ${data.model || selectedModel}. AI features are now enabled.`);
          setIsConfigured(true);
          onApiKeySet(apiKey);
        } else {
          setIsValid(false);
          setMessage(data.error || 'Invalid API key. Please check and try again.');
        }
      } else {
        setIsValid(false);
        setMessage('Failed to validate API key. Please try again.');
      }
    } catch (error) {
      setIsValid(false);
      setMessage('Error validating API key. Please check your connection.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage('Please enter your Hugging Face API key');
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    setMessage('Saving API key and model preference to database...');

    try {
      // Save API key to database
      const apiKeyResponse = await fetch(`${apiUrl}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: 'huggingface_api_key', value: apiKey }),
      });

      // Save model preference to database
      const modelResponse = await fetch(`${apiUrl}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: 'huggingface_model', value: selectedModel }),
      });

      if (apiKeyResponse.ok && modelResponse.ok) {
        // Validate the API key
        await validateApiKey();
      } else {
        throw new Error('Failed to save settings to database');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings. Please try again.');
      setIsValid(false);
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setIsValid(null);
    setMessage('');
    setIsConfigured(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <Key className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">API Key Configuration</h2>
          <p className="text-gray-600">Configure your Hugging Face API key for enhanced AI features</p>
        </div>
      </div>

      {isConfigured && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">API key is configured and working!</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Enhanced AI features are now available. You can ask questions and get AI-powered insights.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            Hugging Face API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your API key is stored locally in your browser and never sent to our servers
          </p>
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            AI Model Selection
          </label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.category}) - {model.description}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose the AI model that best fits your needs. Medical models are specialized for health analysis.
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            isValid === true 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : isValid === false 
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              {isValid === false && <AlertCircle className="h-4 w-4 mr-2" />}
              {isValid === true && <Check className="h-4 w-4 mr-2" />}
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={isValidating || !apiKey.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {isValidating ? 'Validating...' : 'Save & Validate'}
          </button>
          
          <button
            onClick={handleClear}
            disabled={isValidating}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">How to get your Hugging Face API key:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Go to <a href="https://huggingface.co/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Hugging Face</a></li>
          <li>Create a free account (no credit card required)</li>
          <li>Go to Settings → Access Tokens</li>
          <li>Click "New Token" and select "Read" permissions</li>
          <li>Copy the token and paste it above</li>
        </ol>
        <p className="text-xs text-gray-500 mt-2">
          <strong>Free tier:</strong> 30,000 requests per month • <strong>Privacy:</strong> Your key stays in your browser
        </p>
      </div>
    </div>
  );
};

export default ApiKeyConfig;
