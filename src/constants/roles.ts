// Standardized role options across the application
export const JOB_ROLES = [
  { value: 'software-developer', label: 'Software Developer' },
  { value: 'product-manager', label: 'Product Manager' },
] as const;

export type JobRole = typeof JOB_ROLES[number]['value'];
