var audio = new Audio();
var TypeSelect;
var SoundSelect;
var ComposerRows;
var Composer;
var FileInput;
var RealIndex;
var CompositionLength = 99;
var SelectedSegment;
var SegmentLength = 80;
var ComposerRowLength = (CompositionLength + 1) * SegmentLength;
var SelTrack = 0;
var SelId = 0;
var Clpbrd = "-";
var Stop = false;
var animStyle = " 1s infinite alternate";
var globalFileName = "My song"

function Setup() {
    TypeSelect = document.getElementById("type-select");
    SoundSelect = document.getElementById("sound-select");
    ComposerRows = document.getElementsByClassName("composer-row");
    SelectedSegment = document.getElementById("selected-segment");
    FileInput = document.getElementById("file-load");
    Composer = document.getElementById("composer");
    RealIndex = document.getElementById("real-index");

    FileInput.addEventListener("change", function () {
        var fr = new FileReader();
        fr.onload = function () {
            var readresult = fr.result;
            LoadFile(readresult);
        }

        fr.readAsText(this.files[0]);

    })
}

function PlaySound(input) {
    audio = new Audio(input);
    audio.play();
}

async function Play() {
    PlayerStop();
    SetEnabledControls(true);
    Stop = false;
    for (var i = 0; i <= CompositionLength; i++) {
        UpdateTracks();
        for (var y = 0; y < ComposerRows.length; y++) {
            if (Stop) {
                return;
            }
            SegmentAt(y, i).style.animation = "playhead" + animStyle;
            if (SegmentAt(y, i).innerText != "-") {
                var notearray = SegmentAt(y, i).innerText.split(",");
                var selvalue = parseInt(notearray[0]) * 8 + parseInt(notearray[1]);
                var path = "parts/" + y + "/" + selvalue + ".mp3";
                PlaySound(path);
            }
        }
        await sleep(3000);
    }
}

function TestSound() {
    if (SoundSelect.value != "none") {
        audio.pause();
        var selvalue = parseInt(TypeSelect.value) * 8 + parseInt(SoundSelect.value);
        var path = "parts/" + SelTrack + "/" + selvalue + ".mp3";
        PlaySound(path);
    }
}

function InitializeDocument() {
    for (var i = 0; i < ComposerRows.length; i++) {
        ComposerRows[i].style.width = ComposerRowLength + "px";
        for (var y = 0; y <= CompositionLength; y++) {
            const NewSegment = document.createElement("div");
            NewSegment.className = "segment";
            NewSegment.name = i + "," + y;
            NewSegment.onclick = function () { SelectSegment(event) };
            NewSegment.innerText = "-";
            ComposerRows[i].appendChild(NewSegment);
        }
    }
    TypeSelect.selectedIndex = 0;
    SoundSelect.selectedIndex = 0;
    UpdateTracks();
}

function SelectTrack(index) {
    PlayerStop();
    SelTrack = index;
    LoadTrackInfo();
    UpdateTracks();
}

function UpdateTracks() {
    for (var i = 0; i < ComposerRows.length; i++) {
        for (var y = 0; y <= CompositionLength; y++) {
            if (i == SelTrack && y == SelId) {
                SegmentAt(i, y).style.animation = "selected" + animStyle;
            } else {
                SegmentAt(i, y).style.animation = "none";
            }
        }
    }
    if (SoundSelect.value == "none") {
        SegmentAt(SelTrack, SelId).innerText = "-";
    } else {
        SegmentAt(SelTrack, SelId).innerText = TypeSelect.value + "," + SoundSelect.value;
    }
}

function SelectSegment(e) {
    SetEnabledControls(false);
    Stop = true;
    var sender = e.srcElement;
    var track = sender.name.split(",")[0];
    var id = sender.name.split(",")[1];
    SelTrack = track;
    SelId = id;
    LoadTrackInfo();
    UpdateTracks();
}

function LoadTrackInfo() {
    if (SegmentAt(SelTrack, SelId).innerText == "-") {
        TypeSelect.selectedIndex = 0;
        SoundSelect.selectedIndex = 0;
    } else {
        TypeSelect.value = SegmentAt(SelTrack, SelId).innerText.split(",")[0];
        SoundSelect.value = SegmentAt(SelTrack, SelId).innerText.split(",")[1];
    }
}

function PlayerStop() {
    Stop = true;
    SetEnabledControls(false);
    UpdateTracks();
}

function SaveAs() {
    var file = "";
    for (var i = 0; i < ComposerRows.length; i++) {
        for (var y = 0; y <= CompositionLength; y++) {
            file += SegmentAt(i, y).innerText + "&";
        }
        file += "\n";
    }
    Download(file, globalFileName, "")
}

function SegmentAt(i, y) {
    return ComposerRows[i].getElementsByClassName("segment")[y]
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function LoadFile(file) {
    for (var i = 0; i < ComposerRows.length; i++) {
        for (var y = 0; y <= CompositionLength; y++) {
            SegmentAt(i, y).innerText = file.split("\n")[i].split("&")[y];
        }
    }
    if (SegmentAt(SelTrack, SelId).innerText == "-") {
        TypeSelect.selectedIndex = 0;
        SoundSelect.selectedIndex = 0;
    } else {
        TypeSelect.value = SegmentAt(SelTrack, SelId).innerText.split(",")[0];
        SoundSelect.value = SegmentAt(SelTrack, SelId).innerText.split(",")[1];
    }
    PlayerStop();
}

function Clear() {
    SegmentAt(SelTrack, SelId).innerText = "-";
    LoadTrackInfo();
}

window.addEventListener("load", function () {
    Setup();
    InitializeDocument();
});

function Download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob)
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function ClpbrdMng(action) {
    if (action == "copy") {
        Clpbrd = SegmentAt(SelTrack, SelId).innerText;
    } else {
        SegmentAt(SelTrack, SelId).innerText = Clpbrd;
    }
    if (SegmentAt(SelTrack, SelId).innerText != "-") {
        TypeSelect.value = SegmentAt(SelTrack, SelId).innerText.split(",")[0];
        SoundSelect.value = SegmentAt(SelTrack, SelId).innerText.split(",")[1];
    }
}

function SetEnabledControls(status) {
    var controls = document.getElementsByClassName("to-be-disabled");
    for (var i = 0; i < controls.length; i++) {
        controls[i].disabled = status;
    }
}