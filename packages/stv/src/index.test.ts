import { calculateStvWinners, VoteRecord } from './index';

describe('calculateStvWinners', () => {
  it('should correctly calculate winners in a simple scenario', () => {
    const voteRecords: VoteRecord[] = [
      { voteCount: 1, voteOrder: ['Alice', 'Bob', 'Charlie'] },
      { voteCount: 1, voteOrder: ['Bob', 'Charlie', 'Alice'] },
      { voteCount: 1, voteOrder: ['Charlie', 'Alice', 'Bob'] },
      { voteCount: 1, voteOrder: ['Alice', 'Bob', 'Charlie'] },
    ];

    const { winners, tieCount } = calculateStvWinners(voteRecords, 1);
    expect(winners).toEqual(['Alice']); // Expect Alice to win as the first preference of one vote
    expect(tieCount).toBe(0);
  });

  it('should correctly calculate winners in a complex scenario with five candidates and three seats', () => {
    const voteRecords: VoteRecord[] = [
      { voteCount: 2.5, voteOrder: ['Alice', 'Bob'] },
      { voteCount: 3.7, voteOrder: ['Bob', 'Charlie'] },
      { voteCount: 1.5, voteOrder: ['Charlie', 'Dave'] },
      { voteCount: 2.3, voteOrder: ['Dave', 'Eve'] },
      { voteCount: 4, voteOrder: ['Eve', 'Alice'] },
      { voteCount: 1, voteOrder: ['Alice', 'Charlie'] },
    ];

    const { winners, tieCount } = calculateStvWinners(voteRecords, 3);
    expect(winners).toEqual(expect.arrayContaining(['Eve', 'Bob', 'Dave'])); // Eve, Bob, Dave should win
    expect(tieCount).toBe(0); // No tie expected
  });

  it('should correctly calculate winners in a complex scenario with twelve candidates, six seats, and twenty votes', () => {
    const voteRecords: VoteRecord[] = [
      {
        voteCount: 2,
        voteOrder: ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank'],
      },
      {
        voteCount: 1.5,
        voteOrder: ['Bob', 'Charlie', 'Alice', 'George', 'Hank', 'Ivy'],
      },
      {
        voteCount: 3,
        voteOrder: ['Charlie', 'Dave', 'Eve', 'Alice', 'Frank', 'George'],
      },
      {
        voteCount: 2.3,
        voteOrder: ['Dave', 'Eve', 'Frank', 'Charlie', 'Ivy', 'Jack'],
      },
      {
        voteCount: 4,
        voteOrder: ['Eve', 'Alice', 'Bob', 'Charlie', 'Dave', 'Hank'],
      },
      {
        voteCount: 1,
        voteOrder: ['Frank', 'George', 'Hank', 'Ivy', 'Jack', 'Kim'],
      },
      {
        voteCount: 2.7,
        voteOrder: ['George', 'Hank', 'Ivy', 'Jack', 'Kim', 'Liam'],
      },
      {
        voteCount: 1.2,
        voteOrder: ['Hank', 'Ivy', 'Jack', 'Kim', 'Liam', 'Alice'],
      },
      {
        voteCount: 3.5,
        voteOrder: ['Ivy', 'Jack', 'Kim', 'Liam', 'Alice', 'Bob'],
      },
      {
        voteCount: 2.5,
        voteOrder: ['Jack', 'Kim', 'Liam', 'Alice', 'Bob', 'Charlie'],
      },
      {
        voteCount: 2,
        voteOrder: ['Kim', 'Liam', 'Alice', 'Bob', 'Charlie', 'Dave'],
      },
      {
        voteCount: 1.8,
        voteOrder: ['Liam', 'Alice', 'Bob', 'Charlie', 'Dave', 'Eve'],
      },
      {
        voteCount: 3.1,
        voteOrder: ['Alice', 'Charlie', 'Eve', 'Frank', 'George', 'Hank'],
      },
      {
        voteCount: 2.4,
        voteOrder: ['Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'George'],
      },
      {
        voteCount: 1.9,
        voteOrder: ['Charlie', 'Dave', 'Eve', 'Frank', 'George', 'Hank'],
      },
      {
        voteCount: 2.2,
        voteOrder: ['Dave', 'Eve', 'Frank', 'George', 'Hank', 'Ivy'],
      },
      {
        voteCount: 2.6,
        voteOrder: ['Eve', 'Frank', 'George', 'Hank', 'Ivy', 'Jack'],
      },
      {
        voteCount: 1.4,
        voteOrder: ['Frank', 'George', 'Hank', 'Ivy', 'Jack', 'Kim'],
      },
      {
        voteCount: 3.3,
        voteOrder: ['George', 'Hank', 'Ivy', 'Jack', 'Kim', 'Liam'],
      },
      {
        voteCount: 2.1,
        voteOrder: ['Hank', 'Ivy', 'Jack', 'Kim', 'Liam', 'Alice'],
      },
    ];

    const { winners, tieCount } = calculateStvWinners(voteRecords, 6);
    expect(winners).toEqual(
      expect.arrayContaining([
        'Alice',
        'Bob',
        'Charlie',
        'Eve',
        'George',
        'Hank',
      ]),
    ); // Expect these candidates to win
    expect(tieCount).toBe(0); // No tie expected
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

  //   it('should handle the case where there are more winners than seats available', () => {
  //     const voteRecords: VoteRecord[] = [
  //       { voteCount: 1, voteOrder: ['Alice', 'Bob'] },
  //       { voteCount: 1, voteOrder: ['Alice', 'Bob'] },
  //       { voteCount: 1, voteOrder: ['Bob', 'Charlie'] },
  //       { voteCount: 1, voteOrder: ['Bob', 'Alice'] },
  //       { voteCount: 1, voteOrder: ['Charlie', 'Alice'] },
  //       { voteCount: 1, voteOrder: ['Dave', 'Eve'] },
  //       { voteCount: 1, voteOrder: ['Eve', 'Dave'] },
  //     ];

  //     const { winners, tieCount } = calculateStvWinners(voteRecords, 3);
  //     console.log(winners);
  //     expect(winners.length).toBe(5);
  //     expect(winners).toEqual(['Alice', 'Bob', 'Charlie', 'Dave', 'Eve']);
  //     expect(tieCount).toBe(0); // No tie expected in this case
  //   });

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
