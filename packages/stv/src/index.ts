export type Candidate = string;
export type VoteRecord = {
  voteCount: number;
  voteOrder: Candidate[];
};

type CandidateMapItem = {
  totalVotes: number;
  votes: { voteCount: number; voteOrder: Candidate[] }[];
};

/**
 * @param voteRecords - The vote records to calculate winners from.
 * @param seats - The number of seats to fill.
 * @param maxRounds - The maximum number of rounds to run before giving up. If null, will run indefinitely.
 * @return winners - The candidates who won.
 * @return tieCount - The number of winners at the end of the list who tied. Will be non-zero only if there are too many winners.
 */
export function calculateStvWinners(
  voteRecords: VoteRecord[],
  seats: number,
  maxRounds: number | null = 1000,
): { winners: Candidate[]; tieCount: number } {
  voteRecords = combineVoteRecords(voteRecords);
  let totalVotes = voteRecords.reduce(
    (acc, { voteCount }) => acc + voteCount,
    0,
  );
  // This is the Droop quota: https://en.wikipedia.org/wiki/Droop_quota
  let quota = totalVotes / (seats + 1);

  const winners: Candidate[] = [];
  const candidateSet = new Map<Candidate, CandidateMapItem>();

  for (const record of voteRecords) {
    const candidate = candidateSet.get(record.voteOrder[0]);
    if (candidate) {
      candidate.totalVotes += record.voteCount;
      candidate.votes.push(record);
    } else {
      candidateSet.set(record.voteOrder[0], {
        totalVotes: record.voteCount,
        votes: [record],
      });
    }
  }

  let rounds = 0;
  while (winners.length < seats) {
    if (maxRounds !== null && rounds > maxRounds) {
      throw new Error('Max rounds exceeded');
    }

    if (candidateSet.size === 0) {
      throw new Error('No candidates left. Should not happen.');
    }

    const aboveQuota = [];
    for (const candidate of candidateSet) {
      if (candidate[1].totalVotes >= quota) {
        aboveQuota.push(candidate);
      }
    }
    aboveQuota.sort((a, b) => b[1].totalVotes - a[1].totalVotes);

    const maxNewWinners = seats - winners.length;

    let newQuotaTotalVotes = totalVotes;

    const distributeVotes = (
      candidate: Candidate,
      { totalVotes, votes }: CandidateMapItem,
    ) => {
      // Remove the candidate from all votes.
      for (const cVotes of candidateSet.values()) {
        cVotes.votes = combineVoteRecords(
          cVotes.votes.filter((vote) => {
            vote.voteOrder = vote.voteOrder.filter((c) => c !== candidate);
            // Vote no longer matters if no candidates left.
            return vote.voteOrder.length > 0;
          }),
        );
      }
      candidateSet.delete(candidate);

      if (votes.length === 0) {
        // Votes have nowhere to go. We reduce the quota.
        newQuotaTotalVotes -= totalVotes;
        return;
      }

      // Organize votes by the next candidate in line.
      let totalVotesForProportion = 0;
      const organizedVotes = new Map<
        Candidate,
        { totalVotes: number; votes: VoteRecord[] }
      >();
      for (const vote of votes) {
        const nextCandidate = vote.voteOrder[0];
        if (nextCandidate === undefined) {
          throw new Error(
            "No candidate to redistribute vote to. Shouldn't happen.",
          );
        }
        totalVotesForProportion += vote.voteCount;
        const candidate = organizedVotes.get(nextCandidate);
        if (candidate) {
          candidate.totalVotes += vote.voteCount;
          candidate.votes.push(vote);
        } else {
          organizedVotes.set(nextCandidate, {
            totalVotes: vote.voteCount,
            votes: [vote],
          });
        }
      }

      // Accounts for votes that have no second choice.
      const voteMultiplier = totalVotes / totalVotesForProportion;
      if (voteMultiplier < 1) {
        throw new Error(
          'Vote multiplier should be at least 1. Should not happen.',
        );
      }

      /// Amount of excess votes.
      const votesToRedistribute = totalVotes - quota;

      // Redistribute votes.
      for (const [candidate, vote] of organizedVotes) {
        vote.votes = combineVoteRecords(vote.votes);
        vote.votes.forEach((v) => (v.voteCount *= voteMultiplier));

        const votesToRedistributeForCandidate =
          votesToRedistribute * (vote.totalVotes / totalVotesForProportion);
        const newCandidate = candidateSet.get(candidate);
        if (newCandidate) {
          newCandidate.totalVotes += votesToRedistributeForCandidate;
          newCandidate.votes.push(...vote.votes);
          newCandidate.votes = combineVoteRecords(newCandidate.votes);
        } else {
          candidateSet.set(candidate, {
            totalVotes: votesToRedistributeForCandidate,
            votes: vote.votes,
          });
        }
      }
    };

    if (aboveQuota.length > maxNewWinners) {
      // If we have more candidates above the quota than we have seats left, we pick the highest vote winners.
      // Grab the top candidate(s) and check for ties.
      let selectedWinners = 1;
      let tieCount = 1;
      const lastVotes = aboveQuota[0][1].totalVotes;
      winners.push(aboveQuota[0][0]);
      aboveQuota.shift();
      for (const [candidate, { totalVotes }] of aboveQuota) {
        if (totalVotes === lastVotes) {
          tieCount += 1;
          winners.push(candidate);
          selectedWinners += 1;
        } else if (selectedWinners >= maxNewWinners) {
          break;
        } else {
          tieCount = 1;
          winners.push(candidate);
          selectedWinners += 1;
        }
      }
      return { winners, tieCount: tieCount <= 1 ? 0 : tieCount };
    } else if (aboveQuota.length > 0) {
      // Some candidates are above the quota.
      for (const candidate of aboveQuota) {
        winners.push(candidate[0]);
        distributeVotes(...candidate);
      }
    } else {
      // No candidates are above the quota. Eliminate the lowest candidate.
      let lowestVotes = Number.MAX_VALUE;
      let lowestCandidate: [Candidate, CandidateMapItem] | null = null;
      for (const candidate of candidateSet) {
        if (candidate[1].totalVotes < lowestVotes) {
          lowestVotes = candidate[1].totalVotes;
          lowestCandidate = candidate;
        }
      }

      if (lowestCandidate === null) {
        throw new Error('No lowest candidate found. Should not happen.');
      }
      distributeVotes(...lowestCandidate);
    }

    // Apply adjustments to total votes and quota.
    totalVotes = newQuotaTotalVotes;
    quota = totalVotes / (seats + 1);

    rounds += 1;
  }

  return { winners, tieCount: 0 };
}

function combineVoteRecords(voteRecords: VoteRecord[]): VoteRecord[] {
  const out: VoteRecord[] = [];
  for (const record of voteRecords) {
    const existing = out.find((r) => arrayEqual(r.voteOrder, record.voteOrder));
    if (existing) {
      existing.voteCount += record.voteCount;
    } else {
      out.push(record);
    }
  }
  return out;
}

function arrayEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
