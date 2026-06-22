var firstTime = true,
	parent = false,
	slideIndex = 1,
	downloadingVer = false,
	offline = false,
	jumbleFonts = false,
	dbFirestore = null,
	dbData = [],
	songNumber = 'nothing',
	prefs = {},
	changeFontSize = 0,
	histo = [],
	fromHistory = false,
	option = "",
	firebaseConfig = {
		apiKey: "AIzaSyBpFCW5CcLoQP3ThnTm2gtOJoxLPAnas-A",
		authDomain: "mydatabase-c35da.firebaseapp.com",
		databaseURL: "https://mydatabase-c35da-default-rtdb.firebaseio.com/",
		projectId: "mydatabase-c35da",
		storageBucket: "mydatabase-c35da.appspot.com",
		messagingSenderId: "945373860956",
		appId: "1:945373860956:web:3ea16749c73345eb684299"
	};

function urlParam(name) {
	var url2 = new URL(window.location.href);
	if (name) return url2.searchParams.get(name);
	var param = url2.searchParams.toString().slice(0, -1);
	return param;
}

$(document).ready(async function () {
	if ((await window.indexedDB.databases()).map(db => db.name).includes('songsbook')) {
		offline = true;
	}
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
	// Get a reference to the database service
	database = firebase.database().ref();
	dbFirestore = firebase.firestore();

	if (checkCookie('jumbleFonts')) {
		$("button[onclick='changeFont();']").removeClass('btn-outline-secondary').addClass('btn-secondary');
		jumbleFonts = true;
	}

	getSlides('all');

	var para = urlParam();
	if (para == 'parent') {
		parent = true;
		$('.parentControls').addClass('d-none');
		$('.childControls').removeClass('d-none');
		$('.header, footer').addClass('d-none');
		$('body').addClass('embedded-parent');
	}

	if (parent == true) database.on('value', (snapshot) => {
		var data = snapshot.val();
		if (!data) return;
		var value = data["value"];
		prefs = (data["prefs"] && typeof data["prefs"] === 'object') ? data["prefs"] : {};
		if (prefs && prefs['histo']) {
			$("#show").removeClass('d-none');
		}
		switch (data["functionName"]) {
			case false:
				break;
			case 'currentSlide':
				if (songNumber == 'nothing') loadData(data["songNumber"]);
				currentSlide(value);
				break;
			case 'loadData':
				if (value == 0) loadData(data["songNumber"]);
				else loadData(value);
				break;
			default:
			//no default behaviour
		}

	});

	// Custom double-tap gesture for iOS/Safari mobile full screen
	var lastTap = 0;
	$('#resultHere').on('touchend', function(e) {
		var currentTime = new Date().getTime();
		var tapLength = currentTime - lastTap;
		if (tapLength < 300 && tapLength > 0) {
			toggleFullScreen();
			e.preventDefault();
		}
		lastTap = currentTime;
	});
});

function getSlides(e) {
	try {
		if (e === 'all') {
			if (offline) {
				var request = indexedDB.open('songsbook');
				request.onsuccess = () => {
					var db = request.result;
					if (!db.objectStoreNames.contains('songsbook')) return;
					var transaction = db.transaction('songsbook', "readonly");
					var book = transaction.objectStore('songsbook');
					var getRequest = book.getAll();
					getRequest.onsuccess = () => {
						if (getRequest.result && getRequest.result.length > 0) {
							dbData = getRequest.result[0];
							loadData(dbData);
							checkUrlAndLoad();
						}
					};
				}
			}

			// Listen to Firestore for real-time updates
			dbFirestore.collection("songs").onSnapshot((querySnapshot) => {
				var dataArr = [];
				var rawDocs = [];
				querySnapshot.forEach((doc) => {
					let data = doc.data();
					if (!data.deleted) {
						rawDocs.push(data);
					}
				});
				rawDocs.sort((a, b) => {
					let titleA = (a.title || "").toLowerCase();
					let titleB = (b.title || "").toLowerCase();
					if (titleA < titleB) return -1;
					if (titleA > titleB) return 1;
					return 0;
				});
				rawDocs.forEach((data) => {
					let songArr = [];
					songArr.push(data.title);
					data.slides.forEach((s) => songArr.push(s));
					dataArr.push(songArr);
				});

				// Compare with current dbData
				if (JSON.stringify(dbData) !== JSON.stringify(dataArr)) {
					dbData = dataArr;

					// update IndexedDB silently
					updateIndexedDB(dbData);

					if (firstTime) {
						loadData(dbData);
						checkUrlAndLoad();
					} else {
						// update autocomplete and index dynamically
						var myData = [];
						for (let i = 0; i < dbData.length; i++) {
							var myArr = {};
							myArr["label"] = dbData[i][0];
							myArr["value"] = (i + 1);
							myData.push(myArr);
						}
						if (window.ac) {
							window.ac.setData(myData);
						}
						index();
					}
				}
			}, (error) => {
				console.error("Error fetching from Firestore", error);
				if (!offline) {
					toast("Error loading songs.");
				}
			});

		} else {
			if (dbData && dbData.length > 0) {
				if (parent == true) writeFirebaseData('loadData', 0, dbData[e - 1]);
				else {
					loadData(dbData[e - 1]);
					// Update URL for sharing
					var newUrl = new URL(window.location.href);
					newUrl.searchParams.set('id', e);
					window.history.replaceState(null, '', newUrl);
				}

				if (!fromHistory) {
					histo.push(e);
				} else {
					fromHistory = false;
				}
			}
		}
	} catch (error) {
		toast(error);
	}
}

