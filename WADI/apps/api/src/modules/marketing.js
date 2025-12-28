/**
 * Marketing & Commerce Module
 * Tipos y stubs para campañas, audiencias y productos.
 */

export const CampaignStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
};

class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

class Audience {
  constructor(demographic, size) {
    this.demographic = demographic;
    this.size = size;
  }
}

export const generateMarketingPlanDraft = async (productName) => {
  console.log("[Marketing] Generating plan draft for:", productName);
  return {
    title: `Launch Plan for ${productName}`,
    channels: ["Social Media", "Email", "Paid Ads"],
    budgetEstimate: 5000,
    timelineWeeks: 4,
  };
};

export const createCampaign = async (campaignData) => {
  console.log("[Marketing] Creating campaign:", campaignData.name);
  return {
    id: `camp_${Math.random().toString(36).substr(2, 5)}`,
    ...campaignData,
    status: CampaignStatus.DRAFT,
    createdAt: new Date(),
  };
};

export const segmentAudience = async (criteria) => {
  console.log("[Marketing] Segmenting audience by:", criteria);
  return {
    segmentId: `seg_${Math.random().toString(36).substr(2, 5)}`,
    estimatedSize: 1000 + Math.floor(Math.random() * 5000),
    audienceObj: new Audience(criteria, 1000),
  };
};
