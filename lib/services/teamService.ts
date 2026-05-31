import dbConnect from '../db';
import Invite from '../models/Invite';
import TeamMember from '../models/TeamMember';
import { v4 as uuidv4 } from 'uuid';
import type { Invite as InviteType, TeamMember as TeamMemberType } from '../../app/types/types';

/**
 * Create a team invite with a unique token
 * Token expires in 7 days
 */
export async function createInvite(
  invitedBy: string,
  email: string,
  workspaceId: string = 'default'
): Promise<{ token: string; inviteUrl: string }> {
  await dbConnect();

  try {
    // Check for existing pending invite
    const existingInvite = await Invite.findOne({
      email: email.toLowerCase(),
      workspaceId,
      status: 'pending',
    });

    if (existingInvite) {
      // Return existing invite token instead of creating duplicate
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return {
        token: existingInvite.token,
        inviteUrl: `${baseUrl}/join/${existingInvite.token}`,
      };
    }

    // Create new invite
    const token = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const invite = await Invite.create({
      token,
      email: email.toLowerCase(),
      invitedBy,
      workspaceId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      token: invite.token,
      inviteUrl: `${baseUrl}/join/${token}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create invite';
    throw new Error(`Invite creation error: ${message}`);
  }
}

/**
 * Accept an invite and add user to team
 * Marks invite as accepted and creates team member record
 */
export async function acceptInvite(
  token: string,
  userId: string
): Promise<{ workspaceId: string; role: string }> {
  await dbConnect();

  try {
    // Validate token
    const invite = await Invite.findOne({ token });

    if (!invite) {
      throw new Error('Invite not found');
    }

    if (invite.status !== 'pending') {
      throw new Error(`Invite is ${invite.status}`);
    }

    if (new Date() > invite.expiresAt) {
      throw new Error('Invite has expired');
    }

    // Mark invite as accepted
    invite.status = 'accepted';
    await invite.save();

    // Create or update team member record
    const teamMember = await TeamMember.findOneAndUpdate(
      {
        userId,
        workspaceId: invite.workspaceId,
      },
      {
        userId,
        workspaceId: invite.workspaceId,
        role: 'member',
        joinedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return {
      workspaceId: invite.workspaceId,
      role: teamMember.role,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept invite';
    throw new Error(`Accept invite error: ${message}`);
  }
}

/**
 * Get all team members for a workspace
 */
export async function getTeamMembers(
  workspaceId: string = 'default'
): Promise<TeamMemberType[]> {
  await dbConnect();

  try {
    const members = await TeamMember.find({ workspaceId }).lean();

    return members.map((member: any) => ({
      _id: member._id,
      userId: member.userId,
      teamId: workspaceId,
      role: member.role,
      createdAt: member.joinedAt,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch team members';
    throw new Error(`Team members error: ${message}`);
  }
}

/**
 * Get pending invites for a workspace
 */
export async function getPendingInvites(
  workspaceId: string = 'default'
): Promise<InviteType[]> {
  await dbConnect();

  try {
    const invites = await Invite.find({
      workspaceId,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .lean();

    return invites.map((invite: any) => ({
      _id: invite._id,
      token: invite.token,
      email: invite.email,
      teamId: workspaceId,
      expiresAt: invite.expiresAt,
      accepted: invite.status === 'accepted',
      createdAt: invite.createdAt,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pending invites';
    throw new Error(`Pending invites error: ${message}`);
  }
}
