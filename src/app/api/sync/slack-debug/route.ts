import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const token = process.env.SLACK_BOT_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'SLACK_BOT_TOKEN not set' });
  }

  const results: any = {};

  // Test 1: Auth test
  try {
    const authRes = await fetch('https://slack.com/api/auth.test', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const authData = await authRes.json();
    results.auth = authData;
  } catch (e) {
    results.auth = { error: String(e) };
  }

  // Test 2: List conversations
  try {
    const convRes = await fetch('https://slack.com/api/conversations.list?exclude_archived=true&limit=5', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const convData = await convRes.json();
    results.conversations = convData;
  } catch (e) {
    results.conversations = { error: String(e) };
  }

  // Test 3: List channels
  try {
    const channelsRes = await fetch('https://slack.com/api/channels.list?exclude_archived=true&limit=5', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const channelsData = await channelsRes.json();
    results.channels = channelsData;
  } catch (e) {
    results.channels = { error: String(e) };
  }

  // Test 4: Try to get history from a channel if we have one
  try {
    const historyRes = await fetch('https://slack.com/api/conversations.history?channel=C000000000&limit=1', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const historyData = await historyRes.json();
    results.historyTest = historyData;
  } catch (e) {
    results.historyTest = { error: String(e) };
  }

  return NextResponse.json(results);
}
