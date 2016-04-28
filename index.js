'use strict';

(function(){

module.exports = (context) => {
    const app = context.app;
    const toast = context.toast;
    const matchutil = context.matchutil;

    const ncp = require('copy-paste');
    const ago = require('s-ago');

    const clips = [];
    const maxClips = 30;
    const pollInterval = 3000;
    const clipDisplayChars = 100;

    function abbr(num) {
        if (num >= 1000000) {
            return `${num/1000000}m`;
        } else if (num >= 1000) {
            return `${num/1000}k`;
        } else {
            return num;
        }
    }

    function startup() {
        var lastClip = null;
        var saveClipFn;
        setInterval(saveClipFn = () => {
            ncp.paste((err, clip) => {
                if (err) return;
                if (typeof clip !== 'string'
                        || ! clip.trim().length
                        || lastClip === clip) {
                    return;
                }
                clip = clip.toString();
                clips.unshift({
                    content: lastClip = clip,
                    size: clip.length,
                    time: new Date()
                });
                if (clips.length > maxClips) {
                    clips.pop();
                }
            });
        }, pollInterval);
        saveClipFn();
    }

    function search(query, res) {
        const querytrim = query.replace(' ', '');
        let results;
        if (querytrim.length) {
            results = matchutil.fuzzy(clips, querytrim, x => x.content);
        } else {
            results = clips;
            res.add([{
                id: 'clear',
                payload: 'clear',
                title: 'Clear this list',
                icon: '#fa fa-trash',
                desc: ''
            }]);
        }
        res.add(results.map((clip, idx) => {
            let title;
            if (clip.elem) {
                // fuzzy match
                title = matchutil.makeStringBoldHtml(clip.elem.content, clip.matches);
                idx = clips.indexOf(clip = clip.elem);
            } else {
                // normal result
                title = clip.content;
            }
            title = title.substr(0, clipDisplayChars);
            if (clipDisplayChars === title.length) {
                title += '...';
            }
            return {
                id: idx,
                payload: '',
                title: title.replace(/\n/g, ''),
                icon: '#fa fa-clipboard',
                desc: `Copy to clipboard (${abbr(clip.size)} characters, ${ago(clip.time)})`
            };
        }));
    }

    function execute(id, payload) {
        if (payload === 'clear') {
            clips.length = 0;
            toast.enqueue('Clipboard history cleared!');
            setTimeout(() => {
                app.close();
            }, 1000);
        } else {
            ncp.copy(clips[id].content, () => {
                app.close();
            });
        }
    }

    return { startup, search, execute };
};

})();
