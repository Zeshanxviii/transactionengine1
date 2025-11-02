import * as userService from '../../services/userService.js';

export async function getAllUsers(req, res) {
  try {
    const allUsers = await userService.getAllUsers();
    res.status(201).json(allUsers);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


