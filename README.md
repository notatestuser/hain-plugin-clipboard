# hain-plugin-clipboard
> Restore clipboard history in Windows like in Alfred for Mac OS!

![](https://img.shields.io/npm/v/hain-plugin-clipboard.svg) ![](https://img.shields.io/npm/dm/hain-plugin-clipboard.svg)

![Preview!](https://cloud.githubusercontent.com/assets/1255926/15283851/240ff918-1b80-11e6-9910-9f20db21deb3.png)

## Installation

[Install](https://github.com/appetizermonster/hain/releases) and open [Hain](https://github.com/appetizermonster/hain) (alt+space), then type this command: 
```
/hpm install hain-plugin-clipboard
```

## How it works

This plugin polls the clipboard every few seconds to look for changes in clipboard content.
If the current clipboard content is not present in the clipboard history it's added to the list that appears when you type `/clipboard`.

## Limitations

A maximum of 30 entries are saved in order to conserve memory usage.

This limit will be soon be configurable in the preferences pane!

## Future work

- Support unicode
- Support replaying rich text and/or images
- Add preferences
- Allow clearing by time range (5 mins, 1 hour, 1 day, ...)
