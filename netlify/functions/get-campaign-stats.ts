import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { CampaignStats, BLOB_STORES, CAMPAIGN_ID, CAMPAIGN_TARGET } from './types';

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
    console.log('📊 Fetching campaign statistics from blob storage');

    // Get campaign statistics from Netlify Blobs
    const campaignStats = await getCampaignStats();

    console.log('📊 Campaign stats retrieved:', {
      total: campaignStats.total_amount,
      count: campaignStats.donation_count,
      progress: campaignStats.progress_percentage.toFixed(2) + '%'
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: campaignStats,
        meta: {
          source: 'netlify_blobs',
          note: 'Real-time campaign statistics from webhook data.',
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

// Helper function to retrieve campaign statistics from blob storage
async function getCampaignStats(): Promise<CampaignStats> {
  try {
    const statsStore = getStore(BLOB_STORES.STATS);
    const statsKey = CAMPAIGN_ID;

    const statsBlob = await statsStore.get(statsKey);

    if (statsBlob) {
      const stats: CampaignStats = JSON.parse(await statsBlob.text());
      console.log('📊 Found existing campaign stats in blob storage');
      return stats;
    } else {
      // No stats found, return initial stats
      console.log('📊 No existing stats found, returning initial state');
      const initialStats: CampaignStats = {
        campaign: CAMPAIGN_ID,
        total_amount: 0,
        donation_count: 0,
        target: CAMPAIGN_TARGET,
        progress_percentage: 0,
        last_updated: new Date().toISOString()
      };

      // Store initial stats for future use
      await statsStore.set(statsKey, JSON.stringify(initialStats), {
        metadata: {
          total_amount: '0',
          donation_count: '0',
          last_updated: initialStats.last_updated
        }
      });

      return initialStats;
    }
  } catch (error) {
    console.error('❌ Error retrieving campaign stats from blob storage:', error);

    // Fallback to initial stats if blob storage fails
    return {
      campaign: CAMPAIGN_ID,
      total_amount: 0,
      donation_count: 0,
      target: CAMPAIGN_TARGET,
      progress_percentage: 0,
      last_updated: new Date().toISOString()
    };
  }
}

export { handler };