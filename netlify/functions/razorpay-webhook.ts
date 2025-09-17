import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import crypto from 'crypto';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        email?: string;
        contact?: string;
        notes?: Record<string, string>;
        created_at: number;
        fee?: number;
      };
    };
  };
}

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
        supported_events: ['payment.captured', 'payment.failed'],
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
    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      
      console.log('💳 Payment captured:', {
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
        console.log('🎯 YouTuber campaign payment detected!', {
          source: isYoutuberCampaign.source,
          amount: payment.amount / 100, // Convert to INR
          donor: payment.notes?.donor_name || payment.email || 'Anonymous'
        });

        // TODO: Store in Netlify KV here
        // For now, just log the payment
        const donationRecord = {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100, // Convert to INR
          donorName: payment.notes?.donor_name || payment.email || 'Anonymous',
          donorEmail: payment.notes?.donor_email || payment.email || '',
          method: payment.method,
          timestamp: new Date().toISOString(),
          campaign: 'youtuber_rebuild_punjab',
          source: isYoutuberCampaign.source
        };

        console.log('✅ YouTuber donation recorded:', donationRecord);
        
      } else {
        console.log('ℹ️ Non-YouTuber campaign payment - ignoring', {
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

export { handler };