const pool = require('../db');
const { createContactMessage } = require('../fallbackDb');

const isDbConnected = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
};

const submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const createdAt = new Date().toISOString();
    const normalizedEmail = email.toLowerCase();

    if (await isDbConnected()) {
      try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS contact_messages (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL
          )`
        );

        const result = await pool.query(
          `INSERT INTO contact_messages (name, email, phone, subject, message, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [name, normalizedEmail, phone, subject, message, createdAt]
        );

        return res.status(201).json({ message: 'Message sent successfully.', data: result.rows[0] });
      } catch (dbError) {
        console.error('Contact message DB error:', dbError.message || dbError);
      }
    }

    const savedMessage = createContactMessage({ name, email: normalizedEmail, phone, subject, message, created_at: createdAt });
    return res.status(201).json({ message: 'Message sent successfully.', data: savedMessage });
  } catch (error) {
    console.error('Contact message submission error:', error);
    res.status(500).json({ message: 'Server error while sending contact message.' });
  }
};

module.exports = { submitContactMessage };
