const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ====== POSTGRES RAILWAY ======
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ====== PRODUCTS ======
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || "unknown error"
        });
    }
});

// ====== REGISTER ======
app.post('/api/register', async (req, res) => {
    const { email, password_hash, full_name, phone } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, full_name, phone)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, full_name`,
            [email, password_hash, full_name, phone]
        );

        res.json({ success: true, user: result.rows[0] });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====== LOGIN ======
app.post('/api/login', async (req, res) => {
    const { email, password_hash } = req.body;

    try {
        const result = await pool.query(
            `SELECT id, email, full_name, phone
             FROM users
             WHERE email = $1 AND password_hash = $2`,
            [email, password_hash]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        res.json({ success: true, user: result.rows[0] });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====== GET CART ======
app.get('/api/cart/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM cart WHERE user_id = $1',
            [userId]
        );

        res.json(result.rows);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====== SAVE CART ======
app.post('/api/cart', async (req, res) => {
    const { user_id, items } = req.body;

    try {
        await pool.query('DELETE FROM cart WHERE user_id = $1', [user_id]);

        for (const item of items) {
            await pool.query(
                `INSERT INTO cart (user_id, product_id, quantity)
                 VALUES ($1, $2, $3)`,
                [user_id, item.product_id, item.quantity]
            );
        }

        res.json({ success: true });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====== START SERVER ======
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
console.log("DB URL:", process.env.DATABASE_URL);
