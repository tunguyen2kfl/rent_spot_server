const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { Op } = require('sequelize');
const User = db.user;
const path = require("path");
const fs = require("fs");

exports.register = async (req, res) => {
    const { username, password, email, displayName } = req.body;

    if (!username || !password || !email || !displayName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({
            where: {username, isDeleted: false}
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🚀 ~ exports.register= ~ hashedPassword:", hashedPassword, username, displayName, email)

        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            displayName,
            isDeleted: false,
        });

        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
        console.log("🚀 ~ exports.register= ~ error.message:", error.message)
        res.status(500).json({ error: 'Server error', errorMessage: error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log("🚀 ~ exports.login= ~ username:", username);

    if (!username || !password) {
        console.log('Username and password are required');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ where: { username } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log("🚀 ~ exports.login= ~ Invalid credentials:");
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role, buildingId: user.buildingId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("🚀 ~ exports.login= ~ Token generated:", token);

        res.json({ token, user });
    } catch (error) {
        console.log("🚀 ~ exports.login= ~ error:", error);
        res.status(500).json({ error: 'Server error', errorMessage: error.message });
    }
};

// Thêm hàm getUserInfo
exports.getUserInfo = async (req, res) => {
    const userId = req.user.id; // Lấy ID người dùng từ middleware
    console.log("🚀 ~ exports.getUserInfo= ~ User ID from middleware:", userId);

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            buildingId: user.buildingId,
            website: user.website,
            phone: user.phone,
            avatar: user.avatar
        });
    } catch (error) {
        console.log("🚀 ~ exports.getUserInfo= ~ error:", error);
        res.status(500).json({ error: 'Server error', errorMessage: error.message });
    }
};

exports.getAllInBuilding = async (req, res) => {
    const { buildingId } = req.query;
    try {
        const users = await User.findAll({
            attributes: ['id', 'displayName'],  
            where: {
                isDeleted: false,
                buildingId: buildingId,
            },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, website, email, phone } = req.body;
        console.log("🚀 ~ exports.updateProfile= ~ name, website, email, phone:", name, website, email, phone)
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let avatar = user.avatar; 

        if (req.file) {
            if (user.avatar) {
                const oldImagePath = path.join(__dirname, "..", user.avatar);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
            avatar = `/uploads/${req.file.filename}`;
        }

        user.displayName = name;
        user.website = website;
        user.phone = phone;
        user.email = email;
        user.avatar = avatar;
        user.updatedBy = req.user.id;

        await user.save();

        res.status(200).json({ user });
    } catch (error) {
        console.log("🚀 ~ exports.updateProfile= ~ error:", error)
        res.status(500).json({ error: error.message });
    }
}