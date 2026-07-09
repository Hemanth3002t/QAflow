const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const ensureUsersTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'QA',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

const register = async (userData) => {
    const { name, email, password, role = "QA" } = userData || {};

    if (!name || !email || !password) {
        return {
            success: false,
            message: "Name, email, and password are required"
        };
    }

    await ensureUsersTable();

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
        return {
            success: false,
            message: "Email already registered"
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name.trim(), normalizedEmail, hashedPassword, role.trim() || "QA"]
    );

    return {
        success: true,
        message: "User registered successfully",
        user: result.rows[0]
    };
};

module.exports = {
    register
};
