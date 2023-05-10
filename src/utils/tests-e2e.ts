import { ChannelType, CommunityChannel } from '@prisma/client';

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
