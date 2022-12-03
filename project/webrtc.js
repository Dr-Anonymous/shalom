var localStream, remoteStream, pc1, pc2, one;

function getName(pc) { return (pc === pc1) ? 'pc1' : 'pc2'; }
function getOtherPc(pc) { return (pc === pc1) ? pc2 : pc1; }
function deleteDB(){ set(ref(db), {"functionName": false, "value": null, "songNumber": " "})}; 

function gotStream(stream) {
	localVideo.srcObject = stream;
	localStream = stream;
	localVideo.play().then(_ => {}).catch(error => {});
	//Refresh button list in case labels have become available
	return navigator.mediaDevices.enumerateDevices();
}

function start() {
	const audioSource = document.querySelector('#audioSource').value;
	const videoSource = document.querySelector('#videoSource').value;
	const constraints = {
		audio: {
			deviceId: audioSource ? {
				exact: audioSource
			} : undefined
		},
		video: {
			deviceId: videoSource ? {
				exact: videoSource
			} : undefined
		}
	};

	if ($("#loadLocal").val() !== '') return callFrom();

	if ($('#screenShare').attr('share') == 'yes') {
		if ($("#screenShareAudio").attr('checked')) {
			navigator.mediaDevices.getDisplayMedia({video: true}).then(clubAudio).then(callFrom).catch(handleError);
			delete constraints.video;
			return navigator.mediaDevices.getUserMedia(constraints).then(clubAudio).then(gotStream).then(gotDevices).then(callFrom).catch(handleError);
		}
		
		return navigator.mediaDevices.getDisplayMedia({video: true}).then(gotStream).then(gotDevices).then(callFrom).catch(handleError);
	}
	
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
		setCodec(pc1);
		pc1.createOffer().then(onCreateOfferSuccess, onCreateSessionDescriptionError);
	} else {
		pc2 = new RTCPeerConnection(servers);
		pc2.onicecandidate = e => onIceCandidate(pc2, e);
		pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e);
		//localStream.getTracks().forEach(track => pc2.addTrack(track, localStream));
		pc2.ontrack = gotRemoteStream;
		//setCodec(pc2);
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
const videoSelect = document.querySelector('#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];
if (audioOutputSelect) audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);
var screenCaptureStream;

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
			option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
			videoSelect.appendChild(option);
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

if (one) navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

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
if (videoSelect) videoSelect.onchange = deleteDB;

function scrShare() {
	if ($("#screenShare").attr('share') == 'no') {
		$("#screenShare").addClass('btn-primary').removeClass('btn-secondary').attr('share', 'yes');
		$("#screenShare").parent().next().removeClass('d-none');
	} else {
		$("#screenShare").addClass('btn-secondary').removeClass('btn-primary').attr('share', 'no');
		$("#screenShare").parent().next().addClass('d-none');
	}
	if (localStream) deleteDB();
}

function clubAudio(str) {
	if (str.getAudioTracks().length < 1) {
		screenCaptureStream = str;
		return;
	}
	str.addTrack(screenCaptureStream.getVideoTracks()[0]);
	return str;
}