function checkUrlAndLoad() {
	var songId = urlParam('id') || urlParam('s');
	if (!songId) {
		var match = window.location.pathname.match(/\/songsbook\/([\d\w%]+)/);
		if (match) songId = match[1];
	}
	if (songId && dbData && dbData.length > 0) {
		if (isNaN(songId)) {
			// Try matching title
			var index = dbData.findIndex(s => s[0].toLowerCase() === decodeURIComponent(songId).toLowerCase());
			if (index !== -1) getSlides(index + 1);
		} else {
			var id = parseInt(songId);
			if (id > 0 && id <= dbData.length) getSlides(id);
		}
	}
}

async function loadData(e) {
	//console.dir(e);
	if (firstTime) {
		firstTime = false;
		//autosuggest book names
		var field = $("#songName")[0];
		window.ac = new Autocomplete(field, {
			maximumItems: 10,
			onSelectItem: ({
				label,
				value
			}) => {
				getSlides(value);
				$('#index').hide();
			},
		});
		var myData = [];
		for (i = 0; i < e.length; i++) {
			var myArr = {};
			myArr["label"] = e[i][0];
			myArr["value"] = (i + 1);
			myData.push(myArr);
		}
		window.ac.setData(myData);
		$('#songName').removeClass('d-none').focus();
		index();
		return;
	}

	$("#resultHere").empty();
	$("#dot-container").empty();
	$("#show").removeClass('d-none');
	//document.title = docTitle = e[0]; //is heading
	try {
		var j = 1;
		for (var i = 1; i < e.length; i++) {
			if (e[i] == "" || e[i] == "\n" || e[i] == "\t") {
				continue;
			}
			$("#resultHere").append("<div class=\"mySlides\"><p class=\"fs-1 lh-base\">" + e[i].trim().replace(/\u000b|\n/g, '<br>') + "</p></div>"); //.replace(/\t/g, '&nbsp;&nbsp;')
			$("#dot-container").append("<span class=\"dot\" onclick=\"currentSlide(" + j + ")\">" + j + "</span>");
			j++;
		}
		slideIndex = 1;
		showSlides(1);
		if (jumbleFonts) loadCSS();
		songNumber = e;
		changeFontSize = 0;
	} catch (err) {
		$("#resultHere").append(err);
	}
}

async function toast(tex) {
	$('#toastBody').text(tex);
	var toastBox = new bootstrap.Toast($('#myToast'))
	toastBox.show();
	return;
}
//======== slides
function plusSlides(n) {
	slideIndex = slideIndex + n;
	currentSlide(slideIndex);
}

function currentSlide(n) {
	slideIndex = n;
	showSlides(slideIndex);
	if (parent == true) writeFirebaseData('currentSlide', n);
}

function showSlides(n) {
	var i;
	var slides = $(".mySlides");
	var dots = $(".dot");
	if (slides.length == 0) return;

	if (n > slides.length) { slideIndex = 1 }
	if (n < 1) { slideIndex = slides.length }
	for (i = 0; i < slides.length; i++) {
		slides[i].style.display = "none";
		dots[i].className = dots[i].className.replace(" active", "");
	}
	/*for (i = 0; i < dots.length; i++) {
	   dots[i].className = dots[i].className.replace(" active", "");
	}*/
	slides[slideIndex - 1].style.display = "block";
	dots[slideIndex - 1].className += " active";
}


