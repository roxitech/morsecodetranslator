(function(){

/*
Words Per Minute (WPM) based on the word CODEX.
Accurate WPM speeds cause the dreaded [oscillator click on stop]. 
Round up or down one decimal place for sound smoothness!

Accurate speeds:
    10 codex wpm = 0.092
    15 codex wpm = 0.062
    20 codex wpm = 0.047
    25 codex wpm = 0.038
Rounded speeds:
    10 codex wpm = 0.09
    15 codex wpm = 0.06
    20 codex wpm = 0.05
    25 codex wpm = 0.04
*/

    /* Morse Code Generator & Translator (Echo version)- Kurt Grigg 2003 (Updated for sound and CSS3) */

    var d = document;
    d.write('<div class="Mcontainer">'
    +'<div class="Mtitle">Morse Code Generator Translator</div>'
    +'<textarea id="txt_in" class="Mtxtarea"></textarea>'
    +'<div class="Mtxtareatitle">Input</div>'
    +'<textarea id="txt_out" class="Mtxtarea" style="top: 131px;"></textarea>'
    +'<div class="Mtxtareatitle" style="top: 172px;">Output</div>'
    +'<div class="Mbuttonwrap">'
    +'<input type="button" class="Mbuttons" id="how" value="!">'
    +'<input type="button" class="Mbuttons" id="tra" value="translate">'
    +'<input type="button" class="Mbuttons" id="ply" value="play">'
    +'<input type="button" class="Mbuttons" id="pau" value="pause">'
    +'<input type="button" class="Mbuttons" id="res" value="reset"></div>'
    +'<select id="select" class="Mselect">' 

    +'<option value=0.09>10 wpm</option>'
    +'<option value=0.06 selected="selected">15 wpm</option>'
    +'<option value=0.05>20 wpm</option>'
    +'<option value=0.04>25 wpm</option>'

    +'</select>'
    +'<div class="sliderWrap">volume <input id="volume" type="range" min="0" max="1" step="0.01" value="0.05"/></div>'
    +'<div class="Mchckboxwrap">'
    +'<span style="text-align: right;">separator <input type="checkbox" id="slash" class="Mchckbox"></span>'
    +'</div>'
    +'<div id="about" class="Minfo">'
    +'<b>Input morse</b><br>'
    +'<ul class="Mul"><li>Enter morse into input box using full stop (period) and minus sign (hyphen)</li>'
    +'<li>Morse letters must be separated by 1 space</li>'
    +'<li>Morse words must be separated by 3 or more spaces</li>'
    +'<li>You can use / to separate morse words. There must be at least 1 space before and after each separator used</li>'
    +'</ul>'
    +'<b>Input text</b><br>'
    +'<ul class="Mul"><li>Enter text into input box</li>'
    +'<li>Characters that cannot be translated will be ignored</li>'
    +'<li>If morse and text is entered, the converter will assume morse mode</li></ul>'
    +'<input type="button" value="close" id="clo" class="Mbuttons">'
    +'</div><div id="mdl" class="modal"><div id="bdy"><div id="modalMsg">A MSG</div><input type="button" value="close" id="cls" class="Mbuttons"></div></div></div>');

    var ftmp = d.getElementById('mdl');
    var del;

    d.getElementById('tra').addEventListener("click", function(){convertToAndFromMorse(txtIn.value);},false);
    d.getElementById('ply').addEventListener("click", function(){CancelIfPlaying();},false);
    d.getElementById('pau').addEventListener("click", function(){stp();},false);
    d.getElementById('res').addEventListener("click", function(){Rst();txtIn.value = '';txtOt.value = '';},false);

    d.getElementById('how').addEventListener("click", function(){msgSelect();},false);
    d.getElementById('clo').addEventListener("click", function(){fadeOut();},false);

    d.getElementById('cls').addEventListener("click", function(){fadeOut();},false);
    d.getElementById('bdy').addEventListener("click", function(){errorSelect();},false);

    var wpm = d.getElementById('select');
    wpm.addEventListener("click", function(){wpMin()},false);

    var inc = 0;
    var playing = false; 
    var txtIn = d.getElementById('txt_in');
    var txtOt = d.getElementById('txt_out');
    var paused = false;
    var allowed = ['-','.',' '];
    var aud;
    var tmp = (window.AudioContext || window.webkitAudioContext)?true:false;
    if (tmp) {
        aud = new (window.AudioContext || window.webkitAudioContext)();
    }
    var incr = 0;
    var speed = parseFloat(wpm.options[wpm.selectedIndex].value);
    var char = [];
    var alphabet = [["A",".-"],["B","-..."],["C","-.-."],["D","-.."],["E","."],["F","..-."],["G","--."],["H","...."],["I",".."],["J",".---"],
        ["K","-.-"],["L",".-.."],["M","--"],["N","-."],["O","---"],["P",".--."],["Q","--.-"],["R",".-."],["S","..."],["T","-"],["U","..-"],
        ["V","...-"],["W",".--"],["X","-..-"],["Y","-.--"],["Z","--.."],["1",".----"],["2","..---"],["3","...--"],["4","....-"],["5","....."],
        ["6","-...."],["7","--..."],["8","---.."],["9","----."],["0","-----"],[".",".-.-.-"],[",","--..--"],["?","..--.."],["'",".----."],["!","-.-.--"],
        ["/","-..-."],[":","---..."],[";","-.-.-."],["=","-...-"],["-","-....-"],["_","..--.-"],["\"",".-..-."],["@",".--.-."],["(","-.--.-"],[" ",""]];

    function errorSelect() {
        txtIn.focus();
    }

    function modalSwap(msg) {
        d.getElementById('modalMsg').innerHTML = msg;
    }

    function msgSelect() {
        ftmp = d.getElementById('about');
        fadeIn(); 
    }

    function fadeIn() {
        ftmp.removeEventListener("transitionend", freset);
        ftmp.style.display = "block";
        del = setTimeout(doFadeIn,100);
    }

    function doFadeIn() {
        clearTimeout(del);
        ftmp.style.transition = "opacity 0.5s linear";
        ftmp.style.opacity = "1";
    }

    function fadeOut() {
        ftmp.style.transition = "opacity 0.8s linear";
        ftmp.style.opacity = "0";
        ftmp.addEventListener("transitionend",freset , false);
    }

    function freset() {
        ftmp.style.display = "none";
        ftmp.style.transition = "";
        ftmp = d.getElementById('mdl');
    }

    function stp() {
        paused = true;
    }

    function wpMin() {
        speed = parseFloat(wpm.options[wpm.selectedIndex].value);
    }

    function Rst(){ 
        char = [];
        inc = 0;
        playing = false;
        paused = false;
    }

    function CancelIfPlaying(){
        if (window.AudioContext || window.webkitAudioContext) {paused = false;
            if (!playing) { 
                IsReadyToHear();
            }
            else {
                return false;
            }
        }
        else {
            modalSwap("<p>Your browser doesn't support Web Audio API</p>");
            fadeIn();
            return false;
        }
    }

    function IsReadyToHear(x){
        if (txtIn.value == "" || /^\s+$/.test(txtIn.value)) {
            modalSwap('<p>Nothing to play, enter morse or text first</p>');
            fadeIn();
            txtIn.value = '';
            return false;
        }
        else if (char.length < 1 && (x != "" || !/^\s+$/.test(txtIn.value)) && txtIn.value.length > 0) {
            modalSwap('<p>Click Translate button first . . .</p>');
            fadeIn();
            return false;
        }
        else{
            playMorse();
        }
    }

    function convertToAndFromMorse(x){
        var swap = [];
        var outPut = "";
        x = x.toUpperCase();

        /* Is input empty or all whitespace? */
        if (x == '' || /^\s+$/.test(x)) {
            modalSwap("<p>Nothing to translate, enter morse or text</p>");
            fadeIn();
            txtIn.value = '';
            return false;
        }

        /* Remove front & end whitespace */
        x = x.replace(/\s+$|^\s*/gi, ''); 
        txtIn.value = x;
        txtOt.value = "";

        var isMorse = (/(\.|\-)\.|(\.|\-)\-/i.test(x));// Good enough.

        if (!isMorse){
            for (var i = 0; i < alphabet.length; i++){
                swap[i] = [];
                for (var j = 0; j < 2; j++){
                    swap[i][j] = alphabet[i][j].replace(/\-/gi, '\\-');
                }
            }
        }

        var swtch1 = (isMorse) ? allowed : swap;
        var tst = new RegExp( '[^' + swtch1.join('') + ']', 'g' ); 
        var swtch2 = (isMorse)?' ':'';
        x = x.replace( tst, swtch2);  //remove unwanted chars.
        x = x.split(swtch2); 

        if (isMorse) {
            var tidy = [];
            for (var i = 0; i < x.length; i++){
                if ((x[i] != '') || x[i+1] == '' && x[i+2] != '') {
                    tidy.push(x[i]);
                }
            }
        }

        var swtch3 = (isMorse) ? tidy : x;

        for (var j = 0; j < swtch3.length; j++) {
            for (var i = 0; i < alphabet.length; i++){
                if (isMorse) {
                    if (tidy[j] == alphabet[i][1]) {
                        outPut += alphabet[i][0];
                    } 
                } 
                else {
                    if (x[j] == alphabet[i][0]) {
                        outPut += alphabet[i][1] + ((j < x.length-1)?"  ":"");
                    }
                }
            }
        }

        if (!isMorse) {
            var wordDivide = (d.getElementById('slash').checked)?"  /  ":"     ";
            outPut = outPut.replace(/\s{3,}/gi, wordDivide);
        }

        if (outPut.length < 1) {
            alert('Enter valid text or morse...');
            txtIn.value = '';
        }
        else {
            txtOt.value = outPut;
        }

        var justMorse = (!isMorse) ? outPut : tidy;

        FormatForSound(justMorse);
    }

    function FormatForSound(s){
        var n = [];
        var b = '';
        if (typeof s == 'object') {
            for (var i = 0; i < s.length; ++i) {
                var f = (i == s.length-1)?'':'  ';
                var t = b += (s[i] + f);
            }
        }
        var c = (typeof s == 'object')? t : s;
        c = c.replace(/\//gi, '');
        c = c.replace(/\s{1,3}/gi, '4');
        c = c.replace(/\./gi, '03');
        c = c.replace(/\-/gi, '13');  
        c = c.split('');
        for (var i = 0; i < c.length; i++) {
            n.push(c[i]);
        }
        char = n;
    }

    function vlm() {
        return document.getElementById('volume').value;
    }

    function playMorse() {

        if (paused){ 
            playing = false;
            return false;
        }

        playing = true;
        if (incr >= char.length) {
            incr = 0;
            playing = false;
            paused = false;
            return false;
        }

        var c = char[incr];
        var freq = 650;
        var volume = (c < 2) ? vlm() : 0 ;
        var flen = (c == 0 || c == 3) ? speed : speed * 3;
        
        var osc = aud.createOscillator();
        osc.type = 'sine'; 
        osc.frequency.value = freq;

        var output = aud.createGain();
        var delay = aud.createDelay();
        var feedback = aud.createGain();
        var wetLevel = aud.createGain();
            delay.delayTime.value = 0.15; 
            feedback.gain.value = 0.25;
            wetLevel.gain.value = 0.25;

        osc.connect(delay);
        osc.connect(output);
        delay.connect(feedback);
        delay.connect(wetLevel);
        feedback.connect(delay);
        wetLevel.connect(output);

        output.gain.value = volume;
        output.connect(aud.destination);

        var now = aud.currentTime;

	osc.start(now);

            /*
            Sharp volume fade to stop harsh clicks if wave is stopped 
            at a point other than the (natural zero crossing point) 
            */
            output.gain.setValueAtTime(volume, now + (flen*0.8));
            output.gain.linearRampToValueAtTime(0.001, now + (flen*0.9999));


        osc.stop(aud.currentTime + flen);

        osc.onended = function() {
            incr++;
            playMorse();
        }
    }
})();