function handleError(error) {
	console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function upgrade() {
	/* Not used code */
	navigator.mediaDevices
		.getUserMedia({
			video: true
		})
		.then(stream => {
			const videoTracks = stream.getVideoTracks();
			localStream.addTrack(videoTracks[0]);
			localVideo.srcObject = null;
			localVideo.srcObject = localStream;
			pc1.addTrack(videoTracks[0], localStream);
			return pc1.createOffer();
		})
		.then(offer => pc1.setLocalDescription(offer))
		.then(() => pc2.setRemoteDescription(pc1.localDescription))
		.then(() => pc2.createAnswer())
		.then(answer => pc2.setLocalDescription(answer))
		.then(() => pc1.setRemoteDescription(pc2.localDescription));
}

/* =================== record video ==================================*/
let mediaRecorder;
let recordedBlobs;

const recordedVideo = $('#remoteVideo')[0];
const recordButton = $('#record');
const playButton = $('#play');
const downloadButton = $('#download');


recordButton.on('click', () => {
	if (recordButton[0].classList.contains('btn-secondary')) {
		startRecording();
	} else {
		stopRecording();
		recordButton.addClass('btn-secondary').removeClass('btn-danger');
		playButton.parent().removeClass('d-none');
		downloadButton.parent().removeClass('d-none');
		codecPreferences[0].disabled = false;
	}
});

playButton.on('click', () => {
	const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value.split(';', 1)[0];
	const superBuffer = new Blob(recordedBlobs, {
		type: mimeType
	});
	recordedVideo.src = null;
	recordedVideo.srcObject = null;
	recordedVideo.src = window.URL.createObjectURL(superBuffer);
	recordedVideo.controls = true;
	recordedVideo.play();
});

downloadButton.on('click', () => {
	const blob = new Blob(recordedBlobs, {
		type: 'video/webm'
	});
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = 'test.webm';
	document.body.appendChild(a);
	a.click();
	setTimeout(() => {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
});

function handleDataAvailable(event) {
	console.log('handleDataAvailable', event);
	if (event.data && event.data.size > 0) {
		recordedBlobs.push(event.data);
	}
}

function getSupportedMimeTypes() {
	const possibleTypes = [
		'video/webm;codecs=vp9,opus',
		'video/webm;codecs=vp8,opus',
		'video/webm;codecs=h264,opus',
		'video/mp4;codecs=h264,aac',
	];
	return possibleTypes.filter(mimeType => {
		return MediaRecorder.isTypeSupported(mimeType);
	});
}

function startRecording() {
	recordedBlobs = [];
	const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value;
	const options = {
		mimeType
	};

	try {
		mediaRecorder = new MediaRecorder(remoteStream, options);
	} catch (e) {
		console.error('Exception while creating MediaRecorder:', e);
		alert(`Exception while creating MediaRecorder: ${JSON.stringify(e)}`);
		return;
	}

	console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
	recordButton.addClass('btn-danger').removeClass('btn-secondary');
	playButton.parent().addClass('d-none');
	downloadButton.parent().addClass('d-none');
	codecPreferences.disabled = true;
	mediaRecorder.onstop = (event) => {
		console.log('Recorder stopped: ', event);
		console.log('Recorded Blobs: ', recordedBlobs);
	};
	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.start();
	console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
	mediaRecorder.stop();
}

/* =====================local files============================ */
function loadLocalFile(){
	if ($("#loadLocal").val() === '') return;
	
	var url = URL.createObjectURL($('#loadLocal')[0].files[0]);
	localVideo.src = url;
	localVideo.addEventListener('canplay', () => {
		localVideo.play().then(_ => {}).catch(error => {});
		let stream;
		const fps = 0;
		if (localVideo.captureStream) {
		  stream = localVideo.captureStream(fps);
		} else if (localVideo.mozCaptureStream) {
		  stream = localVideo.mozCaptureStream(fps);
		} else {
		  console.error('Stream capture is not supported');
		  stream = null;
		}
		localStream = stream;
		
		return navigator.mediaDevices.enumerateDevices();
	});
}

/* ======================== codecs ===================================================== */
var codecPreferences = document.getElementById('codecPreferences');
var supportsSetCodecPreferences = window.RTCRtpTransceiver && 'setCodecPreferences' in window.RTCRtpTransceiver.prototype;

if (codecPreferences && supportsSetCodecPreferences) {
	const {
		codecs
	} = RTCRtpSender.getCapabilities('video');
	codecs.forEach(codec => {
		if (['video/red', 'video/ulpfec', 'video/rtx'].includes(codec.mimeType)) {
			return;
		}
		var option = document.createElement('option');
		option.value = (codec.mimeType + ' ' + (codec.sdpFmtpLine || '')).trim();
		option.innerText = option.value;
		codecPreferences.appendChild(option);
	});
	//codecPreferences.disabled = false;
}

function setCodec(x) {
	if (supportsSetCodecPreferences) {
		const preferredCodec = codecPreferences.options[codecPreferences.selectedIndex];
		if (preferredCodec.value !== '') {
			const [mimeType, sdpFmtpLine] = preferredCodec.value.split(' ');
			const {
				codecs
			} = RTCRtpSender.getCapabilities('video');
			const selectedCodecIndex = codecs.findIndex(c => c.mimeType === mimeType && c.sdpFmtpLine === sdpFmtpLine);
			const selectedCodec = codecs[selectedCodecIndex];
			codecs.splice(selectedCodecIndex, 1);
			codecs.unshift(selectedCodec);
			//console.log(codecs);
			const transceiver = x.getTransceivers().find(t => t.sender && t.sender.track === localStream.getVideoTracks()[0]);
			transceiver.setCodecPreferences(codecs);
			console.log('Preferred video codec: ', selectedCodec);
		}
	}
	codecPreferences.disabled = true;
}
