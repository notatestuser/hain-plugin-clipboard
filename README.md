# hain-plugin-clipboard
Restore clipboard history in hain (just like in Alfred for Mac OS X!)

## Installation

Open [hain](https://github.com/appetizermonster/hain) (alt+space), type this command: 
```
/hpm install hain-plugin-clipboard
```

## How it works

This plugin polls the clipboard every few seconds to look for changes in clipboard content.
If the current clipboard content is not present in the clipboard history it's added to the list that appears when you type `/clipboard`.

## Limitations

A maximum of 32 entries are saved in order to conserve memory usage.
This limit will be soon be configurable in the preferences pane!
