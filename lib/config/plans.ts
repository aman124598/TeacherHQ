export type PlanType = 'starter' | 'growth' | 'enterprise';

export interface PlanLimits {
  maxMembers: number;
  features: string[];
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  starter: {
    maxMembers: 50,
    features: ['Basic Attendance', 'Location Verification', 'Email Support'],
  },
  growth: {
    maxMembers: 500,
    features: ['Advanced Analytics', 'Priority Support', 'Custom Reports'],
  },
  enterprise: {
    maxMembers: Infinity,
    features: ['Multi-Campus Support', 'Dedicated Account Manager', 'Custom API access'],
  },
};

export const getPlanDetails = (plan: string = 'starter'): PlanLimits => {
  return PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS.starter;
};