document.onkeydown = checkKey;
function checkKey(e) {
	if ($(':focus').attr('id') == 'songName' || $(':focus').attr('id') == 'fontSize') return;
	e = e || window.event;

	if (e.keyCode == '37') {
		// left arrow
		plusSlides(-1);
	}
	else if (e.keyCode == '39') {
		// right arrow
		plusSlides(1);
	}
	else if (e.keyCode == '70' && e.ctrlKey || e.keyCode == '70' && e.metaKey) {
		// f + ctrl or cmd key
		toggleFullScreen();
		e.preventDefault();
	}
	else if (e.keyCode == '27') {
		// esc key
		if (parent == true) {
			writeFirebaseData('loadData', [' ', ' ']);
		} else {
			loadData([' ', ' ']);
		}
		$('#songName').val('').focus();
	}
	else if (e.key == '1' || e.key == '2' || e.key == '3' || e.key == '4' || e.key == '5' || e.key == '6' || e.key == '7' || e.key == '8' || e.key == '9' || e.key == '0') {
		// num keys
		try {
			slideIndex = parseInt(e.key);
			showSlides(slideIndex);
			if (parent == true) { writeFirebaseData('currentSlide', slideIndex); }
		} catch (err) {
			console.log(err);
		}
	}
}

function fontSize(e) {
	changeFontSize += e;
	$("#resultHere p").attr('style', 'font-size:' + (parseFloat($("#resultHere p").css('font-size')) + changeFontSize) + 'px !important');
	if (parent == true) { writeFirebaseData('fontSize', changeFontSize); }
}

function toggleFullScreen() {
	var elem = $('#show')[0];
	var isFallbackActive = $('#show').hasClass('fullscreen-fallback');
	var isNativeFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || document.fullscreen || document.webkitIsFullScreen;

	if (isNativeFullscreen || isFallbackActive) {
		closeFullscreen();
	} else {
		openFullscreen(elem);
	}
}

/* View in fullscreen */
function openFullscreen(elem) {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.webkitRequestFullscreen) { /* Safari (macOS / iPadOS) */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE11 */
		elem.msRequestFullscreen();
	} else {
		// CSS Fallback for iPhone Safari
		$(elem).addClass('fullscreen-fallback');
		$('body').addClass('has-fullscreen-fallback');
	}
}

/* Close fullscreen */
function closeFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) { /* Safari */
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) { /* IE11 */
		document.msExitFullscreen();
	}
	
	// Always clean up CSS fallback
	$('#show').removeClass('fullscreen-fallback');
	$('body').removeClass('has-fullscreen-fallback');
}

/*============ download to offline*/
async function downloadOffline() {
	if (!('indexedDB' in window)) {
		toast('This browser doesn\'t support offline storage.');
		return;
	}
	if (downloadingVer) {
		toast('Kindly wait for the previous download to complete.');
		return;
	}

	if (offline) {
		toast('Songsbook already available offline.');
		return;
	}

	downloadingVer = true;

	toast('Download of songsbook started.');
	if (dbData && dbData.length > 0) {
		writeToDb(dbData);
	} else {
		dbFirestore.collection("songs").get().then((querySnapshot) => {
			var dataArr = [];
			var rawDocs = [];
			querySnapshot.forEach((doc) => {
				rawDocs.push(doc.data());
			});
			rawDocs.sort((a, b) => a.id - b.id);
			rawDocs.forEach((data) => {
				let songArr = [];
				songArr.push(data.title);
				data.slides.forEach((s) => songArr.push(s));
				dataArr.push(songArr);
			});
			dbData = dataArr;
			writeToDb(dbData);
		});
	}
	return true;
}

function updateIndexedDB(e) {
	if (!window.indexedDB) return;
	var req = window.indexedDB.deleteDatabase('songsbook');
	req.onsuccess = function () {
		var request = window.indexedDB.open('songsbook', 1);
		request.onupgradeneeded = function (event) {
			const db = request.result;
			db.createObjectStore('songsbook', { autoIncrement: true });
		};
		request.onsuccess = () => {
			const db = request.result;
			var transaction = db.transaction('songsbook', "readwrite");
			var store = transaction.objectStore('songsbook');
			store.add(e);
			offline = true;
			setCookie('dbDate', new Date(), 120);
		};
	};
}

