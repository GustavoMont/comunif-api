import {
  ChannelType,
  Community,
  CommunityChannel,
  CommunityHasUsers,
  User,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import channelTypes from '../../prisma/fixtures/channel-types';
import communitiesChannels from '../../prisma/fixtures/community-channels';
import communityHasUsers from '../../prisma/fixtures/community-has-users';
import { CommunityResponse } from 'src/community/dto/community-response.dto';

interface includeCommunityChannelsParams {
  communitiesChannels: CommunityChannel[];
  currentCommunityId: number;
  channelTypes: ChannelType[];
}

type filterComunityChannels = (
  channel: CommunityChannel,
  currentCommunityId: number,
) => boolean;
const filterComunityChannels: filterComunityChannels = (
  { communityId },
  currentCommunityId,
) => communityId === currentCommunityId;

type findChannelType = (type: ChannelType, channelTypeId: number) => boolean;
const findChannelType: findChannelType = ({ id }, channelTypeId) =>
  channelTypeId === id;

export const includeCommunityChannels = ({
  channelTypes,
  communitiesChannels,
  currentCommunityId,
}: includeCommunityChannelsParams) => {
  const communityChannels = communitiesChannels.filter((channel) =>
    filterComunityChannels(channel, currentCommunityId),
  );
  return communityChannels.map(({ channelTypeId, ...communitiesChannel }) => {
    const channelType = channelTypes.find((channel) =>
      findChannelType(channel, channelTypeId),
    );
    return {
      ...communitiesChannel,
      channelTypeId,
      channelType,
    };
  }) as any;
};

export const communityPlainToInstance = (
  community: Community,
  user: User,
): CommunityResponse => {
  const isMember = communityHasUsers.some(
    ({ communityId, userId }) =>
      communityId === community.id && userId === user.id,
  );
  return plainToInstance(CommunityResponse, {
    ...community,
    communityChannels: includeCommunityChannels({
      channelTypes,
      communitiesChannels,
      currentCommunityId: community.id,
    }),
    isMember,
  });
};

interface GetCommunityMembersParams {
  communityHasUsers: CommunityHasUsers[];
  users: User[];
  communityId: number;
}

export const getCommunityMembers = ({
  communityHasUsers,
  communityId,
  users,
}: GetCommunityMembersParams) => {
  const communityHasUsersFiltered = communityHasUsers.filter(
    ({ communityId: community }) => community === communityId,
  );
  const usersIds = communityHasUsersFiltered.map(({ userId }) => userId);
  const members = users.filter(
    ({ id, isActive }) => usersIds.includes(id) && isActive,
  );
  return members;
};
