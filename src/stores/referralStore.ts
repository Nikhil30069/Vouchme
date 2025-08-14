import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/integrations/supabase/types';

type ScoringParameter = Database['public']['Tables']['scoring_parameters']['Row'];
type ReferralRequest = Database['public']['Tables']['referral_requests']['Row'];
type Score = Database['public']['Tables']['scores']['Row'];
type JobPosting = Database['public']['Tables']['job_postings']['Row'];
type CandidateMatch = Database['public']['Tables']['candidate_matches']['Row'];

interface EligibleReferrer {
  referrer_id: string;
  referrer_name: string;
  referrer_role: string;
  referrer_experience: number;
  organization: string;
  job_role?: string;
  job_experience?: number;
}

interface TopCandidate {
  seeker_id: string;
  seeker_name: string;
  seeker_role: string;
  seeker_experience: number;
  strength_score: number;
  total_scores: number;
  expected_ctc: number;
  current_ctc: number;
}

interface ReferralState {
  // State
  scoringParameters: ScoringParameter[];
  referralRequests: ReferralRequest[];
  scores: Score[];
  jobPostings: JobPosting[];
  candidateMatches: CandidateMatch[];
  eligibleReferrers: EligibleReferrer[];
  topCandidates: TopCandidate[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchScoringParameters: () => Promise<void>;
  fetchReferralRequests: (userId: string) => Promise<void>;
  fetchScores: (userId: string) => Promise<void>;
  fetchJobPostings: (recruiterId?: string) => Promise<void>;
  fetchCandidateMatches: (jobPostingId?: string) => Promise<void>;
  findEligibleReferrers: (role: string, experience: number) => Promise<void>;
  findEligibleReferrersForJob: (jobRequirementId: string) => Promise<void>;
  getTopCandidates: (jobPostingId: string) => Promise<void>;
  
  // Mutations
  createReferralRequest: (data: {
    seeker_id: string;
    referrer_id: string;
    job_requirement_id: string;
    job_role: string;
    seeker_experience_years: number;
  }) => Promise<void>;
  
  updateReferralRequestStatus: (requestId: string, status: string) => Promise<void>;
  
  createScore: (data: {
    referral_request_id: string;
    referrer_id: string;
    seeker_id: string;
    parameter_id: string;
    score: number;
    comments?: string;
  }) => Promise<void>;
  
  createJobPosting: (data: {
    recruiter_id: string;
    role: string;
    years_of_experience: number;
    salary_min?: number;
    salary_max?: number;
    description?: string;
    requirements?: string[];
  }) => Promise<void>;
  
  updateJobPosting: (jobId: string, data: {
    is_active?: boolean;
    title?: string;
    role?: string;
    years_of_experience?: number;
    salary_min?: number;
    salary_max?: number;
    description?: string;
    requirements?: string[];
  }) => Promise<void>;
  
  updateCandidateMatch: (seekerId: string, jobPostingId: string, recruiterId: string, data: {
    is_interested?: boolean;
    phone_unlocked?: boolean;
  }) => Promise<void>;
  
  getCandidateContactDetails: (seekerId: string) => Promise<{
    phone: string;
    email: string;
  } | null>;
  
  calculateStrengthScore: (seekerId: string) => Promise<number>;
  
  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useReferralStore = create<ReferralState>((set, get) => ({
  // Initial state
  scoringParameters: [],
  referralRequests: [],
  scores: [],
  jobPostings: [],
  candidateMatches: [],
  eligibleReferrers: [],
  topCandidates: [],
  loading: false,
  error: null,

  // Actions
  fetchScoringParameters: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('scoring_parameters')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      set({ scoringParameters: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch scoring parameters' });
    } finally {
      set({ loading: false });
    }
  },

  fetchReferralRequests: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('🔍 [FETCH] Starting to fetch referral requests for user:', userId);
      
      // Build the query
      const query = supabase
        .from('referral_requests')
        .select('*')
        .or(`seeker_id.eq.${userId},referrer_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      console.log('📋 [FETCH] Query built:', {
        table: 'referral_requests',
        select: '*',
        filter: `seeker_id.eq.${userId} OR referrer_id.eq.${userId}`,
        orderBy: 'created_at DESC'
      });
      
      const { data, error } = await query;

      console.log('📊 [FETCH] Query execution result:', { 
        success: !error,
        dataCount: data?.length || 0,
        data: data,
        error: error,
        query: `SELECT * FROM referral_requests WHERE seeker_id = '${userId}' OR referrer_id = '${userId}' ORDER BY created_at DESC`
      });

      if (error) {
        console.error('❌ [FETCH] Query failed:', error);
        throw error;
      }
      
      console.log('✅ [FETCH] Query successful, setting referral requests in store');
      console.log('📋 [FETCH] Referral requests found:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('📝 [FETCH] Referral request details:');
        data.forEach((req, index) => {
          console.log(`  ${index + 1}. ID: ${req.id}, Seeker: ${req.seeker_id}, Referrer: ${req.referrer_id}, Role: ${req.job_role}, Status: ${req.status}`);
        });
      } else {
        console.log('⚠️ [FETCH] No referral requests found for user:', userId);
      }
      
      set({ referralRequests: data || [] });
      console.log('✅ [FETCH] Referral requests updated in store');
      
    } catch (error) {
      console.error('💥 [FETCH] Error fetching referral requests:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch referral requests' });
    } finally {
      set({ loading: false });
    }
  },

  fetchScores: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          *,
          scoring_parameters(name, description),
          referral_requests(job_role, seeker_experience_years)
        `)
        .or(`seeker_id.eq.${userId},referrer_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ scores: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch scores' });
    } finally {
      set({ loading: false });
    }
  },

  fetchJobPostings: async (recruiterId?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('job_postings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (recruiterId) {
        query = query.eq('recruiter_id', recruiterId);
      }

      const { data, error } = await query;
      if (error) throw error;
      set({ jobPostings: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch job postings' });
    } finally {
      set({ loading: false });
    }
  },

  fetchCandidateMatches: async (jobPostingId?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('candidate_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobPostingId) {
        query = query.eq('job_posting_id', jobPostingId);
      }

      const { data, error } = await query;
      if (error) throw error;
      set({ candidateMatches: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch candidate matches' });
    } finally {
      set({ loading: false });
    }
  },

  findEligibleReferrers: async (role: string, experience: number) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .rpc('find_eligible_referrers', {
          seeker_role: role,
          seeker_experience: experience
        });

      if (error) throw error;
      set({ eligibleReferrers: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to find eligible referrers' });
    } finally {
      set({ loading: false });
    }
  },

  findEligibleReferrersForJob: async (jobRequirementId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .rpc('find_eligible_referrers_for_job', {
          job_requirement_uuid: jobRequirementId
        });

      if (error) throw error;
      set({ eligibleReferrers: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to find eligible referrers for job' });
    } finally {
      set({ loading: false });
    }
  },

  getTopCandidates: async (jobPostingId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching top candidates for job posting:', jobPostingId);

      const { data, error } = await supabase
        .rpc('get_top_candidates', {
          job_posting_uuid: jobPostingId,
          limit_count: 3
        });

      console.log('Top candidates response:', { data, error });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      set({ topCandidates: data || [] });
    } catch (error) {
      console.error('Failed to get top candidates:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get top candidates';
      set({ error: `Error: ${errorMessage}. Please check console for details.` });
    } finally {
      set({ loading: false });
    }
  },

  // Mutations
  createReferralRequest: async (data) => {
    set({ loading: true, error: null });
    try {
      console.log('🚀 [REFERRAL] Starting referral request creation...');
      console.log('📝 [REFERRAL] Request data:', JSON.stringify(data, null, 2));
      
      // Validate required fields
      if (!data.seeker_id || !data.referrer_id || !data.job_requirement_id || !data.job_role) {
        console.error('❌ [REFERRAL] Missing required fields:', {
          seeker_id: !!data.seeker_id,
          referrer_id: !!data.referrer_id,
          job_requirement_id: !!data.job_requirement_id,
          job_role: !!data.job_role
        });
        throw new Error('Missing required fields for referral request');
      }
      
      console.log('✅ [REFERRAL] All required fields present, proceeding with database insert...');
      
      const { data: result, error } = await supabase
        .from('referral_requests')
        .insert(data)
        .select();

      console.log('📊 [REFERRAL] Database insert result:', { 
        success: !error, 
        result: result, 
        error: error,
        insertedId: result?.[0]?.id 
      });

      if (error) {
        console.error('❌ [REFERRAL] Database insert failed:', error);
        throw error;
      }
      
      console.log('✅ [REFERRAL] Referral request created successfully with ID:', result?.[0]?.id);
      
      // Refresh referral requests for both seeker and referrer
      console.log('🔄 [REFERRAL] Refreshing referral requests for seeker:', data.seeker_id);
      await get().fetchReferralRequests(data.seeker_id);
      
      console.log('🔄 [REFERRAL] Refreshing referral requests for referrer:', data.referrer_id);
      await get().fetchReferralRequests(data.referrer_id);
      
      console.log('✅ [REFERRAL] Referral requests refreshed for both users');
      console.log('🎉 [REFERRAL] Referral request process completed successfully!');
      
    } catch (error) {
      console.error('💥 [REFERRAL] Error creating referral request:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create referral request' });
    } finally {
      set({ loading: false });
    }
  },

  updateReferralRequestStatus: async (requestId: string, status: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('referral_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      
      // Refresh referral requests
      const currentRequests = get().referralRequests;
      const updatedRequests = currentRequests.map(req => 
        req.id === requestId ? { ...req, status, updated_at: new Date().toISOString() } : req
      );
      set({ referralRequests: updatedRequests });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update referral request' });
    } finally {
      set({ loading: false });
    }
  },

  createScore: async (data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('scores')
        .upsert(data, { onConflict: 'referral_request_id,parameter_id' });

      if (error) throw error;
      
      // Update referral request status to 'scored'
      await get().updateReferralRequestStatus(data.referral_request_id, 'scored');
      
      // Refresh scores
      await get().fetchScores(data.seeker_id);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create score' });
    } finally {
      set({ loading: false });
    }
  },

  createJobPosting: async (data) => {
    set({ loading: true, error: null });
    try {
      console.log('Creating job posting with data:', data);
      
      const { data: result, error } = await supabase
        .from('job_postings')
        .insert(data)
        .select();

      console.log('Job posting creation result:', { result, error });

      if (error) {
        console.error('Job posting creation error:', error);
        throw error;
      }
      
      // Refresh job postings
      await get().fetchJobPostings(data.recruiter_id);
      console.log('Job postings refreshed successfully');
    } catch (error) {
      console.error('Failed to create job posting:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create job posting' });
    } finally {
      set({ loading: false });
    }
  },

  updateJobPosting: async (jobId: string, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('job_postings')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;
      
      // Update local state
      const currentPostings = get().jobPostings;
      const updatedPostings = currentPostings.map(job => 
        job.id === jobId ? { ...job, ...data, updated_at: new Date().toISOString() } : job
      );
      set({ jobPostings: updatedPostings });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update job posting' });
    } finally {
      set({ loading: false });
    }
  },

  updateCandidateMatch: async (seekerId: string, jobPostingId: string, recruiterId: string, data: { is_interested?: boolean; phone_unlocked?: boolean }) => {
    set({ loading: true, error: null });
    try {
      // Upsert candidate match using the provided recruiterId
      const { error } = await supabase
        .from('candidate_matches')
        .upsert({
          seeker_id: seekerId,
          job_posting_id: jobPostingId,
          recruiter_id: recruiterId,
          is_interested: data.is_interested,
          phone_unlocked: data.phone_unlocked
        }, {
          onConflict: 'seeker_id,job_posting_id,recruiter_id'
        });

      if (error) {
        console.error("Error in updateCandidateMatch:", error);
        throw error;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update candidate match' });
      // Re-throw to be caught in the component
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  calculateStrengthScore: async (seekerId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_strength_score', {
          seeker_uuid: seekerId
        });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Failed to calculate strength score:', error);
      return 0;
    }
  },

  getCandidateContactDetails: async (seekerId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, email')
        .eq('id', seekerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get candidate contact details:', error);
      return null;
    }
  },

  // Utility
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ loading }),
})); 