function writeToDb(e) {
	var request = window.indexedDB.open('songsbook',);
	// Create schema
	request.onupgradeneeded = function (event) {
		const db = request.result;
		db.createObjectStore('songsbook', {
			autoIncrement: true
		});
	};

	request.onsuccess = () => {
		const db = request.result;
		var transaction = db.transaction('songsbook', "readwrite");
		var store = transaction.objectStore('songsbook');
		// Add data
		store.add(e);
		toast('Songsbook available offline.').then(
			function () {
				downloadingVer = false;
				offline = true;
				setCookie('dbDate', new Date(), 120)
			});
	};

	//load suggestions accordingly
	firstTime = true;
	getSlides('all');
	$("#songName").next().remove();
}

function changeFont() {
	if (jumbleFonts) {
		$("button[onclick='changeFont();']").removeClass('btn-secondary').addClass('btn-outline-secondary');
		jumbleFonts = false;
		loadCSS(0);
		document.cookie = "jumbleFonts=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	} else {
		$("button[onclick='changeFont();']").removeClass('btn-outline-secondary').addClass('btn-secondary');
		jumbleFonts = true;
		loadCSS();
		//set cookie to true
		const d = new Date();
		d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
		document.cookie = "jumbleFonts=true;expires=" + d.toUTCString() + ";path=/;";
	}
}

var f = 0;
function loadCSS(font) {
	var telFonts = ['Anek Telugu', 'Hind Guntur', 'NTR', 'Suranna', 'Ramaraja', 'Ramabhadra', 'Mandali',
		'Gurajada', 'Timmana', 'Mallanna', 'Lakki Reddy', 'Ravi Prakash', 'Suravaram', 'Akaya Telivigala', 'Dhurjati', 'Tenali Ramakrishna'];

	if (!font || font != 0) {
		font = telFonts[f];
		if (f < telFonts.length - 1) f++;
		else f = 0;
	} else {
		font = 'Open+Sans:400italic,400';
	}

	$('#resultHere').css('font-family', font);
	$('#fontFamily').attr('href', 'https://fonts.googleapis.com/css?family=' + font.replace(/ /g, "+") + "&display=swap");
	if (parent == true) writeFirebaseData('loadCSS', 0);
}

function checkCookie(e) {
	let name = e + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}

	}
	//jumbleFonts = false;
}

function writeFirebaseData(name, value, num) {
	if (num) songNumber = num;
	if (!prefs || typeof prefs !== 'object') prefs = {};
	prefs["histo"] = histo.toString();
	database.update({ "functionName": name, "value": value, "songNumber": songNumber, "prefs": prefs });
}

/* =====history===================== */
function loadHistory() {
	if (histo.length == 0 && prefs && typeof prefs['histo'] === 'string' && prefs['histo'].trim() !== '') {
		histo = prefs['histo'].split(",");
	}
	$("#historyOptions").empty();
	option = '';
	for (var i = 0; i < histo.length; i++) {
		var songIdx = parseInt(histo[i]);
		if (!isNaN(songIdx) && dbData && dbData[songIdx - 1]) {
			option += '<li class="d-flex"><a class="dropdown-item" href="javascript:;" onclick="fromHistory=true;getSlides(' + songIdx + ');">' +
				dbData[songIdx - 1][0] + '</a><button type="button" class="btn" onclick="histo.splice(' + i + ', 1);$(this).remove();"> X </button></li>';
		}
	}
	$("#historyOptions").append(option);
}

//before exit reset everything except last songnumber and save cookie
var onBeforeUnLoadEvent = false;
window.onpagehide = window.onbeforeunload = window.onunload = function () {
	if (!onBeforeUnLoadEvent) {
		onBeforeUnLoadEvent = true;
		if (parent == true) writeFirebaseData(false, 0);
	}
};

//for touchscreen swipe
$("#show").on("swipeleft", function () { plusSlides(1) }).on("swiperight", function () { plusSlides(-1) });

function setCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// create index
function index() {
	var indexContainer = $('#index');
	if (indexContainer.length === 0) return;

	// Group songs by character
	var groups = {};
	for (var i = 0; i < dbData.length; i++) {
		var title = dbData[i][0] || '';
		var firstChar = title.trim().charAt(0).toUpperCase();
		
		var groupKey = firstChar;
		if (/[0-9]/.test(firstChar)) {
			groupKey = '#';
		} else if (!/[A-Z\u0c00-\u0c7f]/.test(firstChar)) {
			groupKey = '*';
		}
		
		if (!groups[groupKey]) {
			groups[groupKey] = [];
		}
		groups[groupKey].push({
			id: i + 1,
			title: title
		});
	}

	// Sort characters (Telugu first, then A-Z, then other symbols)
	var sortedKeys = Object.keys(groups).sort((a, b) => {
		var aIsTelugu = /[\u0c00-\u0c7f]/.test(a);
		var bIsTelugu = /[\u0c00-\u0c7f]/.test(b);
		
		if (aIsTelugu && !bIsTelugu) return -1;
		if (!aIsTelugu && bIsTelugu) return 1;
		
		var aIsEnglish = /[A-Z]/.test(a);
		var bIsEnglish = /[A-Z]/.test(b);
		
		if (aIsEnglish && !bIsEnglish) return -1;
		if (!aIsEnglish && bIsEnglish) return 1;
		
		if (a === '#') return -1;
		if (b === '#') return 1;
		if (a === '*') return 1;
		if (b === '*') return -1;
		
		return a.localeCompare(b);
	});

	// Build the accordion HTML
	var html = '<div class="accordion-index">';
	for (var j = 0; j < sortedKeys.length; j++) {
		var key = sortedKeys[j];
		var songs = groups[key];
		html += '<div class="accordion-group">';
		html += '  <button class="btn btn-light w-100 text-center accordion-header" data-key="' + key + '" style="font-weight: 600; background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 8px 10px;">';
		html += '    ' + key;
		html += '  </button>';
		html += '  <div class="accordion-content" style="display: none; padding: 10px 0;">';
		html += '    <ol class="song-index-list">';
		for (var k = 0; k < songs.length; k++) {
			var song = songs[k];
			html += '      <li class="song-index-item" data-id="' + song.id + '" data-title="' + song.title.replace(/"/g, '&quot;') + '">';
			html += '        <strong>' + song.id + '.</strong> ' + song.title;
			html += '      </li>';
		}
		html += '    </ol>';
		html += '  </div>';
		html += '</div>';
	}
	html += '</div>';

	indexContainer.html(html);

	// Add styles for hover, active, layout responsiveness, and accordion
	if ($('#indexStyles').length === 0) {
		$('<style id="indexStyles">')
			.html(
				'#index { background-color: transparent; border: none; padding: 10px 0; color: #212529; } ' +
				'.accordion-index { display: flex; flex-wrap: wrap; gap: 8px; } ' +
				'.accordion-group { width: calc(50% - 4px); transition: width 0.2s ease; margin-bottom: 2px; } ' +
				'.accordion-group.expanded { width: 100% !important; } ' +
				'.accordion-header { padding: 8px 12px; border-radius: 6px; transition: background-color 0.2s, border-color 0.2s; color: #495057 !important; } ' +
				'.accordion-header:hover { background-color: #e9ecef !important; border-color: #adb5bd !important; } ' +
				'.accordion-header.active { background-color: #e9ecef !important; border-color: #6c757d !important; font-weight: bold; } ' +
				'.song-index-list { columns: 2; list-style-type: none; padding-left: 0; margin-bottom: 0; } ' +
				'.song-index-item { cursor: pointer; padding: 6px 12px; margin-bottom: 4px; border-radius: 4px; transition: background 0.15s, color 0.15s; color: #212529; } ' +
				'.song-index-item:hover { background-color: #f1f3f5; color: #000; } ' +
				'@media (max-width: 767.98px) { .song-index-list { columns: 1 !important; } }'
			)
			.appendTo('head');
	}

	// Set up event listeners
	// Toggle accordion group
	indexContainer.off('click', '.accordion-header').on('click', '.accordion-header', function () {
		var group = $(this).closest('.accordion-group');
		var content = $(this).next('.accordion-content');
		var isVisible = content.is(':visible');

		// Collapse all other content areas and reset active states
		indexContainer.find('.accordion-content').slideUp(150);
		indexContainer.find('.accordion-header').removeClass('active');
		indexContainer.find('.accordion-group').removeClass('expanded');

		if (!isVisible) {
			group.addClass('expanded');
			content.slideDown(150);
			$(this).addClass('active');
		}
	});

	// Song item click
	indexContainer.off('click', '.song-index-item').on('click', '.song-index-item', function () {
		var id = $(this).attr('data-id');
		var title = $(this).attr('data-title');
		getSlides(parseInt(id));
		$('#index').hide();
		$('#songName').val(title);
	});
}