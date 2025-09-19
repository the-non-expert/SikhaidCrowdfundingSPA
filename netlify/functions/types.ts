// Shared TypeScript interfaces for Netlify functions

export interface DonationRecord {
  paymentId: string;
  orderId: string;
  amount: number; // in INR (not paise)
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  method: string;
  timestamp: string;
  campaign: string;
  source: string;
  fee?: number;
  trackingReceipt?: string;
}

export interface CampaignStats {
  campaign: string;
  total_amount: number;
  donation_count: number;
  target: number;
  progress_percentage: number;
  last_updated: string;
  last_donation_timestamp?: string;
}

export interface RazorpayWebhookPayload {
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

// Blob store configuration
export const BLOB_STORES = {
  DONATIONS: 'campaign-donations',
  STATS: 'campaign-stats'
} as const;

export const CAMPAIGN_ID = 'youtuber_rebuild_punjab';
export const CAMPAIGN_TARGET = 1500000; // ₹15,00,000