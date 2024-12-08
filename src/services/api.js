import { API_CONFIG } from '../config/api.config';
import OpenAI from 'openai';

// API endpoints
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const AI_ENDPOINTS = {
  ANALYZE: `${API_BASE_URL}/api/document/analyze`,
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: API_CONFIG.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development, use backend proxy in production
});

/**
 * Analyzes a document using AI and generates improvements
 * @param {Object} file - The file object to analyze
 * @param {AbortSignal} [signal] - Optional AbortController signal for cancellation
 * @returns {Promise<Object>} Analysis results and improvements
 */
export const analyzeDocument = async (file, signal) => {
  try {
    // Extract necessary file information
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };

    // First, detect file type
    const fileType = detectFileType(fileInfo);
    
    // Read file content and metadata
    const metadata = await getFileInfo(file);
    
    // Process the document
    let analysisResults = [];
    if (metadata.content) {
      const chunks = splitIntoChunks(metadata.content, 4000); // Smaller chunks for better processing
      
      // Analyze each chunk
      for (let i = 0; i < Math.min(chunks.length, 3); i++) {
        const prompt = generateAnalysisPrompt(fileType, { 
          ...fileInfo,
          content: chunks[i],
          dimensions: metadata.dimensions 
        });
        const analysis = await getOpenAIAnalysis(prompt, signal);
        analysisResults.push(analysis);
      }
    } else {
      // For non-text files, analyze metadata
      const prompt = generateAnalysisPrompt(fileType, {
        ...fileInfo,
        dimensions: metadata.dimensions
      });
      const analysis = await getOpenAIAnalysis(prompt, signal);
      analysisResults.push(analysis);
    }
    
    // Combine and format results
    return formatAnalysisResponse(fileType, analysisResults);
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze document: ' + error.message);
  }
};

/**
 * Detects file type based on file object
 * @param {Object} file - The file to analyze
 * @returns {string} Detected file type
 */
const detectFileType = (fileInfo) => {
  const mimeType = fileInfo.type.toLowerCase();
  const fileName = fileInfo.name.toLowerCase();

  if (mimeType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
    return 'Picture';
  }
  if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
    return 'Secure Document';
  }
  if (fileName.match(/\.(dwg|dxf|cad)$/)) {
    return 'Blueprint';
  }
  return 'Text Document';
};

/**
 * Gets file information based on type
 * @param {Object} file - The file to analyze
 * @returns {Promise<Object>} File information
 */
const getFileInfo = async (file) => {
  const info = {
    content: null,
    dimensions: null
  };

  try {
    if (file.type.startsWith('text/') || file.type === 'application/json') {
      const content = await readFileAsText(file);
      info.content = content;
    } else if (file.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(file);
      info.dimensions = dimensions;
    }
  } catch (error) {
    console.error('Error reading file:', error);
  }

  return info;
};

/**
 * Reads file as text
 * @param {Object} file - The file to read
 * @returns {Promise<string>} File content as text
 */
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Gets image dimensions
 * @param {Object} file - Image file
 * @returns {Promise<Object>} Image dimensions
 */
const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generates analysis prompt for OpenAI
 * @param {string} fileType - Type of file
 * @param {Object} fileInfo - File information
 * @returns {string} Generated prompt
 */
const generateAnalysisPrompt = (fileType, fileInfo) => {
  let prompt = `Analyze the following ${fileType.toLowerCase()} for optimal printing:\n\n`;
  
  // Add file metadata
  prompt += `File Name: ${fileInfo.name}\n`;
  prompt += `File Type: ${fileInfo.type}\n`;
  prompt += `File Size: ${formatFileSize(fileInfo.size)}\n`;
  
  // Add specific details based on file type
  if (fileInfo.dimensions) {
    prompt += `Dimensions: ${fileInfo.dimensions.width}x${fileInfo.dimensions.height}px\n`;
    prompt += `Resolution: ${Math.round((fileInfo.dimensions.width * fileInfo.dimensions.height) / 1000000)}MP\n`;
  }
  
  // Add content for analysis if available
  if (fileInfo.content) {
    prompt += `\nContent Preview:\n${fileInfo.content.substring(0, 500)}${fileInfo.content.length > 500 ? '...' : ''}\n`;
  }
  
  prompt += '\nPlease analyze for the following aspects:\n';
  prompt += '1. Print Quality Assessment:\n';
  prompt += '   - Resolution and clarity\n';
  prompt += '   - Color balance and contrast\n';
  prompt += '   - Text readability if applicable\n\n';
  
  prompt += '2. Format Optimization:\n';
  prompt += '   - Recommended paper size\n';
  prompt += '   - Page orientation\n';
  prompt += '   - Margins and layout\n\n';
  
  prompt += '3. Print Settings:\n';
  prompt += '   - Color mode (color/grayscale/b&w)\n';
  prompt += '   - Quality settings\n';
  prompt += '   - Special handling instructions\n\n';
  
  prompt += '4. Suggested Improvements:\n';
  prompt += '   - Quality enhancements\n';
  prompt += '   - Format adjustments\n';
  prompt += '   - Cost-saving opportunities\n';
  
  return prompt;
};

