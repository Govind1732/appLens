import AppSpace from '../models/AppSpace.js';

// GET /app-spaces - Return all app spaces for current user
const getAppSpaces = async (req, res) => {
  try {
    const appSpaces = await AppSpace.find({ userId: req.user.userId });
    return res.status(200).json(appSpaces);
  } catch (err) {
    console.error('getAppSpaces error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /app-spaces - Create a new AppSpace
const createAppSpace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const appSpace = await AppSpace.create({
      userId: req.user.userId,
      name,
      description,
    });

    return res.status(201).json(appSpace);
  } catch (err) {
    console.error('createAppSpace error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /app-spaces/:id - Get AppSpace by ID
const getAppSpaceById = async (req, res) => {
  try {
    const appSpace = await AppSpace.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!appSpace) {
      return res.status(404).json({ error: 'AppSpace not found' });
    }

    return res.status(200).json(appSpace);
  } catch (err) {
    console.error('getAppSpaceById error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /app-spaces/:id - Update AppSpace
const updateAppSpace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const appSpace = await AppSpace.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, description },
      { new: true }
    );

    if (!appSpace) {
      return res.status(404).json({ error: 'AppSpace not found' });
    }

    return res.status(200).json(appSpace);
  } catch (err) {
    console.error('updateAppSpace error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /app-spaces/:id - Delete AppSpace
const deleteAppSpace = async (req, res) => {
  try {
    const appSpace = await AppSpace.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!appSpace) {
      return res.status(404).json({ error: 'AppSpace not found' });
    }

    return res.status(200).json({ message: 'AppSpace deleted' });
  } catch (err) {
    console.error('deleteAppSpace error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getAppSpaces,
  createAppSpace,
  getAppSpaceById,
  updateAppSpace,
  deleteAppSpace,
};
