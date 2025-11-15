import api from '../config/api';

export interface Discussion {
  discussion_id: string;
  teacher_id: string;
  class_id?: string;
  title: string;
  description?: string;
  type: 'poll' | 'qna' | 'wordcloud' | 'quiz' | 'feedback';
  status: 'draft' | 'active' | 'closed' | 'archived';
  settings: any;
  pin_code: string;
  expires_at?: string;
  total_responses: number;
  created_at: string;
  updated_at: string;
}

export interface DiscussionResponse {
  response_id: string;
  discussion_id: string;
  student_id?: string;
  response_data: any;
  is_anonymous: boolean;
  upvotes: number;
  is_featured: boolean;
  created_at: string;
}

class DiscussionService {
  // Teacher: Create discussion
  async createDiscussion(data: {
    title: string;
    description?: string;
    type: string;
    class_id?: string;
    settings?: any;
    expires_in_minutes?: number;
  }) {
    const response = await api.post('/discussions', data);
    return response.data;
  }

  // Teacher: Get all discussions
  async getTeacherDiscussions(filters?: { status?: string; type?: string }) {
    const response = await api.get('/discussions/teacher', { params: filters });
    return response.data;
  }

  // Teacher: Get discussion by ID
  async getDiscussionById(id: string) {
    const response = await api.get(`/discussions/${id}`);
    return response.data;
  }

  // Teacher: Update discussion status
  async updateDiscussionStatus(id: string, status: string) {
    const response = await api.patch(`/discussions/${id}/status`, { status });
    return response.data;
  }

  // Teacher: Delete discussion
  async deleteDiscussion(id: string) {
    const response = await api.delete(`/discussions/${id}`);
    return response.data;
  }

  // Teacher: Feature response
  async featureResponse(responseId: string) {
    const response = await api.patch(`/discussions/responses/${responseId}/feature`);
    return response.data;
  }

  // Student: Join discussion by PIN
  async joinDiscussion(pinCode: string) {
    const response = await api.post('/discussions/join', { pin_code: pinCode });
    return response.data;
  }

  // Student: Submit response
  async submitResponse(data: {
    discussion_id: string;
    response_data: any;
    is_anonymous?: boolean;
  }) {
    const response = await api.post('/discussions/responses', data);
    return response.data;
  }

  // Upvote response
  async upvoteResponse(responseId: string) {
    const response = await api.post(`/discussions/responses/${responseId}/upvote`);
    return response.data;
  }
}

export default new DiscussionService();
