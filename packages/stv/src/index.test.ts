import { calculateStvWinners, VoteRecord } from './index';

describe('calculateStvWinners', () => {
  it('should correctly calculate winners in a simple scenario', () => {
    const voteRecords: VoteRecord[] = [
      { voteCount: 1, voteOrder: ['Alice', 'Bob', 'Charlie'] },
      { voteCount: 1, voteOrder: ['Bob', 'Charlie', 'Alice'] },
      { voteCount: 1, voteOrder: ['Charlie', 'Alice', 'Bob'] },
    ];

    const { winners, tieCount } = calculateStvWinners(voteRecords, 1);
    expect(winners).toEqual(['Alice']); // Expect Alice to win as the first preference of one vote
    expect(tieCount).toBe(0);
  });

  it('should handle ties correctly', () => {
    const voteRecords: VoteRecord[] = [
      { voteCount: 1, voteOrder: ['Alice', 'Bob'] },
      { voteCount: 1, voteOrder: ['Bob', 'Alice'] },
    ];

    const { winners, tieCount } = calculateStvWinners(voteRecords, 1);
    expect(winners).toEqual(['Alice', 'Bob']); // Alice and Bob should tie
    expect(tieCount).toBe(2); // Tie between Alice and Bob
  });

  it('should distribute votes when a candidate exceeds the quota', () => {
    const voteRecords: VoteRecord[] = [
      { voteCount: 3, voteOrder: ['Alice', 'Bob'] },
      { voteCount: 1, voteOrder: ['Bob', 'Charlie'] },
      { voteCount: 1, voteOrder: ['Charlie', 'Alice'] },
    ];

    const { winners, tieCount } = calculateStvWinners(voteRecords, 2);
    expect(winners).toEqual(['Alice', 'Bob']); // Alice should win first, and Bob after redistribution
    expect(tieCount).toBe(0);
  });

  it('should correctly eliminate the candidate with the fewest votes', () => {
    const voteRecords: VoteRecord[] = [
      { voteCount: 2, voteOrder: ['Alice', 'Bob'] },
      { voteCount: 1, voteOrder: ['Charlie', 'Bob'] },
      { voteCount: 1, voteOrder: ['Bob', 'Charlie'] },
    ];

    const { winners, tieCount } = calculateStvWinners(voteRecords, 1);
    expect(winners).toEqual(['Alice']); // Alice should win after Charlie is eliminated
    expect(tieCount).toBe(0);
  });

  it('should handle the case where there are more winners than seats available', () => {
    const voteRecords: VoteRecord[] = [
      { voteCount: 1, voteOrder: ['Alice', 'Bob'] },
      { voteCount: 1, voteOrder: ['Bob', 'Charlie'] },
      { voteCount: 1, voteOrder: ['Charlie', 'Alice'] },
      { voteCount: 1, voteOrder: ['Dave', 'Alice'] },
      { voteCount: 1, voteOrder: ['Eve', 'Charlie'] },
    ];

    const { winners, tieCount } = calculateStvWinners(voteRecords, 3);
    expect(winners).toEqual(['Alice', 'Bob', 'Charlie']); // Expect these three to be winners
    expect(tieCount).toBe(0);
  });

  it('should correctly handle when maxRounds is reached', () => {
    const voteRecords: VoteRecord[] = [
      { voteCount: 1, voteOrder: ['Alice', 'Bob'] },
      { voteCount: 1, voteOrder: ['Bob', 'Alice'] },
      { voteCount: 1, voteOrder: ['Charlie', 'Alice'] }, // Adding more candidates to ensure multiple rounds
      { voteCount: 1, voteOrder: ['Dave', 'Charlie'] },
    ];

    expect(
      () => calculateStvWinners(voteRecords, 1, 1), // Set maxRounds to 1
    ).toThrow('Max rounds exceeded');
  });

  it('should correctly redistribute votes when a candidate is eliminated', () => {
    const voteRecords: VoteRecord[] = [
      { voteCount: 2, voteOrder: ['Alice', 'Charlie'] },
      { voteCount: 1, voteOrder: ['Bob', 'Alice'] },
      { voteCount: 1, voteOrder: ['Charlie', 'Bob'] },
    ];

    const { winners, tieCount } = calculateStvWinners(voteRecords, 2);
    expect(winners).toEqual(['Alice', 'Charlie']); // Alice wins first, followed by Charlie
    expect(tieCount).toBe(0);
  });
});
