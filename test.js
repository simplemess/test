// Press the play button if stream is not playing handle exception for when it's not present
try {
    var playButton = document.body.getElementsByClassName('wbp-play')[0];
    playButton.click();
    alert('trying to click play button');
}catch(error){
    alert('no play button')
    fullscreen()
}
alert('calling fullscreen')
fullscreen()

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector) && document.body.getElementsByTagName('iframe').length > 5) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector) && document.body.getElementsByTagName('iframe').length > 5) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function executeAsync(func) {
    setTimeout(func, 10000);
}

function requestFull(){
    waitForElm('iframe').then((elm) => {
        var streamFrame = document.body.getElementsByTagName('iframe')[0]
        streamFrame.requestFullscreen()
        streamFrame.click()
        alert('entering fullscreen')
    });
}

// Go into fullscreen
function fullscreen(){
    executeAsync(requestFull())
}
