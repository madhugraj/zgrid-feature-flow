// Enhanced test script for blood group PII generation
// Run this in browser console on /admin page

async function testBloodGroupPII() {
  try {
    console.log('=== Testing Blood Group PII Generation ===');
    console.log('Starting test...');
    
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
    
    console.log('Test request:', testRequest);
    
    // Get the Supabase client for authentication
    const supabaseClient = window.supabase || window._supabase;
    if (!supabaseClient) {
      console.error('Supabase client not found. Make sure you are on the admin page.');
      return;
    }
    
    // Get the session token
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      console.error('No authenticated session found. Please log in first.');
      return;
    }
    
    console.log('Making request to edge function...');
    
    const response = await fetch('https://bgczwmnqxmxusfwapqcn.supabase.co/functions/v1/ai-config-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY3p3bW5xeG14dXNmd2FwcWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzYxOTIsImV4cCI6MjA3MjYxMjE5Mn0.TiUflKd1tsEeevILeZ7zWs93lcEheBuvH4mC_D8m-W4'
      },
      body: JSON.stringify(testRequest)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    if (!response.ok) {
      console.error('❌ Request failed!');
      console.error('Status:', response.status, response.statusText);
      console.error('Response:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        console.error('Parsed error:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }
      
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }
    
    try {
      const result = JSON.parse(responseText);
      console.log('✅ Success! Generated configuration:');
      console.log(result);
      
      if (result.configData) {
        console.log('📋 Generated Config Data:');
        console.log(JSON.stringify(result.configData, null, 2));
      }
      
      if (result.confidence) {
        console.log(`🎯 Confidence Score: ${result.confidence}`);
      }
      
      return result;
    } catch (parseError) {
      console.error('❌ Failed to parse successful response as JSON:', parseError);
      console.error('Raw response:', responseText);
      throw parseError;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Also create a simple test that bypasses authentication for debugging
async function testDirectEndpoint() {
  console.log('=== Testing Direct Endpoint (No Auth) ===');
  
  try {
    const response = await fetch('https://bgczwmnqxmxusfwapqcn.supabase.co/functions/v1/ai-config-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceName: 'PII',
        configType: 'entities',
        sampleInputs: ['Test input'],
        description: 'Test description'
      })
    });
    
    const text = await response.text();
    console.log('Direct test response:', response.status, text);
    
  } catch (error) {
    console.error('Direct test error:', error);
  }
}

// Run both tests
console.log('🧪 Blood Group PII Generation Test Suite');
console.log('Run testBloodGroupPII() to test with authentication');
console.log('Run testDirectEndpoint() to test without authentication');

// Auto-run the main test
testBloodGroupPII();