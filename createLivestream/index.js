import { google } from 'googleapis';
import fetch from 'node-fetch';

// Tokens & IDs loaded from Cloud Run environment variables
const clientId = process.env.YT_CLIENT_ID;
const clientSecret = process.env.YT_CLIENT_SECRET;
const refreshToken = process.env.YT_REFRESH_TOKEN;
const fbToken = process.env.FB_ACCESS_TOKEN;

export async function mainHandler(req, res) {
  try {
    // create OAuth2 client with your credentials
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const videoUrl = await createLiveStream(youtube);
    await updateFirebase(videoUrl);
    await postToFacebook('Join us live: ' + videoUrl, videoUrl);

    res.send('✅ Livestream created and posted to Firebase & Facebook: ' + videoUrl);
  } catch (e) {
    console.error(e);
    res.status(500).send('❌ Error: ' + e.message);
  }
}

async function createLiveStream(youtube) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  let startTime = tomorrowDate + 'T05:00:00Z';
  let endTime = tomorrowDate + 'T07:00:00Z';

  const res = await youtube.liveBroadcasts.insert({
    part: ['snippet', 'contentDetails', 'status'],
    requestBody: {
      snippet: {
        title: 'Shalom Worship Centre live on ' + tomorrowDate,
        description: 'Live telecast of Shalom Worship Centre sermons and worship service.\nLocation : https://g.page/r/CWDKVPcofA7nEAE \nWhatsapp number : 9666615555',
        scheduledStartTime: startTime,
        scheduledEndTime: endTime
      },
      contentDetails: {
        enableDvr: true,
        enableEmbed: true,
        recordFromStart: true,
        enableAutoStart: true,
        startWithSlate: true
      },
      status: { privacyStatus: 'public', selfDeclaredMadeForKids: false }
    }
  });
  return 'https://youtu.be/' + res.data.id;
}

async function updateFirebase(videoUrl) {
  const url = 'https://mydatabase-c35da-default-rtdb.firebaseio.com/prefs/ytVideoLink.json';
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(videoUrl)
  });
  if (!response.ok) {
    throw new Error('Failed to update Firebase Realtime Database: ' + response.statusText);
  }
}

async function postToFacebook(message, videoUrl) {
  const url = 'https://graph.facebook.com/696870770385720/feed';
  const response = await fetch(`${url}?message=${encodeURIComponent(message)}&link=${videoUrl}&access_token=${fbToken}`, {
    method: 'POST'
  });
  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch (e) {}
    throw new Error('Failed to post to Facebook: ' + response.statusText + ' - details: ' + errorBody);
  }
}
