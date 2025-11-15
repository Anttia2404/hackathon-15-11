const { sequelize } = require('../../src/config/database');

async function up() {
  await sequelize.query(`
    -- Create discussions table
    CREATE TABLE IF NOT EXISTS discussions (
      discussion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      teacher_id UUID NOT NULL REFERENCES teachers(teacher_id) ON DELETE CASCADE,
      class_id UUID REFERENCES classes(class_id) ON DELETE SET NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL CHECK (type IN ('poll', 'qna', 'wordcloud', 'quiz', 'feedback')),
      status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
      settings JSONB DEFAULT '{}',
      pin_code VARCHAR(6) UNIQUE,
      expires_at TIMESTAMP,
      total_responses INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_discussions_teacher ON discussions(teacher_id);
    CREATE INDEX idx_discussions_pin ON discussions(pin_code);
    CREATE INDEX idx_discussions_status ON discussions(status);

    -- Create discussion_responses table
    CREATE TABLE IF NOT EXISTS discussion_responses (
      response_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      discussion_id UUID NOT NULL REFERENCES discussions(discussion_id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(student_id) ON DELETE SET NULL,
      response_data JSONB NOT NULL,
      is_anonymous BOOLEAN DEFAULT FALSE,
      upvotes INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_responses_discussion ON discussion_responses(discussion_id);
    CREATE INDEX idx_responses_student ON discussion_responses(student_id);
    CREATE INDEX idx_responses_upvotes ON discussion_responses(upvotes DESC);
  `);

  console.log('✅ Discussions tables created successfully');
}

async function down() {
  await sequelize.query(`
    DROP TABLE IF EXISTS discussion_responses CASCADE;
    DROP TABLE IF EXISTS discussions CASCADE;
  `);

  console.log('✅ Discussions tables dropped successfully');
}

module.exports = { up, down };
