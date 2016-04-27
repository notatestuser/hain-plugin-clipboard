(function(){

'use strict';

module.exports = (context) => {
    const app = context.app;
    const toast = context.toast;
    const logger = context.logger;
    const ncp = require('copy-paste');

    const clips = [];
    const maxClips = 30;
    const pollInterval = 3000;
    const clipDisplayChars = 100;

    function startup() {
        var lastClip = null;
        var saveClipFn;
        setInterval(saveClipFn = () => {
            ncp.paste((err, clip) => {
                if (err) return;
                if (typeof clip !== 'string'
                        || ! clip.length
                        || lastClip === clip) {
                    return;
                }
                clip = clip.toString();
                if (typeof clip !== 'string') return;
                clips.unshift(lastClip = clip);
                if (clips.length > maxClips) {
                    clips.pop();
                }
            });
        }, pollInterval);
        saveClipFn();
    }

    function search(query, res) {
        logger.log(`Clips: ${clips}`);
        res.add([{
            id: 'clear',
            payload: 'clear',
            title: 'Clear this list',
            desc: ''
        }].concat(clips.map((clip, idx) => {
            let sub = clip.substr(0, clipDisplayChars);
            if (clipDisplayChars === sub.length) {
                sub += '...';
            }
            return {
                id: idx,
                payload: '',
                title: sub.replace(/\n/g, ''),
                icon: '#fa fa-clipboard',
                desc: `Copy to clipboard (${clip.length} characters)`
            };
        })));
    }

    function execute(id, payload) {
        var closeTimeout = 0;
        if (payload === 'clear') {
            clips.length = 0;
            toast.enqueue('Clipboard history cleared!');
            closeTimeout = 1000;
        } else {
            ncp.copy(clips[id]);
        }
        setTimeout(() => {
            app.close();
        }, closeTimeout);
    }

    return { startup, search, execute };
};

})();