/**
 * Formats file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets analysis from OpenAI
 * @param {string} prompt - Analysis prompt
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Object>} OpenAI response
 */
const getOpenAIAnalysis = async (prompt, signal) => {
  try {
    const systemPrompt = `You are an expert document analyzer specializing in print optimization. 
    Analyze the provided document and suggest improvements for print quality and readability. 
    Format your response as JSON with the following structure:
    {
      "analysis": "Brief analysis of the document's current state",
      "improvements": ["List of specific improvements"],
      "settings": {
        "quality": "Suggested print quality",
        "colorMode": "Color mode recommendation",
        "paperSize": "Recommended paper size",
        "orientation": "Portrait or Landscape",
        "additionalNotes": "Any special printing instructions"
      }
    }`;

    const response = await openai.chat.completions.create({
      model: API_CONFIG.OPENAI.MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
      signal: signal
    });

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    // Ensure all required fields exist
    return {
      analysis: parsedContent.analysis || 'Document analyzed successfully',
      improvements: Array.isArray(parsedContent.improvements) ? parsedContent.improvements : [],
      settings: {
        quality: parsedContent.settings?.quality || 'Standard',
        colorMode: parsedContent.settings?.colorMode || 'Auto',
        paperSize: parsedContent.settings?.paperSize || 'A4',
        orientation: parsedContent.settings?.orientation || 'Portrait',
        additionalNotes: parsedContent.settings?.additionalNotes || ''
      }
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to analyze document: ' + error.message);
  }
};

/**
 * Formats the analysis response
 * @param {string} fileType - Type of file
 * @param {Object[]} analysisResults - OpenAI analysis results
 * @returns {Object} Formatted response
 */
const formatAnalysisResponse = (fileType, analysisResults) => {
  // Combine all analysis results from chunks
  const improvements = [];
  const settings = {
    quality: 'High',
    colorMode: 'Auto',
    paperSize: 'Auto',
    orientation: 'Auto'
  };
  let analysis = '';

  analysisResults.forEach(result => {
    if (result.improvements) {
      improvements.push(...(Array.isArray(result.improvements) ? result.improvements : [result.improvements]));
    }
    if (result.settings) {
      Object.assign(settings, result.settings);
    }
    if (result.analysis) {
      analysis += (analysis ? '\n' : '') + result.analysis;
    }
  });

  // Apply file type specific settings
  switch (fileType) {
    case 'Picture':
      settings.quality = 'Photo Quality';
      settings.colorMode = 'Full Color';
      break;
    case 'Secure Document':
      settings.quality = 'High';
      settings.colorMode = 'Grayscale';
      break;
    case 'Blueprint':
      settings.quality = 'High';
      settings.paperSize = 'A2';
      settings.orientation = 'Landscape';
      break;
    default:
      settings.quality = 'Standard';
      settings.colorMode = 'Black & White';
  }

  return {
    fileType,
    analysis: analysis || 'Document analyzed successfully',
    improvements: Array.from(new Set(improvements)), // Remove duplicates
    settings
  };
};

/**
 * Splits text into chunks for analysis
 * @param {string} text - Text to split
 * @param {number} chunkSize - Chunk size
 * @returns {string[]} Chunks of text
 */
const splitIntoChunks = (text, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, Math.min(i + chunkSize, text.length)));
  }
  return chunks;
};
