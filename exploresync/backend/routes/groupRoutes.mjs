import express from 'express';
import { isAuthenticated, isHost } from '../middleware/validationMiddleware.mjs';
import { createGroup, 
         getGroup, 
         deleteGroup, 
         getGroupMembers,
         getGroupsForMember, 
         inviteToGroup, 
         joinGroup,
         removeFromGroup,
         getInvitationCode } from '../controllers/groupController.mjs';

const router = express.Router();

router.post('/', isAuthenticated, createGroup);
router.get('/:groupId', isAuthenticated, getGroup);
router.delete('/:groupId', isAuthenticated, deleteGroup);
router.get('/:groupId/members', isAuthenticated, getGroupMembers);
router.get('/member/:username', isAuthenticated, getGroupsForMember);
router.post('/invite', isAuthenticated, isHost, inviteToGroup);
router.get('/invite/:groupId', isAuthenticated, isHost, getInvitationCode);
router.put('/join', isAuthenticated, joinGroup);
router.put('/leave', isAuthenticated, removeFromGroup);
router.put('/remove', isAuthenticated, isHost, removeFromGroup);

export default router;