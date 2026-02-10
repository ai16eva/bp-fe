import qs from 'query-string';

import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import type {
  AddBoardRequest,
  AddQuestRequest,
  AddQuestResponse,
  AdminQuestResponse,
  AdminQuestStatus,
  AuthHeaderRequest,
  BaseResponse,
  CheckInParams,
  ClaimBettingRewardParams,
  ClaimDailyRewardParams,
  ClaimVoteReward,
  CreateBetRequest,
  DailyReward,
  DAOQuest,
  DraftQuestRequest,
  FeaturedQuest,
  GetAdminQuestsRequest,
  GetDAOQuestsRequest,
  GetMemberBettingsRequest,
  GetMemberVotingsRequest,
  GetQuestsParams,
  GetUserNFTsResponse,
  MemberBetting,
  MemberVoting,
  PaginationRequest,
  Quest,
  QuestCategory,
  QuestDetail,
  Season,
  UpdateMemberDelegateRequest,
  User,
  VoteAnswerBody,
  VoteDetail,
  VoteQuestBody,
  VoteSuccessBody,
} from '@/types/schema';

import { Env } from './Env';
import fetcher from './fetcher';

const API_BASE_URL = Env.NEXT_PUBLIC_API_BASE_URL;

class Api {
  headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  privateHeaders: HeadersInit = {
    ...this.headers,
    Authorization: `Bearer ${typeof window !== 'undefined'
      ? (window.localStorage
        .getItem('dynamic_authentication_token')
        ?.replaceAll('"', '') ?? '')
      : ''
      }`,
  };

