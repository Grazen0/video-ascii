# video-ascii

A cool terminal app that converts videos into ASCII text and reproduces them.

![Example](https://github.com/ElCholoGamer/video-ascii/blob/master/example.gif?raw=true)

## Installation

The package must be installed globally to work:

```bash
$ npm i -g video-ascii # npm
$ yarn global add video-ascii # yarn
```

## How does it work?

First, use the `convert` command on a .mp4 file:

```bash
$ vii convert my_video.mp4
```

This will create a file called `my_video.vii` on the same directory.

Next, use the `play` command to reproduce the .vii file:

```bash
$ vii play my_video.mp4
```
