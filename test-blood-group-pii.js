// Test script for blood group PII generation
// Run this in browser console on /admin page

async function testBloodGroupPII() {
  try {
    console.log('Testing blood group PII generation...');
    
    const testRequest = {
      serviceName: 'PII',
      configType: 'entities',
      sampleInputs: [
        'Patient has blood type A+',
        'My blood group is O negative',
        'Patient Blood Type: B+',
        'AB positive blood donor needed',
        'Blood group: O+',
        'Type AB- blood sample collected'
      ],
      description: 'Generate PII patterns for blood group detection in medical text'
    };
    
    const response = await fetch('/api/ai-config-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Success! Generated configuration:', result);
    
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Run the test
testBloodGroupPII();