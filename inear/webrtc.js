var localStream, remoteStream, pc1, pc2, one = false;

function getName(pc) { return (pc === pc1) ? 'pc1' : 'pc2'; }
function getOtherPc(pc) { return (pc === pc1) ? pc2 : pc1; }
function deleteDB() { set(ref(db), {"functionName": false, "value": null, "songNumber": " "})}; 

function gotStream(stream) {
	localVideo.srcObject = stream;
	localStream = stream;
	localVideo.play().then(_ => {}).catch(error => {});
	//Refresh button list in case labels have become available
	return navigator.mediaDevices.enumerateDevices();
}

function start() {
	const audioSource = document.querySelector('#audioSource').value;
	const constraints = {
		audio: {
			deviceId: audioSource ? {
				exact: audioSource
			} : undefined
		}
	};	
	return navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).then(callFrom).catch(handleError);
}

function callFrom() {
	const servers = null;
	if (one) {
		pc1 = new RTCPeerConnection(servers);
		pc1.onicecandidate = e => onIceCandidate(pc1, e);
		pc1.oniceconnectionstatechange = e => onIceStateChange(pc1, e);
		localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
		//pc1.ontrack = gotRemoteStream;
		pc1.createOffer().then(onCreateOfferSuccess, onCreateSessionDescriptionError);
	} else {
		pc2 = new RTCPeerConnection(servers);
		pc2.onicecandidate = e => onIceCandidate(pc2, e);
		pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e);
		//localStream.getTracks().forEach(track => pc2.addTrack(track, localStream));
		pc2.ontrack = gotRemoteStream;
		setRemoteDescription2();
	}
}

function onCreateSessionDescriptionError(error) {
	console.log(`Failed to create session description: ${error.toString()}`);
}

function onCreateOfferSuccess(desc) {
	//console.log(`Offer from pc1\n${desc.sdp}`);
	//console.log('pc1 setLocalDescription start', desc);
	pc1.setLocalDescription(desc).then(() => onSetLocalSuccess(pc1), onSetSessionDescriptionError);
	//split the code here
}

function setRemoteDescription2() {
	//console.log('pc2 setRemoteDescription start');
	pc2.setRemoteDescription(offer).then(() => onSetRemoteSuccess(pc2), onSetSessionDescriptionError);
	//console.log('pc2 createAnswer start');
	pc2.createAnswer().then(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
	//console.log(`${getName(pc)} setLocalDescription complete`);
}

function onSetRemoteSuccess(pc) {
	//console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
	console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e) {
	//console.log('gotRemoteStream', e.track, e.streams[0]);
	remoteVideo.srcObject = null;
	remoteVideo.srcObject = e.streams[0];
	remoteVideo.play().then(_ => { }).catch(error => {});
	remoteStream = e.streams[0];
}

function onCreateAnswerSuccess(desc) {
	//console.log(`Answer from pc2: ${desc.sdp}`);
	//console.log('pc2 setLocalDescription start');
	pc2.setLocalDescription(desc).then(() => onSetLocalSuccess(pc2), onSetSessionDescriptionError);
	//split the code here
}

function setRemoteDescription1(pc, desc) {
	console.log(`pc setRemoteDescription start`);
	pc.setRemoteDescription(desc).then(() => onSetRemoteSuccess(pc), onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
	if (event.candidate == null) {
		if (one) set(ref(db),{"functionName": "project", "value": [JSON.stringify(pc.localDescription)]});
		else set(ref(db, 'value'), [JSON.stringify(offer), JSON.stringify(pc.localDescription)]);
	}
	console.log('Added code: ', event.candidate);
	/*getOtherPc(pc)
	    .addIceCandidate(event.candidate)
	    .then(() => onAddIceCandidateSuccess(pc), err => onAddIceCandidateError(pc, err));
	console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
	*/
}

function onAddIceCandidateSuccess(pc) {
	console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
	console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(pc, event) {
	if (pc) {
		//console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
		console.log('ICE state change event: ', event);
	}
}

function hangup() {
	if (pc1) {
		pc1.close();
		pc1;
	}
	if (pc2) {
		pc2.close();
		pc2;
	}

	/*const videoTracks = localStream.getVideoTracks();
	videoTracks.forEach(videoTrack => {
		videoTrack.stop();
		localStream.removeTrack(videoTrack);
	});
	localVideo.srcObject = null;
	localVideo.srcObject = localStream;*/
}

/* =========================== selecting sources ========================================= */
const audioInputSelect = document.querySelector('#audioSource');
const audioOutputSelect = document.querySelector('#audioOutput');
const selectors = [audioInputSelect, audioOutputSelect];
if (audioOutputSelect) audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

function gotDevices(deviceInfos) {
	// Handles being called several times to update labels. Preserve values.
	const values = selectors.map(select => select.value);
	selectors.forEach(select => {
		while (select.firstChild) {
			select.removeChild(select.firstChild);
		}
	});
	for (let i = 0; i !== deviceInfos.length; ++i) {
		const deviceInfo = deviceInfos[i];
		const option = document.createElement('option');
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === 'audioinput') {
			option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
			audioInputSelect.appendChild(option);
		} else if (deviceInfo.kind === 'audiooutput') {
			option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
			audioOutputSelect.appendChild(option);
		} else if (deviceInfo.kind === 'videoinput') {
			
            
		} else {
			console.log('Some other kind of source/device: ', deviceInfo);
		}
	}
	selectors.forEach((select, selectorIndex) => {
		if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
			select.value = values[selectorIndex];
		}
	});
}

if (audioInputSelect) navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
	if (typeof element.sinkId !== 'undefined') {
		element.setSinkId(sinkId)
			.then(() => {
				//console.log(`Success, audio output device attached: ${sinkId}`);
			})
			.catch(error => {
				let errorMessage = error;
				if (error.name === 'SecurityError') {
					errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
				}
				console.error(errorMessage);
				// Jump back to first output device in the list as it's the default.
				audioOutputSelect.selectedIndex = 0;
			});
	} else {
		console.warn('Browser does not support output device selection.');
	}
}

function changeAudioDestination() {
	const audioDestination = audioOutputSelect.value;
	attachSinkId(localVideo, audioDestination);
}

if (audioInputSelect) audioInputSelect.onchange = deleteDB;
if (audioOutputSelect) audioOutputSelect.onchange = changeAudioDestination;


function handleError(error) {
	console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}