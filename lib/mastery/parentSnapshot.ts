"use client";
import { getAllSkillStatuses } from "./masteryEngine";
import { SKILL_TOPIC, TOPIC_ORDER, SKILL_DOMAIN, DOMAIN_ORDER } from "./skillTopics";
import type { MasteryStatus, Domain } from "@/types/game";

export interface TopicSummary { topic: string; status: MasteryStatus; }
export interface DomainSummary { domain: Domain; topics: TopicSummary[]; overallStatus: MasteryStatus; }

const STATUS_RANK: Record<MasteryStatus, number> = {
  "not-started": 0, "discovering": 1, "learning": 2,
  "practicing": 3, "confident": 4, "mastered": 5,
};

function weakest(statuses: MasteryStatus[]): MasteryStatus {
  return statuses.reduce((w, s) => STATUS_RANK[s] < STATUS_RANK[w] ? s : w, statuses[0]);
}

export function getTopicSummaries(): TopicSummary[] {
  const skillStatuses = getAllSkillStatuses();
  const byTopic: Record<string, MasteryStatus[]> = {};
  for (const [skill, status] of Object.entries(skillStatuses)) {
    const topic = SKILL_TOPIC[skill];
    if (!topic || status === "not-started") continue;
    if (!byTopic[topic]) byTopic[topic] = [];
    byTopic[topic].push(status);
  }
  return TOPIC_ORDER
    .filter(t => byTopic[t])
    .map(t => ({ topic: t, status: weakest(byTopic[t]) }));
}

export function getDomainSummaries(): DomainSummary[] {
  const skillStatuses = getAllSkillStatuses();
  const byDomain: Record<string, { topic: string; status: MasteryStatus }[]> = {};
  for (const [skill, status] of Object.entries(skillStatuses)) {
    const domain = SKILL_DOMAIN[skill];
    const topic = SKILL_TOPIC[skill];
    if (!domain || !topic || status === "not-started") continue;
    if (!byDomain[domain]) byDomain[domain] = [];
    const existing = byDomain[domain].find(t => t.topic === topic);
    if (!existing) byDomain[domain].push({ topic, status });
    else if (STATUS_RANK[status] < STATUS_RANK[existing.status]) existing.status = status;
  }
  return DOMAIN_ORDER
    .filter(d => byDomain[d])
    .map(d => ({
      domain: d,
      topics: byDomain[d],
      overallStatus: weakest(byDomain[d].map(t => t.status)),
    }));
}

export function getBoboRecommendation(): { topic: string; message: string } | { allConfident: true } | { noHistory: true } {
  const topics = getTopicSummaries();
  if (topics.length === 0) return { noHistory: true };
  const allGood = topics.every(t => STATUS_RANK[t.status] >= STATUS_RANK["confident"]);
  if (allGood) return { allConfident: true };
  const weakest = topics.reduce((w, t) =>
    STATUS_RANK[t.status] < STATUS_RANK[w.status] ? t : w
  );
  return { topic: weakest.topic, message: `practice ${weakest.topic.toLowerCase()} next!` };
}
