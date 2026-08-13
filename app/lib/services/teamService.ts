import Invite from '@/models/mongoDB/Invite';
import TeamMember from '@/models/mongoDB/TeamMember';
import { v4 as uuidv4 } from 'uuid';

export async function createInvite(userId: string, email: string, workspaceId?: string) {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

  const invite = new Invite({
    token,
    email,
    invitedBy: userId,
    workspaceId: workspaceId || 'default',
    expiresAt,
    status: 'pending',
  });

  await invite.save();
  return invite;
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await Invite.findOne({ token, status: 'pending' });

  if (!invite) {
    throw new Error('Invite not found or already used');
  }

  if (new Date() > invite.expiresAt) {
    throw new Error('Invite has expired');
  }

  // Update invite status
  invite.status = 'accepted';
  invite.acceptedAt = new Date();
  invite.acceptedBy = userId;
  await invite.save();

  // Add user to team
  const member = new TeamMember({
    userId,
    workspaceId: invite.workspaceId,
    role: 'member',
  });
  await member.save();

  return { invite, member };
}

export async function getTeamMembers(workspaceId: string) {
  return TeamMember.find({ workspaceId });
}
