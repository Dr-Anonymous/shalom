import { google } from 'googleapis';
import fetch from 'node-fetch';

// hardcoded tokens & IDs
const clientId = '126627498467-3c0a6d43afotdkut2ogt9pl2709m2n0r.apps.googleusercontent.com';
const clientSecret = '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';
const refreshToken = '1//0gnKTW9jvkX5yCgYIARAAGBASNwF-L9Irk-FxDaENmpb6HP9LWIYrVIxMVGilfxA61mfA_wXnMzljHUUsFEEfmoQI4HtqcLXqF28';

const fbToken = 'EAAs6rRo4yBIBANCi9VBWbvQUFNZBpXOv9I4nXLi3Q5OFnnbsdN1mAAsLiEZACqSFgOd96GofmVNFmzZBD8FfjFchr87Xw0oQKJbmZCu3gc8O88PUtTkZAtjhpaaGXHE1pfF29Dd2tDRU5cinP8G5746Ij5e47vZCnWASnZAXcTxAMTZAfvuyn0qFE0a16RrF0aH8YEwFEvf1IQZDZD';

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
