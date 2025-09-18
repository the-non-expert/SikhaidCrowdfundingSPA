import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import crypto from 'crypto';
import { getStore } from '@netlify/blobs';
import { DonationRecord, CampaignStats, RazorpayWebhookPayload, BLOB_STORES, CAMPAIGN_ID, CAMPAIGN_TARGET } from './types';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-razorpay-signature',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  console.log('🔔 Webhook request received:', event.httpMethod);

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Handle GET requests for testing
  if (event.httpMethod === 'GET') {
    console.log('🔔 Webhook endpoint health check');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Razorpay Webhook Endpoint is Working!',
        timestamp: new Date().toISOString(),
        status: 'ready',
        campaign: 'youtuber_rebuild_punjab',
        domain: 'rebuildpunjab.sikhaidindia.com',
        environment: {
          webhook_secret_configured: !!webhookSecret
        },
        supported_events: ['payment.captured', 'payment.authorized', 'payment.failed'],
        note: 'This endpoint is ready to receive Razorpay webhook notifications'
      })
    };
  }

  // Only allow POST requests for webhook processing
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = event.body;
    const signature = event.headers['x-razorpay-signature'];
    
    console.log('📦 Webhook details:', {
      hasBody: !!body,
      hasSignature: !!signature,
      bodyLength: body ? body.length : 0
    });

    // Get webhook secret
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret && signature && body) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
      }
      console.log('✅ Webhook signature verified');
    } else if (!webhookSecret) {
      console.warn('⚠️ Webhook secret not configured - signature verification skipped');
    }

    // Parse webhook payload
    if (!body) {
      console.error('❌ Empty webhook body');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Empty request body' })
      };
    }

    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ Invalid JSON in webhook body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON payload' })
      };
    }

    console.log('📦 Event type:', payload.event);

    // Handle successful payment events
    if (payload.event === 'payment.captured' || payload.event === 'payment.authorized') {
      const payment = payload.payload.payment.entity;
      const eventType = payload.event === 'payment.captured' ? 'captured' : 'authorized';

      console.log(`💳 Payment ${eventType}:`, {
        id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        notes: payment.notes
      });

      // Check if this is a YouTuber campaign payment
      const isYoutuberCampaign = checkIfYoutuberPayment(payment);

      if (isYoutuberCampaign.isYoutuber) {
        console.log(`🎯 YouTuber campaign payment ${eventType}!`, {
          source: isYoutuberCampaign.source,
          amount: payment.amount / 100, // Convert to INR
          donor: payment.notes?.donor_name || payment.email || 'Anonymous'
        });

        // Store donation in Netlify Blobs
        const donationRecord: DonationRecord = {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100, // Convert to INR
          donorName: payment.notes?.donor_name || payment.email || 'Anonymous',
          donorEmail: payment.notes?.donor_email || payment.email || '',
          donorPhone: payment.notes?.donor_phone || payment.contact || '',
          method: payment.method,
          timestamp: new Date().toISOString(),
          campaign: CAMPAIGN_ID,
          source: isYoutuberCampaign.source,
          fee: payment.fee ? payment.fee / 100 : undefined,
          trackingReceipt: payment.notes?.tracking_receipt
        };

        console.log(`✅ YouTuber donation ${eventType}:`, donationRecord);

        // Store individual donation record
        await storeDonationRecord(donationRecord);

        // Update campaign statistics
        await updateCampaignStats(donationRecord);

      } else {
        console.log(`ℹ️ Non-YouTuber campaign payment ${eventType} - ignoring`, {
          reason: isYoutuberCampaign.reason,
          notes: payment.notes
        });
      }

    } else if (payload.event === 'payment.failed') {
      console.log('❌ Payment failed:', payload.payload.payment.entity.id);

    } else {
      console.log('ℹ️ Unhandled event type:', payload.event);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        event: payload.event,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('💥 Webhook processing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Webhook processing failed',
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Helper function to identify YouTuber campaign payments
function checkIfYoutuberPayment(payment: any): { isYoutuber: boolean; source?: string; reason?: string } {
  // Method 1: Check campaign note from our order creation
  if (payment.notes?.campaign === 'youtuber_rebuild_punjab') {
    return { isYoutuber: true, source: 'subdomain_checkout' };
  }

  // Method 2: Check tracking receipt pattern
  if (payment.notes?.tracking_receipt?.startsWith('ytcampaign_')) {
    return { isYoutuber: true, source: 'tracked_receipt' };
  }

  // Method 3: Check subdomain note
  if (payment.notes?.subdomain === 'rebuildpunjab.sikhaidindia.com') {
    return { isYoutuber: true, source: 'subdomain_verified' };
  }

  // Method 4: Check source note
  if (payment.notes?.source === 'subdomain_checkout') {
    return { isYoutuber: true, source: 'source_tag' };
  }

  return { 
    isYoutuber: false, 
    reason: 'No matching YouTuber campaign identifiers found'
  };
}

// Helper function to store individual donation record
async function storeDonationRecord(donation: DonationRecord): Promise<void> {
  try {
    const donationsStore = getStore({
      name: BLOB_STORES.DONATIONS,
      siteID: process.env.NETLIFY_SITE_ID!,
      token: process.env.NETLIFY_ACCESS_TOKEN!
    });
    const donationKey = `${donation.timestamp}_${donation.paymentId}`;

    await donationsStore.set(donationKey, JSON.stringify(donation), {
      metadata: {
        campaign: donation.campaign,
        amount: donation.amount.toString(),
        timestamp: donation.timestamp,
        paymentId: donation.paymentId
      }
    });

    console.log('💾 Donation stored in blob:', donationKey);
  } catch (error) {
    console.error('❌ Error storing donation:', error);
    throw error;
  }
}

// Helper function to update campaign statistics
async function updateCampaignStats(newDonation: DonationRecord): Promise<void> {
  try {
    const statsStore = getStore({
      name: BLOB_STORES.STATS,
      siteID: process.env.NETLIFY_SITE_ID!,
      token: process.env.NETLIFY_ACCESS_TOKEN!
    });
    const statsKey = CAMPAIGN_ID;

    // Get current stats or create new ones
    let currentStats: CampaignStats;
    try {
      const existingStats = await statsStore.get(statsKey, { type: 'json' });
      if (existingStats) {
        currentStats = existingStats as CampaignStats;
      } else {
        throw new Error('No existing stats');
      }
    } catch {
      // Create initial stats if none exist
      currentStats = {
        campaign: CAMPAIGN_ID,
        total_amount: 0,
        donation_count: 0,
        target: CAMPAIGN_TARGET,
        progress_percentage: 0,
        last_updated: new Date().toISOString()
      };
    }

    // Update stats with new donation
    currentStats.total_amount += newDonation.amount;
    currentStats.donation_count += 1;
    currentStats.progress_percentage = Math.min((currentStats.total_amount / currentStats.target) * 100, 100);
    currentStats.last_updated = new Date().toISOString();
    currentStats.last_donation_timestamp = newDonation.timestamp;

    // Store updated stats
    const updateStatsStore = getStore({
      name: BLOB_STORES.STATS,
      siteID: process.env.NETLIFY_SITE_ID!,
      token: process.env.NETLIFY_ACCESS_TOKEN!
    });
    await updateStatsStore.set(statsKey, JSON.stringify(currentStats), {
      metadata: {
        total_amount: currentStats.total_amount.toString(),
        donation_count: currentStats.donation_count.toString(),
        last_updated: currentStats.last_updated
      }
    });

    console.log('📊 Campaign stats updated:', {
      total: currentStats.total_amount,
      count: currentStats.donation_count,
      progress: currentStats.progress_percentage.toFixed(2) + '%'
    });

  } catch (error) {
    console.error('❌ Error updating campaign stats:', error);
    throw error;
  }
}

export { handler };