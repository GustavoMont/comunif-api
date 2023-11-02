import {
  ChannelType,
  Community,
  CommunityChannel,
  CommunityHasUsers,
  EvasionReport,
  User,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import channelTypes from '../../prisma/fixtures/channel-types';
import communitiesChannels from '../../prisma/fixtures/community-channels';
import communityHasUsers from '../../prisma/fixtures/community-has-users';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { EvasionReportResponseDto } from 'src/evasion-report/dto/evasion-report-response.dto';
import users from '../../prisma/fixtures/users';
import communities from '../../prisma/fixtures/communities';

export const applyEvasionReportsIncludes = (
  evasionReports: EvasionReport[],
): EvasionReportResponseDto[] => {
  const result = evasionReports.map<EvasionReportResponseDto>(
    evasionReportToResponseDto,
  );
  return result;
};

const evasionReportToResponseDto = (
  evasionReport: EvasionReport,
): EvasionReportResponseDto => {
  const { removerId, userId, communityId } = evasionReport;
  const remover = users.find(({ id }) => removerId === id) ?? null;
  const user = users.find(({ id }) => userId === id) ?? null;
  const communityObj = communities.find(({ id }) => communityId === id) ?? null;
  const community = communityPlainToInstance(communityObj, user);
  return plainToInstance(EvasionReportResponseDto, {
    ...evasionReport,
    community,
    user,
    remover,
  });
};

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
