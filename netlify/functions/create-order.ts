import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface DonationRequest {
  amount: number;
  name: string;
  email?: string;
  phone?: string;
}

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
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

  // Handle GET requests for testing
  if (event.httpMethod === 'GET') {
    console.log('🚀 Create order endpoint health check');

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Create Order Function is running',
        timestamp: new Date().toISOString(),
        domain: 'rebuildpunjab.sikhaidindia.com',
        campaign: 'youtuber_rebuild_punjab',
        environment: {
          razorpay_key_configured: !!razorpayKeyId,
          razorpay_secret_configured: !!razorpayKeySecret
        }
      })
    };
  }

  // Only allow POST requests for order creation
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('🚀 Processing order creation request');

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    let donationData: DonationRequest;
    try {
      donationData = JSON.parse(event.body);
    } catch (parseError) {
      console.error('❌ Invalid JSON in request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    // Validate input data
    const { amount, name, email, phone } = donationData;

    if (!amount || amount < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Amount must be at least ₹10' })
      };
    }

    if (!name || !name.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name is required' })
      };
    }

    // Get environment variables
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('❌ Razorpay credentials not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Payment gateway not configured' })
      };
    }

    // Create tracking receipt
    const timestamp = Date.now();
    const trackingReceipt = `ytcampaign_${timestamp}`;

    // Prepare order data for Razorpay
    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: trackingReceipt,
      notes: {
        campaign: 'youtuber_rebuild_punjab',
        source: 'subdomain_checkout',
        subdomain: 'rebuildpunjab.sikhaidindia.com',
        donor_name: name,
        donor_email: email || '',
        donor_phone: phone || '',
        tracking_receipt: trackingReceipt
      }
    };

    console.log('🚀 Creating Razorpay order:', { receipt: trackingReceipt, amount: amount });

    // Call Razorpay Orders API
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('❌ Razorpay API error:', razorpayResponse.status, errorText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create payment order' })
      };
    }

    const razorpayOrder: RazorpayOrderResponse = await razorpayResponse.json();

    console.log('✅ Razorpay order created successfully:', razorpayOrder.id);

    // Return order details for frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt
        },
        razorpay_key_id: razorpayKeyId,
        campaign_info: {
          name: 'Rebuild Punjab - Emergency Relief Fund',
          organizer: 'SikhAid India',
          domain: 'rebuildpunjab.sikhaidindia.com'
        }
      })
    };

  } catch (error) {
    console.error('❌ Error creating order:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };