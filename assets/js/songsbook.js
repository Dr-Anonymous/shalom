var firstTime = true,
	parent = false,
	slideIndex = 1,
	downloadingVer = false,
	offline = false,
	jumbleFonts = false,
	dbFirestore = null,
	dbData = [],
	songNumber = 'nothing',
	prefs = [],
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

function urlParam() {
	var url2 = new URL(window.location.href);
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
	}

	if (parent == true) database.on('value', (snapshot) => {
		var data = snapshot.val();
		var value = data["value"];
		prefs = data["prefs"];
		if (prefs['histo']) {
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
				else loadData(dbData[e - 1]);

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
		if (parent == true) writeFirebaseData('loadData', [' ', ' ']);
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
	if (document.fullscreen || document.webkitIsFullScreen)
		closeFullscreen();
	else
		openFullscreen($('#show')[0]);
}

/* View in fullscreen */
function openFullscreen(elem) {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.webkitRequestFullscreen) { /* Safari */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE11 */
		elem.msRequestFullscreen();
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
	prefs["histo"] = histo.toString();
	database.set({ "functionName": name, "value": value, "songNumber": songNumber, "prefs": prefs });
}

/* =====history===================== */
function history() {
	if (histo.length == 0) histo = prefs['histo'].split(",");
	$("#historyOptions").empty();
	option = '';
	for (var i = 0; i < histo.length; i++) {
		option += '<li class="d-flex"><a class="dropdown-item" href="javascript:;" onclick="fromHistory=true;getSlides(' + histo[i] + ');">' +
			dbData[histo[i] - 1][0] + '</a><button type="button" class="btn" onclick="histo.splice(' + i + ', 1);$(this).remove();"> X </button></li>';
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
	var something = '<ol style="columns: 2;">';
	for (i in dbData) {
		something += '<li onclick="getSlides(' + (parseInt(i) + 1) + ');$(\'#index\').toggle();$(\'#songName\').val(\'' + dbData[i][0] + '\')">' + dbData[i][0] + '</li>';
	}
	something += '</ol>';
	$('#index').html(something);
}