const RISK = {
  LOW: { value: 'LOW', label: 'Low', color: 'text-green-500' },
  MEDIUM: { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-500' },
  HIGH: { value: 'HIGH', label: 'High', color: 'text-red-500' },
  CRITICAL: { value: 'CRITICAL', label: 'Critical', color: 'text-red-700' }
};

const RISKS = Object.values(RISK);

export { RISKS, RISK };
