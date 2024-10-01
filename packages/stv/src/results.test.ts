import votes from '../../../results/1b792551-83e1-4998-99a4-6637caa69df8.json';
import { calculateStvWinners, Candidate, VoteRecord } from './index';

describe('calculateElectionWinners', () => {
  it('should correctly calculate winners from the first election round', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const voteRecords: VoteRecord[] = Object.values(votes).map((vote: any) => {
      return {
        voteCount: Number(vote.votingPower),
        voteOrder: vote.voteResult.split(',') as Candidate[],
      };
    });

    const { winners, tieCount } = calculateStvWinners(voteRecords, 12);

    expect(winners).toEqual([
      'king_bryan',
      'funcracker',
      'krigs',
      'bodhi_tree',
      'rome_i_emperor',
      'ajota_lrnr',
      'notcatz',
      'jp',
      'jith_blade',
      'drumcarl05',
      'dmark',
      'xalexus',
    ]);
    expect(tieCount).toBe(0);
  });
});
