// Detect file type based on mime type and name
const detectFileType = (file) => {
  if (file.name.toLowerCase().includes('blueprint') || 
      file.name.toLowerCase().includes('architectural') ||
      file.name.endsWith('.dwg')) {
    return 'Blueprint';
  }
  
  if (file.name.toLowerCase().includes('confidential') ||
      file.name.toLowerCase().includes('contract') ||
      file.name.toLowerCase().includes('legal')) {
    return 'Secure Document';
  }
  
  if (file.name.toLowerCase().includes('scan') ||
      file.name.toLowerCase().includes('scanned')) {
    return 'Scanned Document';
  }
  
  if (file.type.startsWith('image/')) {
    return 'Picture';
  }
  
  return 'Text Document';
};

// Helper function to format bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate analysis prompt based on file information
const generateAnalysisPrompt = (file, fileType) => {
  const prompt = `You are an AI print optimization system analyzing a ${fileType.toLowerCase()}. 
Filename: "${file.name}"
File size: ${formatBytes(file.size)}

Generate a simulated analysis as if you've already processed and improved the document. Focus on common printing-related issues and their solutions. DO NOT suggest changes - instead, report improvements you've already made.

For a ${fileType.toLowerCase()}, simulate that you have:
${fileType === 'Text Document' ? `
- Found and fixed spelling/grammar issues
- Optimized text formatting
- Adjusted margins and spacing` : ''}
${fileType === 'Picture' ? `
- Enhanced image quality
- Optimized color balance
- Adjusted resolution for printing` : ''}
${fileType === 'Blueprint' ? `
- Enhanced line clarity
- Optimized scale and dimensions
- Improved detail visibility` : ''}
${fileType === 'Scanned Document' ? `
- Enhanced text clarity
- Fixed alignment issues
- Improved overall readability` : ''}
${fileType === 'Secure Document' ? `
- Applied security measures
- Added necessary watermarks
- Enhanced document tracking` : ''}

Respond with a JSON object:
{
  "analysis": "A brief, specific list of what was found (2-3 items)",
  "improvements": "A confident statement of fixes already applied (2-3 specific improvements)",
  "settings": {
    // 3-4 relevant printer settings optimized for this specific file type
    // Include paper size, quality settings, and any special requirements
  }
}

Keep the response realistic - focus on basic improvements that would actually be possible in a print optimization system. Avoid mentioning content changes or structural modifications.`;

  return prompt;
};

// Create the mock function
const analyzeDocument = jest.fn((file) => {
  return new Promise(async (resolve) => {
    const fileType = detectFileType(file);
    const prompt = generateAnalysisPrompt(file, fileType);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: prompt
          }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const aiResponse = JSON.parse(data.choices[0].message.content);

      resolve({
        fileType: fileType,
        analysis: aiResponse.analysis,
        improvements: aiResponse.improvements,
        settings: aiResponse.settings,
        status: 'Success',
        message: 'Your document has been processed successfully and sent to the printer with the specified settings. Please check the printer to collect your document shortly.'
      });
    } catch (error) {
      // Fallback responses in case of API issues
      const fallbackResponses = {
        'Text Document': {
          analysis: 'Detected minor formatting inconsistencies and 2 spelling errors.',
          improvements: 'Standardized document formatting and corrected all spelling errors.',
          settings: {
            paperSize: 'A4',
            quality: 'Standard',
            duplex: 'Enabled',
            colorMode: 'Black & White'
          }
        },
        'Picture': {
          analysis: 'Detected suboptimal color balance and resolution for printing.',
          improvements: 'Enhanced color accuracy and optimized resolution for print quality.',
          settings: {
            paperType: 'Photo Paper',
            quality: 'High',
            colorMode: 'Full Color',
            borderless: true
          }
        },
        'Blueprint': {
          analysis: 'Detected fine lines requiring clarity enhancement.',
          improvements: 'Optimized line weights and enhanced detail visibility.',
          settings: {
            paperSize: 'A1',
            quality: 'High',
            lineWeight: 'Enhanced',
            scaling: 'Original Size'
          }
        },
        'Scanned Document': {
          analysis: 'Detected slight skewing and text clarity issues.',
          improvements: 'Corrected alignment and enhanced text readability.',
          settings: {
            paperSize: 'A4',
            quality: 'High',
            contrast: 'Enhanced',
            colorMode: 'Black & White'
          }
        },
        'Secure Document': {
          analysis: 'Document processed with secure handling protocols.',
          improvements: 'Applied security watermark and tracking features.',
          settings: {
            paperSize: 'A4',
            watermark: 'Confidential',
            tracking: 'Enabled',
            secure: true
          }
        }
      };

      const fallback = fallbackResponses[fileType] || fallbackResponses['Text Document'];
      resolve({
        fileType: fileType,
        ...fallback,
        status: 'Success',
        message: 'Your document has been processed successfully and sent to the printer with the specified settings. Please check the printer to collect your document shortly.'
      });
    }
  });
});

module.exports = {
  analyzeDocument,
};
