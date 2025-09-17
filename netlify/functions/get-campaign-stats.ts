import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface CampaignStats {
  campaign: string;
  total_amount: number;
  donation_count: number;
  target: number;
  progress_percentage: number;
  last_updated: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use GET to fetch campaign stats.' })
    };
  }

  try {
    console.log('📊 Fetching campaign statistics');

    // Mock data structure - will be replaced with real KV storage later
    const mockStats: CampaignStats = {
      campaign: 'youtuber_rebuild_punjab',
      total_amount: 50000, // Mock amount in INR
      donation_count: 25,
      target: 3000000, // ₹30,00,000 target
      progress_percentage: 1.67, // 50000/3000000 * 100
      last_updated: new Date().toISOString()
    };

    console.log('📊 Campaign stats retrieved:', {
      total: mockStats.total_amount,
      count: mockStats.donation_count,
      progress: mockStats.progress_percentage
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: mockStats,
        meta: {
          source: 'mock_data',
          note: 'This is mock data. Real-time stats will be implemented with webhook integration.',
          domain: 'rebuildpunjab.sikhaidindia.com',
          organizer: 'SikhAid India'
        }
      })
    };

  } catch (error) {
    console.error('❌ Error fetching campaign stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch campaign statistics',
        success: false
      })
    };
  }
};

export { handler };