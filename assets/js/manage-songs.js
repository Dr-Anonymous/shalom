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
var showingHistory = false;

$(document).ready(function () {
    firebase.initializeApp(firebaseConfig);
    dbFirestore = firebase.firestore();

    var myModalEl = document.getElementById('songEditorModal');
    if (myModalEl) {
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
        allSongs = rawDocs;
        refreshView();
    }, (error) => {
        console.error("Error fetching from Firestore", error);
        toast("Error loading songs.");
    });
}

function refreshView() {
    if (showingHistory) {
        renderHistory();
    } else {
        let active = allSongs.filter(s => !s.deleted);
        active.sort((a, b) => {
            let titleA = (a.title || "").toLowerCase();
            let titleB = (b.title || "").toLowerCase();
            if (titleA < titleB) return -1;
            if (titleA > titleB) return 1;
            return 0;
        });
        renderSongs(active);
    }
}

function toggleHistoryView() {
    showingHistory = !showingHistory;
    let btn = $("#toggleViewBtn");
    if (showingHistory) {
        btn.text("Back to Songs").removeClass("btn-outline-primary").addClass("btn-primary");
        $("h3").text("Song History");
    } else {
        btn.text("History").removeClass("btn-primary").addClass("btn-outline-primary");
        $("h3").text("Manage Songs");
    }
    refreshView();
}

function renderSongs(songsToRender) {
    let container = $("#song-list");
    container.empty();
    if (songsToRender.length === 0) {
        container.append("<div class='text-center py-5'>No active songs found</div>");
        return;
    }

    songsToRender.forEach((song) => {
        let title = song.title || "Untitled";
        let escapedTitle = title.replace(/'/g, "\\'");

        let item = `
        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2 shadow-sm rounded border">
            <h5 class="mb-0 text-truncate" style="max-width: 80%;">${title}</h5>
            <div>
                <button class="btn btn-outline-primary btn-sm" onclick="editSong('${song.docId}')">Edit</button>
                <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteSong('${song.docId}', '${escapedTitle}')">Delete</button>
            </div>
        </div>`;
        container.append(item);
    });
}

function renderHistory() {
    let container = $("#song-list");
    container.empty();

    // History = Deleted songs + Recently added songs
    // Sort by date (deletedAt or createdAt)
    let historyList = allSongs.filter(s => s.deleted || s.createdAt);
    
    // Custom sort: latest activity first
    historyList.sort((a, b) => {
        let dateA = a.deletedAt || a.createdAt || 0;
        let dateB = b.deletedAt || b.createdAt || 0;
        return (dateB > dateA) ? 1 : -1;
    });

    if (historyList.length === 0) {
        container.append("<div class='text-center py-5'>No history available</div>");
        return;
    }

    historyList.forEach((song) => {
        let title = song.title || "Untitled";
        let escapedTitle = title.replace(/'/g, "\\'");
        let typeLabel = song.deleted ? '<span class="badge bg-danger me-2">Deleted</span>' : '<span class="badge bg-success me-2">Added</span>';
        let actionBtn = song.deleted ? 
            `<button class="btn btn-outline-success btn-sm" onclick="restoreSong('${song.docId}')">Restore</button>` :
            `<button class="btn btn-outline-primary btn-sm" onclick="editSong('${song.docId}')">Edit</button>`;

        let item = `
        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2 shadow-sm rounded border">
            <div class="text-truncate" style="max-width: 70%;">
                ${typeLabel}
                <h5 class="mb-0 d-inline">${title}</h5>
            </div>
            <div>
                ${actionBtn}
            </div>
        </div>`;
        container.append(item);
    });
}

function filterSongs() {
    let query = $("#searchSongs").val().toLowerCase();
    let filtered = allSongs.filter(s => {
        let matchesSearch = s.title && s.title.toLowerCase().includes(query);
        if (showingHistory) {
            return matchesSearch && (s.deleted || s.createdAt);
        } else {
            return matchesSearch && !s.deleted;
        }
    });
    
    if (showingHistory) {
        // Just sort by title for filtered history too if we want, or keep date?
        // Let's keep date for history even when filtering
    } else {
        filtered.sort((a, b) => {
            let titleA = (a.title || "").toLowerCase();
            let titleB = (b.title || "").toLowerCase();
            if (titleA < titleB) return -1;
            if (titleA > titleB) return 1;
            return 0;
        });
    }
    renderSongs(filtered);
}

function editSong(docId) {
    let song = allSongs.find(s => s.docId === docId);
    if (!song) return;

    $("#editSongDocId").val(song.docId);
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
        <label class="form-label mb-1 fw-bold">Slide Content</label>
        <textarea class="form-control slide-content-field" rows="5">${unescaped}</textarea>
    </div>`;
    $("#slides-container").append(slideHtml);
}

function saveSong() {
    let docId = $("#editSongDocId").val();
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
        title: title,
        slides: slides,
        updatedAt: new Date().toISOString()
    };

    if (!docId) {
        // New song
        payload.createdAt = new Date().toISOString();
        dbFirestore.collection("songs").add(payload)
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
        dbFirestore.collection("songs").doc(docId).update({
            deleted: true,
            deletedAt: new Date().toISOString()
        }).then(() => {
            toast("Song deleted (Soft delete)!");
        }).catch((err) => {
            console.error(err);
            toast("Error deleting song.");
        });
    }
}

function restoreSong(docId) {
    dbFirestore.collection("songs").doc(docId).update({
        deleted: firebase.firestore.FieldValue.delete(),
        deletedAt: firebase.firestore.FieldValue.delete()
    }).then(() => {
        toast("Song restored successfully!");
    }).catch((err) => {
        console.error(err);
        toast("Error restoring song.");
    });
}

function toast(tex) {
    $('#toastBody').text(tex);
    var toastBox = new bootstrap.Toast(document.getElementById('myToast'));
    toastBox.show();
}

