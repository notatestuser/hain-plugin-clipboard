'use strict';

(function(){

const ncp = require('copy-paste');
const ago = require('s-ago');
const eskape = require('eskape');

const MAX_CLIPS = 30;
const POLL_INTERVAL_MS = 3000;
const CLIP_DISPLAY_MAX_CHARS = 100;
const PREVIEW_HTML = (text) => eskape`
    <!doctype html>
    <html>
    <head>
        <style type="text/css">
            body, div, span, a, pre {
                font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Arial, '돋움', sans-serif;
                font-size: 10pt;
                line-height: 155%;
                color: #333;
                white-space: pre-wrap;
            }
        </style>
    </head>
    <body><pre>${text}</pre></body>
    </html>`;

module.exports = (context) => {
    const app = context.app;
    const toast = context.toast;
    const matchutil = context.matchutil;

    const clips = [];

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
                if (clips.length > MAX_CLIPS) {
                    clips.pop();
                }
            });
        }, POLL_INTERVAL_MS);
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
            let title, isTrimmed;
            if (clip.elem) {
                // fuzzy match
                const trimmed = clip.elem.content.trim().substr(0, CLIP_DISPLAY_MAX_CHARS);
                if (CLIP_DISPLAY_MAX_CHARS === trimmed.length) {
                    title = trimmed;  // no bold - it looks strange when trimmed
                } else {
                    title = matchutil.makeStringBoldHtml(trimmed, clip.matches);
                }
                idx = clips.indexOf(clip = clip.elem);
            } else {
                // normal result
                title = clip.content.substr(0, CLIP_DISPLAY_MAX_CHARS);
            }
            isTrimmed = CLIP_DISPLAY_MAX_CHARS === title.length;

            // TODO: remove hack to escape html but keep bolds
            title = title.replace(/<b>/gi, '%%B%%');
            title = title.replace(/<\/b>/gi, '%%EB%%');
            title = title.replace(/</g, '&lt;');
            title = title.replace(/%%B%%/g, '<b>');
            title = title.replace(/%%EB%%/g, '</b>');

            if (isTrimmed) {
                title += '...';
            }
            return {
                id: idx,
                payload: '',
                title: title.replace(/[\r\n]/g, ''),
                icon: '#fa fa-clipboard',
                desc: `Copy to clipboard (${abbr(clip.size)} characters, ${ago(clip.time)})`,
                preview: isTrimmed
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

    function renderPreview(id, payload, render) {
        if (payload.length) return;
        render(PREVIEW_HTML(clips[id].content));
    }

    return { startup, search, execute, renderPreview };
};

})();
