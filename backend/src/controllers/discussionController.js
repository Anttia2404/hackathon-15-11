const { Discussion, DiscussionResponse } = require('../models');
const { Op } = require('sequelize');

// Generate unique PIN code
function generatePinCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Aggregate poll results
function aggregatePollResults(responses) {
  const results = {};
  responses.forEach(r => {
    const answer = r.response_data.answer;
    results[answer] = (results[answer] || 0) + 1;
  });
  return results;
}

// Helper: Aggregate word cloud results
function aggregateWordCloudResults(responses) {
  const wordCount = {};
  responses.forEach(r => {
    const words = r.response_data.text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));
}

class DiscussionController {
  // Create new discussion/poll
  async createDiscussion(req, res) {
    try {
      const teacherId = req.teacher.teacher_id;
      const { title, description, type, class_id, settings, expires_in_minutes } = req.body;

      const pinCode = generatePinCode();
      
      let expiresAt = null;
      if (expires_in_minutes) {
        expiresAt = new Date(Date.now() + expires_in_minutes * 60000);
      }

      const discussion = await Discussion.create({
        teacher_id: teacherId,
        class_id,
        title,
        description,
        type,
        settings: settings || {},
        pin_code: pinCode,
        expires_at: expiresAt,
        status: 'draft',
      });

      res.status(201).json({
        message: 'Discussion created successfully',
        discussion,
      });
    } catch (error) {
      console.error('Create discussion error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get teacher's discussions
  async getTeacherDiscussions(req, res) {
    try {
      const teacherId = req.teacher.teacher_id;
      const { status, type } = req.query;

      const where = { teacher_id: teacherId };
      if (status) where.status = status;
      if (type) where.type = type;

      const discussions = await Discussion.findAll({
        where,
        order: [['created_at', 'DESC']],
      });

      res.json({ discussions });
    } catch (error) {
      console.error('Get discussions error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get discussion by ID with responses
  async getDiscussionById(req, res) {
    try {
      const { id } = req.params;
      const teacherId = req.teacher.teacher_id;

      const discussion = await Discussion.findOne({
        where: { discussion_id: id, teacher_id: teacherId },
      });

      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      const responses = await DiscussionResponse.findAll({
        where: { discussion_id: id },
        order: [['created_at', 'DESC']],
      });

      // Aggregate results based on type
      let aggregatedResults = null;
      if (discussion.type === 'poll') {
        aggregatedResults = aggregatePollResults(responses);
      } else if (discussion.type === 'wordcloud') {
        aggregatedResults = aggregateWordCloudResults(responses);
      }

      res.json({
        discussion,
        responses,
        aggregated_results: aggregatedResults,
        total_responses: responses.length,
      });
    } catch (error) {
      console.error('Get discussion error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update discussion status
  async updateDiscussionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const teacherId = req.teacher.teacher_id;

      const discussion = await Discussion.findOne({
        where: { discussion_id: id, teacher_id: teacherId },
      });

      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      await discussion.update({ status });

      res.json({
        message: 'Discussion status updated',
        discussion,
      });
    } catch (error) {
      console.error('Update discussion error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Student: Join discussion by PIN
  async joinDiscussion(req, res) {
    try {
      const { pin_code } = req.body;

      const discussion = await Discussion.findOne({
        where: {
          pin_code,
          status: 'active',
          [Op.or]: [
            { expires_at: null },
            { expires_at: { [Op.gt]: new Date() } },
          ],
        },
      });

      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found or expired' });
      }

      res.json({ discussion });
    } catch (error) {
      console.error('Join discussion error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Student: Submit response
  async submitResponse(req, res) {
    try {
      const { discussion_id, response_data, is_anonymous } = req.body;
      const studentId = req.student ? req.student.student_id : null;

      const discussion = await Discussion.findOne({
        where: { discussion_id, status: 'active' },
      });

      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found or closed' });
      }

      // Check if already responded (for non-anonymous)
      if (!is_anonymous && studentId) {
        const existing = await DiscussionResponse.findOne({
          where: { discussion_id, student_id: studentId },
        });

        if (existing && !discussion.settings.allow_multiple_responses) {
          return res.status(400).json({ message: 'You have already responded' });
        }
      }

      const response = await DiscussionResponse.create({
        discussion_id,
        student_id: is_anonymous ? null : studentId,
        response_data,
        is_anonymous,
      });

      // Update total responses
      await discussion.increment('total_responses');

      res.status(201).json({
        message: 'Response submitted successfully',
        response,
      });
    } catch (error) {
      console.error('Submit response error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Upvote a response (for Q&A)
  async upvoteResponse(req, res) {
    try {
      const { id } = req.params;

      const response = await DiscussionResponse.findByPk(id);
      if (!response) {
        return res.status(404).json({ message: 'Response not found' });
      }

      await response.increment('upvotes');

      res.json({
        message: 'Upvoted successfully',
        upvotes: response.upvotes + 1,
      });
    } catch (error) {
      console.error('Upvote error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Feature a response
  async featureResponse(req, res) {
    try {
      const { id } = req.params;
      const teacherId = req.teacher.teacher_id;

      const response = await DiscussionResponse.findByPk(id, {
        include: [{ model: Discussion }],
      });

      if (!response) {
        return res.status(404).json({ message: 'Response not found' });
      }

      if (response.Discussion.teacher_id !== teacherId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await response.update({ is_featured: !response.is_featured });

      res.json({
        message: 'Response featured status updated',
        response,
      });
    } catch (error) {
      console.error('Feature response error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete discussion
  async deleteDiscussion(req, res) {
    try {
      const { id } = req.params;
      const teacherId = req.teacher.teacher_id;

      const discussion = await Discussion.findOne({
        where: { discussion_id: id, teacher_id: teacherId },
      });

      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      await discussion.destroy();

      res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
      console.error('Delete discussion error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new DiscussionController();
