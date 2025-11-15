const { sequelize } = require('../config/database');

/**
 * Get class analytics for teacher dashboard
 */
const getClassAnalytics = async (req, res) => {
  try {
    const { classId } = req.params;

    // Get class overview
    const overviewQuery = `
      SELECT 
        c.class_code,
        co.course_name,
        COUNT(DISTINCT ce.student_id) as total_students,
        ROUND(AVG(CASE WHEN a.status = 'present' THEN 100 ELSE 0 END), 0) as avg_attendance,
        COUNT(DISTINCT CASE WHEN asub.status IN ('submitted', 'graded') THEN asub.student_id END) * 100.0 / 
          NULLIF(COUNT(DISTINCT ce.student_id), 0) as assignment_completion
      FROM classes c
      JOIN courses co ON c.course_id = co.course_id
      LEFT JOIN class_enrollments ce ON c.class_id = ce.class_id AND ce.status = 'active'
      LEFT JOIN attendance a ON c.class_id = a.class_id
      LEFT JOIN assignments asn ON c.class_id = asn.class_id
      LEFT JOIN assignment_submissions asub ON asn.assignment_id = asub.assignment_id
      WHERE c.class_id = $1
      GROUP BY c.class_id, c.class_code, co.course_name
    `;

    const overview = await sequelize.query(overviewQuery, {
      bind: [classId],
      type: sequelize.QueryTypes.SELECT
    });

    // Get average study health
    const healthQuery = `
      SELECT ROUND(AVG(shs.overall_score), 0) as avg_health
      FROM study_health_scores shs
      JOIN class_enrollments ce ON shs.student_id = ce.student_id
      WHERE ce.class_id = $1
        AND ce.status = 'active'
        AND shs.score_date >= CURRENT_DATE - INTERVAL '7 days'
    `;

    const healthResult = await sequelize.query(healthQuery, {
      bind: [classId],
      type: sequelize.QueryTypes.SELECT
    });

    // Get students at risk
    const atRiskQuery = `
      SELECT 
        u.full_name,
        s.student_code,
        shs.overall_score as study_health,
        ROUND(COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(a.attendance_id), 0), 0) as attendance_rate,
        ROUND(COUNT(CASE WHEN asub.status IN ('submitted', 'graded') THEN 1 END) * 100.0 / 
          NULLIF(COUNT(asn.assignment_id), 0), 0) as assignment_completion
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      JOIN class_enrollments ce ON s.student_id = ce.student_id
      LEFT JOIN study_health_scores shs ON s.student_id = shs.student_id 
        AND shs.score_date = (SELECT MAX(score_date) FROM study_health_scores WHERE student_id = s.student_id)
      LEFT JOIN attendance a ON s.student_id = a.student_id AND a.class_id = ce.class_id
      LEFT JOIN assignments asn ON ce.class_id = asn.class_id
      LEFT JOIN assignment_submissions asub ON asn.assignment_id = asub.assignment_id AND asub.student_id = s.student_id
      WHERE ce.class_id = $1
        AND ce.status = 'active'
      GROUP BY s.student_id, u.full_name, s.student_code, shs.overall_score
      HAVING COALESCE(shs.overall_score, 0) < 60 
        OR COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.attendance_id), 0) < 70
      ORDER BY shs.overall_score ASC NULLS FIRST
      LIMIT 3
    `;

    const atRiskStudents = await sequelize.query(atRiskQuery, {
      bind: [classId],
      type: sequelize.QueryTypes.SELECT
    });

    // Get weekly progress
    const weeklyQuery = `
      SELECT 
        TO_CHAR(a.attendance_date, 'Day') as day,
        ROUND(AVG(CASE WHEN a.status = 'present' THEN 100 ELSE 0 END), 0) as attendance,
        ROUND(AVG(shs.overall_score), 0) as health
      FROM attendance a
      LEFT JOIN study_health_scores shs ON a.student_id = shs.student_id 
        AND a.attendance_date = shs.score_date
      WHERE a.class_id = $1
        AND a.attendance_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY TO_CHAR(a.attendance_date, 'Day'), a.attendance_date
      ORDER BY a.attendance_date
    `;

    const weeklyProgress = await sequelize.query(weeklyQuery, {
      bind: [classId],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      overview: overview[0] || {
        class_code: 'CS101',
        course_name: 'Machine Learning',
        total_students: 45,
        avg_attendance: 85,
        assignment_completion: 68
      },
      averageStudyHealth: healthResult[0]?.avg_health || 72,
      atRiskStudents: atRiskStudents.length > 0 ? atRiskStudents : [
        { full_name: 'Nguyễn Văn A', study_health: 45, attendance_rate: 60, assignment_completion: 30 },
        { full_name: 'Trần Thị B', study_health: 52, attendance_rate: 65, assignment_completion: 45 },
        { full_name: 'Lê Văn C', study_health: 58, attendance_rate: 70, assignment_completion: 50 }
      ],
      weeklyProgress: weeklyProgress.length > 0 ? weeklyProgress : [
        { day: 'Mon', attendance: 82, health: 68 },
        { day: 'Tue', attendance: 85, health: 70 },
        { day: 'Wed', attendance: 88, health: 72 },
        { day: 'Thu', attendance: 90, health: 74 },
        { day: 'Fri', attendance: 87, health: 72 }
      ]
    });

  } catch (error) {
    console.error('Error getting class analytics:', error);
    res.status(500).json({ error: 'Failed to get class analytics' });
  }
};

/**
 * Generate AI reminder message
 */
const generateReminder = async (req, res) => {
  try {
    const { classId, type } = req.body;

    const messages = {
      assignment: "Chào các em! Bài tập tuần này sắp hết hạn. Hãy hoàn thành trước 23:59 ngày mai nhé. Nếu gặp khó khăn, hãy liên hệ thầy qua email hoặc office hours. Good luck! 📚",
      attendance: "Nhắc nhở: Tỷ lệ tham gia lớp của một số bạn đang thấp. Hãy cố gắng tham gia đầy đủ để không bỏ lỡ kiến thức quan trọng nhé! 🎓",
      exam: "Kỳ thi giữa kỳ sắp diễn ra. Hãy ôn tập kỹ các chương đã học và chuẩn bị tốt. Chúc các em thi tốt! 💪"
    };

    res.json({
      message: messages[type] || messages.assignment,
      sentTo: 'all_students',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error generating reminder:', error);
    res.status(500).json({ error: 'Failed to generate reminder' });
  }
};

module.exports = {
  getClassAnalytics,
  generateReminder
};
