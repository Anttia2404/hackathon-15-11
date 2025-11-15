import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  BarChart3,
  Cloud,
  HelpCircle,
  MessageCircle,
  Plus,
  Play,
  Pause,
  Trash2,
  Copy,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import discussionService, { Discussion } from '../../services/discussionService';
import CreateDiscussionModal from './CreateDiscussionModal.tsx';
import DiscussionResults from './DiscussionResults.tsx';

export function InteractiveClassroom() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadDiscussions();
  }, [filterType, filterStatus]);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterType !== 'all') filters.type = filterType;
      if (filterStatus !== 'all') filters.status = filterStatus;

      const data = await discussionService.getTeacherDiscussions(filters);
      setDiscussions(data.discussions);
    } catch (error) {
      console.error('Load discussions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (data: any) => {
    try {
      await discussionService.createDiscussion(data);
      setShowCreateModal(false);
      loadDiscussions();
    } catch (error) {
      console.error('Create discussion error:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await discussionService.updateDiscussionStatus(id, status);
      loadDiscussions();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thảo luận này?')) return;
    try {
      await discussionService.deleteDiscussion(id);
      loadDiscussions();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const copyPinCode = (pinCode: string) => {
    navigator.clipboard.writeText(pinCode);
    alert('Đã copy mã PIN!');
  };

  const discussionTypes = [
    { id: 'all', label: 'Tất cả', icon: MessageSquare },
    { id: 'poll', label: 'Khảo sát', icon: BarChart3 },
    { id: 'qna', label: 'Hỏi đáp', icon: HelpCircle },
    { id: 'wordcloud', label: 'Word Cloud', icon: Cloud },
    { id: 'feedback', label: 'Ý kiến', icon: MessageCircle },
  ];

  const getTypeIcon = (type: string) => {
    const typeObj = discussionTypes.find(t => t.id === type);
    return typeObj ? typeObj.icon : MessageSquare;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'closed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Đang diễn ra';
      case 'draft': return 'Nháp';
      case 'closed': return 'Đã đóng';
      case 'archived': return 'Lưu trữ';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Interactive Classroom
              </h1>
              <p className="text-gray-600 mt-2">
                Tạo thảo luận, khảo sát và tương tác với sinh viên real-time
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Tạo mới
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              {discussionTypes.map(type => (
                <Button
                  key={type.id}
                  variant={filterType === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type.id)}
                  className="gap-2"
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'draft', 'closed'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === 'all' ? 'Tất cả' : getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Discussions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : discussions.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có thảo luận nào
            </h3>
            <p className="text-gray-500 mb-4">
              Tạo thảo luận đầu tiên để tương tác với sinh viên
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo thảo luận mới
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {discussions.map((discussion, index) => {
                const TypeIcon = getTypeIcon(discussion.type);
                return (
                  <motion.div
                    key={discussion.discussion_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <TypeIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                              {discussion.title}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(discussion.status)}`}>
                              {getStatusLabel(discussion.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {discussion.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {discussion.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{discussion.total_responses} phản hồi</span>
                        </div>
                        {discussion.expires_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(discussion.expires_at) > new Date()
                                ? 'Còn hiệu lực'
                                : 'Hết hạn'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* PIN Code */}
                      {discussion.status === 'active' && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Mã PIN</p>
                              <p className="text-2xl font-bold text-blue-600 tracking-wider">
                                {discussion.pin_code}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyPinCode(discussion.pin_code)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {discussion.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(discussion.discussion_id, 'active')}
                            className="flex-1 gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Bắt đầu
                          </Button>
                        )}
                        {discussion.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedDiscussion(discussion)}
                              className="flex-1 gap-2"
                            >
                              <TrendingUp className="w-4 h-4" />
                              Xem kết quả
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(discussion.discussion_id, 'closed')}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {discussion.status === 'closed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDiscussion(discussion)}
                            className="flex-1 gap-2"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Xem kết quả
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(discussion.discussion_id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateDiscussionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateDiscussion}
        />
      )}

      {selectedDiscussion && (
        <DiscussionResults
          discussion={selectedDiscussion}
          onClose={() => setSelectedDiscussion(null)}
        />
      )}
    </div>
  );
}

export default InteractiveClassroom;
