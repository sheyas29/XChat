const Room = require('../models/Room');
const User = require('../models/User');
const mongoose = require('mongoose');
const { database } = require('../config/firebaseAdmin');

async function roomInitialiserController(req, res) {
  try {
    const { otheruser } = req.body;
    const otheruserid = new mongoose.Types.ObjectId(otheruser);
    const checkOtherUser = await User.findOne({ _id: otheruserid }).select(
      'fullName username email avatar'
    );
    if (!otheruser || !checkOtherUser) {
      return res.status(400).json({
        success: false,
        message: 'Other user is required to create a chat room',
      });
    }

    const loggedUser = req.userId;
    const checkloggedUser = await User.findOne({ _id: loggedUser }).select(
      'fullName username email avatar'
    );
    const users = [loggedUser, otheruserid];
    // console.log(users);
    const checkRoom = await Room.findOne({
      users: {
        $all: [loggedUser, otheruserid],
        $size: 2,
      },
    });
    // console.log(checkRoom);
    if (!checkRoom) {
      const save = await Room.create({
        users: users,
      });
      // console.log(save);
      console.log('Writing to Firebase:', save._id);
      await database.ref(`roomMembers/${save._id}`).set({
        [loggedUser.toString()]: true,
        [otheruserid.toString()]: true,
      });
      console.log('Firebase membership written successfully');
      return res.status(200).json({
        success: true,
        data: {
          _id: save._id,
          users: [checkOtherUser, checkloggedUser],
        },
        message: 'Room initialized successfully',
        alreadyExisted: false,
      });
    }

    await database.ref(`roomMembers/${checkRoom._id}`).set({
      [loggedUser.toString()]: true,
      [otheruserid.toString()]: true,
    });
    console.log('Firebase membership written successfully');
    return res.status(200).json({
      success: true,
      data: {
        _id: checkRoom._id,
        users: [checkOtherUser, checkloggedUser],
      },
      message: 'Room initialized successfully',
      alreadyExisted: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating the room',
    });
  }
}
async function getAllRoomsController(req, res) {
  try {
    const loggedUser = req.userId;

    const checkRooms = await Room.find({ users: loggedUser })
      .populate('users', 'username fullName email avatar')
      .lean()
      .select('users');
    // console.log(JSON.stringify(checkRooms, null, 2));
    res.status(200).json({
      success: true,
      data: checkRooms,
      message: 'Rooms fetched successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching the rooms',
    });
  }
}

module.exports = { roomInitialiserController, getAllRoomsController };
