// Standardized role options across the application
export const JOB_ROLES = [
  { value: 'Software Developer', label: 'Software Developer' },
  { value: 'Product Manager', label: 'Product Manager' },
] as const;

export type JobRole = typeof JOB_ROLES[number]['value'];
