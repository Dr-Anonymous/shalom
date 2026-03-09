const firebaseConfig = {
    apiKey: "AIzaSyBpFCW5CcLoQP3ThnTm2gtOJoxLPAnas-A",
    authDomain: "mydatabase-c35da.firebaseapp.com",
    databaseURL: "https://mydatabase-c35da-default-rtdb.firebaseio.com/",
    projectId: "mydatabase-c35da",
    storageBucket: "mydatabase-c35da.appspot.com",
    messagingSenderId: "945373860956",
    appId: "1:945373860956:web:3ea16749c73345eb684299"
};

var dbFirestore = null;
var allSongs = [];
var editorModal = null;

$(document).ready(function () {
    firebase.initializeApp(firebaseConfig);
    dbFirestore = firebase.firestore();

    var myModalEl = document.getElementById('songEditorModal');
    if (myModalEl) {
        // Wait until elements are instantiated or handle normally
        editorModal = new bootstrap.Modal(myModalEl);
    }

    loadAllSongs();
});

function loadAllSongs() {
    dbFirestore.collection("songs").onSnapshot((querySnapshot) => {
        var rawDocs = [];
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.docId = doc.id;
            rawDocs.push(data);
        });
        rawDocs.sort((a, b) => a.id - b.id);
        allSongs = rawDocs;
        renderSongs(allSongs);
    }, (error) => {
        console.error("Error fetching from Firestore", error);
        toast("Error loading songs.");
    });
}

function renderSongs(songsToRender) {
    let container = $("#song-list");
    container.empty();
    if (songsToRender.length === 0) {
        container.append("<div class='text-center py-5'>No songs found</div>");
        return;
    }

    songsToRender.forEach((song) => {
        let title = song.title || "Untitled";
        let escapedTitle = title.replace(/'/g, "\\'");

        let item = `
        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2 shadow-sm rounded border">
            <h5 class="mb-0 text-truncate" style="max-width: 80%;">${title} <small class="text-muted ms-2">(ID: ${song.id})</small></h5>
            <div>
                <button class="btn btn-outline-primary btn-sm" onclick="editSong('${song.docId}')">Edit</button>
                <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteSong('${song.docId}', '${escapedTitle}')">Delete</button>
            </div>
        </div>`;
        container.append(item);
    });
}

function filterSongs() {
    let query = $("#searchSongs").val().toLowerCase();
    let filtered = allSongs.filter(s => s.title && s.title.toLowerCase().includes(query));
    renderSongs(filtered);
}

function editSong(docId) {
    let song = allSongs.find(s => s.docId === docId);
    if (!song) return;

    $("#editSongDocId").val(song.docId);
    $("#editSongId").val(song.id);
    $("#editSongTitle").val(song.title);

    $("#slides-container").empty();
    if (song.slides && song.slides.length > 0) {
        song.slides.forEach(slide => addSlideField(slide));
    } else {
        addSlideField("");
    }

    $("#songEditorModalLabel").text("Edit Song: " + song.title);
    editorModal.show();
}

function openEditor() {
    $("#editSongDocId").val("");

    let maxId = 0;
    if (allSongs.length > 0) {
        maxId = Math.max(...allSongs.map(s => s.id || 0));
    }
    let nextId = maxId + 1;

    $("#editSongId").val(nextId);
    $("#editSongTitle").val("");
    $("#slides-container").empty();
    addSlideField("");

    $("#songEditorModalLabel").text("Add New Song");
    editorModal.show();
}

function addSlideField(content = "") {
    let unescaped = content.replace(/"/g, '&quot;');
    let slideHtml = `
    <div class="slide-item mb-3 p-3 border rounded position-relative bg-light text-dark">
        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onclick="$(this).parent().remove()">X</button>
        <label class="form-label mb-1 fw-bold">Slide Content (Lines separate by enter)</label>
        <textarea class="form-control slide-content-field" rows="5">${unescaped}</textarea>
    </div>`;
    $("#slides-container").append(slideHtml);
}

function saveSong() {
    let docId = $("#editSongDocId").val();
    let songId = parseInt($("#editSongId").val());
    let title = $("#editSongTitle").val().trim();

    if (!title) {
        toast("Please enter a title");
        return;
    }

    let slides = [];
    $(".slide-content-field").each(function () {
        let val = $(this).val().trim();
        if (val) {
            slides.push(val);
        }
    });

    if (slides.length === 0) {
        toast("Please provide at least one slide");
        return;
    }

    $("#saveSongBtn").prop("disabled", true).text("Saving...");

    let payload = {
        id: songId,
        title: title,
        slides: slides
    };

    if (!docId) {
        docId = String(songId);
        dbFirestore.collection("songs").doc(docId).set(payload)
            .then(() => {
                toast("Song added successfully!");
                editorModal.hide();
                $("#saveSongBtn").prop("disabled", false).text("Save changes");
            })
            .catch(error => {
                console.error(error);
                toast("Error adding song");
                $("#saveSongBtn").prop("disabled", false).text("Save changes");
            });
    } else {
        dbFirestore.collection("songs").doc(docId).update(payload)
            .then(() => {
                toast("Song updated successfully!");
                editorModal.hide();
                $("#saveSongBtn").prop("disabled", false).text("Save changes");
            })
            .catch(error => {
                console.error(error);
                toast("Error updating song");
                $("#saveSongBtn").prop("disabled", false).text("Save changes");
            });
    }
}

function deleteSong(docId, title) {
    if (confirm("Are you sure you want to delete song: " + title + "?")) {
        dbFirestore.collection("songs").doc(docId).delete().then(() => {
            toast("Song deleted!");
        }).catch((err) => {
            console.error(err);
            toast("Error deleting song.");
        });
    }
}

function toast(tex) {
    $('#toastBody').text(tex);
    var toastBox = new bootstrap.Toast(document.getElementById('myToast'));
    toastBox.show();
}