  public setToken(token: string) {
    this.privateHeaders = {
      ...this.privateHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  public getQuests({
    status = 'all',
    category = 'all',
    bettingToken = 'all',
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  }: GetQuestsParams) {
    return fetcher<BaseResponse<{ total: number; quests: Quest[] }>>(
      `${API_BASE_URL}/quests/filter/${category}/${status === 'all' ? status : status.join(',')}?${qs.stringify({ page, size, token: bettingToken !== 'all' ? bettingToken : undefined })}`,
      {
        headers: this.headers,
      },
    );
  }

  public getPopularQuests({ page = 1, size = 8 }: PaginationRequest = {}) {
    return fetcher<BaseResponse<Quest[]>>(
      `${API_BASE_URL}/quests/popular?${qs.stringify({ page, size })}`,
      {
        headers: this.headers,
      },
    );
  }

  public getFeaturedQuests({ page = 1, size = 100 }: PaginationRequest = {}) {
    return fetcher<BaseResponse<FeaturedQuest[]>>(
      `${API_BASE_URL}/quests/carousel?${qs.stringify({ page, size })}`,
      {
        headers: this.headers,
      },
    );
  }

  public getDAOQuests(params: GetDAOQuestsRequest) {
    return fetcher<BaseResponse<{ total: number; quests: DAOQuest[] }>>(
      `${API_BASE_URL}/quests/dao?${qs.stringify({ page: 1, size: DEFAULT_PAGE_SIZE, ...params })}`,
      {
        headers: this.headers,
      },
    );
  }

  public getQuest(questId: string) {
    return fetcher<BaseResponse<QuestDetail>>(
      `${API_BASE_URL}/quests/${questId}`,
      {
        headers: this.headers,
      },
    );
  }

  public getQuestBettings(questId: string) {
    return fetcher<BaseResponse<MemberBetting[]>>(
      `${API_BASE_URL}/quests/${questId}/bettings`,
      {
        headers: this.headers,
      },
    );
  }

  public getCategories() {
    return fetcher<BaseResponse<QuestCategory[]>>(
      `${API_BASE_URL}/quest-category`,
      {
        headers: this.headers,
      },
    );
  }

  public addQuest(params: AddQuestRequest) {
    const formData = new FormData();

    for (const name in params) {
      // @ts-expect-error ignore
      const value = params[name] as any;
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            formData.append(name, val);
          });
        } else {
          formData.append(name, value);
        }
      }
    }

    return fetcher<BaseResponse<AddQuestResponse>>(
      `${API_BASE_URL}/quests/add`,
      {
        method: 'POST',
        body: formData,
      },
    );
  }

  public draftQuest(request: DraftQuestRequest) {
    const { quest_key, ...rest } = request;

    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quests/${quest_key}/draft`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public forceEndDraftQuest(
    questKey: string,
    message: string,
    signature: string,
  ) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quest-dao/${questKey}/draft-end`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': message,
          'x-auth-signature': signature,
          ...this.headers,
        },
      },
    );
  }

  public getActiveSeason() {
    return fetcher<BaseResponse<Season>>(`${API_BASE_URL}/season/active`, {
      headers: this.headers,
    });
  }

  // member

  public memberCheck(message: string, signature: string) {
    return fetcher<BaseResponse<any>>(`${API_BASE_URL}/member/auth-check`, {
      headers: {
        'x-auth-message': message,
        'x-auth-signature': signature,
        ...this.headers,
      },
    });
  }

  public getMember(wallet: string) {
    return fetcher<BaseResponse<User>>(`${API_BASE_URL}/member/${wallet}`, {
      headers: this.headers,
    });
  }

  public createMember(wallet: string) {
    return fetcher<BaseResponse<any>>(`${API_BASE_URL}/member`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        wallet_address: wallet,
      }),
    });
  }

  public loginSolana(message: string, signature: string) {
    return fetcher<BaseResponse<{ token: string }>>(
      `${API_BASE_URL}/member/login/solana`,
      {
        method: 'POST',
        headers: {
          'x-auth-message': message,
          'x-auth-signature': signature,
          ...this.headers,
        },
      },
    );
  }

  public createMemberV2(wallet: string, walletType: string, referral?: string) {
    const query = referral ? `?referral=${encodeURIComponent(referral)}` : '';
    return fetcher<BaseResponse<any>>(`${API_BASE_URL}/member/v2${query}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        wallet_address: wallet,
        wallet_type: walletType,
      }),
    });
  }

  public updateMemberDelegate(body: UpdateMemberDelegateRequest) {
    const { wallet, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/member/${wallet}/delegate`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public getMemberVotings(request: GetMemberVotingsRequest) {
    const { wallet, ...rest } = request;
    return fetcher<
      BaseResponse<{
        total: number;
        votes: MemberVoting[];
      }>
    >(`${API_BASE_URL}/member/${wallet}/votes?${qs.stringify(rest)}`, {
      headers: this.headers,
    });
  }

  public getMemberBettings(request: GetMemberBettingsRequest) {
    const { wallet, ...rest } = request;
    return fetcher<BaseResponse<{ total: number; bettings: MemberBetting[] }>>(
      `${API_BASE_URL}/member/${wallet}/bettings?${qs.stringify(rest)}`,
      {
        headers: this.headers,
      },
    );
  }

  public voteQuest(body: VoteQuestBody) {
    const { quest_key, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quests/${quest_key}/vote`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public getVoteDetail(questKey: string | number, voter: string) {
    return fetcher<BaseResponse<VoteDetail>>(
      `${API_BASE_URL}/quests/${questKey}/vote/${voter}`,
      {
        headers: this.headers,
      },
    );
  }

  public voteSuccessQuest(body: VoteSuccessBody) {
    const { quest_key, voter, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quests/${quest_key}/vote/${voter}/success`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public voteAnswerQuest(body: VoteAnswerBody) {
    const { quest_key, voter, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quests/${quest_key}/vote/${voter}/answer`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public claimVoteReward(body: ClaimVoteReward) {
    const { quest_key, voter, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quests/${quest_key}/vote/${voter}/reward`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public claimDailyReward(body: ClaimDailyRewardParams) {
    const { walletAddress, message, signature, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/member/${walletAddress}/daily-reward`,
      {
        method: 'POST',
        headers: {
          'x-auth-message': message,
          'x-auth-signature': signature,
          ...this.headers,
        },
        body: JSON.stringify(rest),
      },
    );
  }

  public getDailyReward(wallet: string, claimAt: string) {
    return fetcher<BaseResponse<DailyReward>>(
      `${API_BASE_URL}/member/${wallet}/daily-reward/claim?claimed_at=${claimAt}`,
      {
        headers: this.headers,
      },
    );
  }

  public claimBettingReward(body: ClaimBettingRewardParams) {
    const { betting_key, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/betting/claim-reward/${betting_key}`,
      {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public getDailyRewardHistory(walletAddress: string) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/member/${walletAddress}/daily-reward`,
      {
        headers: this.headers,
      },
    );
  }

  public checkIn(body: CheckInParams) {
    const { wallet_address } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/checkin/${wallet_address}`,
      {
        method: 'POST',
        headers: this.headers,
      },
    );
  }

  public getCheckIn(wallet: string) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/checkin/${wallet}`,
      {
        headers: this.headers,
      },
    );
  }

  public getReferralCode(wallet: string) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/member/${wallet}/referral`,
      {
        headers: this.headers,
      },
    );
  }

  // admin
  public getAdminQuests<T extends AdminQuestStatus>({
    status,
    message,
    signature,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  }: GetAdminQuestsRequest) {
    return fetcher<
      BaseResponse<{ total: number; quests: AdminQuestResponse<T> }>
    >(`${API_BASE_URL}/quest-dao?${qs.stringify({ status, page, size })}`, {
      headers: {
        'x-auth-message': message,
        'x-auth-signature': signature,
        ...this.headers,
      },
    });
  }

  public adminSetHotQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/hot`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminDraftSetQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/draft/set`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminDraftCancelQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/cancel`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminMakeDraftQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/draft/make`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminPublishQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/publish`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminFinishQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/finish`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminStartDAOSuccessQuest(
    questKey: string,
    headers: AuthHeaderRequest,
  ) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/dao-success`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminSetDaoSuccess(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/dao-success/set`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminAdjournQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/adjourn`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminMakeDaoSuccess(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/dao-success/make`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminFinalizeAnswer(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/finalize-answer`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminSetDAOAnswer(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/answer`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminSetQuestSuccess(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/success`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminForceDraftEnd(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/draft-end`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminForceSuccessEnd(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/dao-success-end`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminForceAnswerEnd(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/answer-end`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public createGovernanceItem(
    questKey: string,
    creatorNftAccount: string,
    headers: AuthHeaderRequest,
    useUserEndpoint = false,
  ) {
    // Use user endpoint (/quests) if useUserEndpoint is true, otherwise use admin endpoint (/quest-dao)
    const endpoint = useUserEndpoint
      ? `${API_BASE_URL}/quests/${questKey}/create-governance-item`
      : `${API_BASE_URL}/quest-dao/${questKey}/create-governance-item`;

    return fetcher<BaseResponse<string>>(
      endpoint,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
        body: JSON.stringify({ creatorNftAccount }),
      },
    );
  }

  // bettings
  public createBet(params: CreateBetRequest) {
    return fetcher<BaseResponse<{ betting_key: string }>>(
      `${API_BASE_URL}/betting/add`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(params),
      },
    );
  }

  public confirmBet(betKey: string, hash: string) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/betting/confirm/${betKey}`,
      {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ betting_tx: hash }),
      },
    );
  }

  // boards
  public getBoards({
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  }: PaginationRequest = {}) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/board/all?${qs.stringify({ page, size })}`,
      {
        headers: this.headers,
      },
    );
  }

  public deleteBoard(board_id: number, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/board/${board_id}`,
      {
        method: 'DELETE',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public addBoard(params: AddBoardRequest) {
    const formData = new FormData();

    for (const name in params) {
      // @ts-expect-error ignore
      const value = params[name] as any;
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            formData.append(name, val);
          });
        } else {
          formData.append(name, value);
        }
      }
    }

    return fetcher<BaseResponse<AddBoardRequest>>(
      `${API_BASE_URL}/board/add`,
      {
        method: 'POST',
        body: formData,
      },
    );
  }

  public updateBoard(
    board_id: number,
    params: { board_title?: string; board_description?: string },
    headers: AuthHeaderRequest
  ) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/board/${board_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
        body: JSON.stringify(params),
      },
    );
  }

  // NFTs
  public getUserNFTs(walletAddress: string, collectionAddress?: string) {
    const url = collectionAddress
      ? `${API_BASE_URL}/nfts/${walletAddress}?${qs.stringify({ collection: collectionAddress })}`
      : `${API_BASE_URL}/nfts/${walletAddress}`;

    return fetcher<BaseResponse<GetUserNFTsResponse>>(
      url,
      {
        headers: this.headers,
      },
    );
  }

  public getCreatorStatus(walletAddress: string) {
    return fetcher<BaseResponse<{
      is_creator: boolean;
      creator_info: {
        wallet_address: string;
        name?: string;
        created_at?: string;
      } | null;
    }>>(
      `${API_BASE_URL}/member/${walletAddress}/creator-status`,
      {
        headers: this.headers,
      },
    );
  }
}

export default new Api();
