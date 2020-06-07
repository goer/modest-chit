class VideoList {
  constructor() {
    this.listVideo = [];
  }

  addVideo(video) {
    var index = this.listVideo.indexOf(video);
    if (index >= 0) return false;
    console.log("addVideo", video);
    this.listVideo.push(video);
    return true;
  }

  moveVideo(from, to) {
    // remove `from` item and store it
    var f = this.listVideo.splice(from, 1)[0];
    // insert stored item into position `to`
    this.listVideo.splice(to, 0, f);
  }

  attachedToMainScreen(index) {
    var x = this.listVideo.splice(index, 1)[0];
    console.log("x", x);
    this.listVideo.unshift(x);
  }

  getMainScreen() {
    return this.listVideo[0];
  }

  getListVideo() {
    var x = [];
    for (var i = 1; i < this.listVideo.length; i++) {
      x.push(this.listVideo[i]);
    }
    return x;
  }

  show() {
    console.log("main screen", this.getMainScreen());
    console.log("list", this.getListVideo());
  }

  chooseValue(value) {
    var index = this.listVideo.indexOf(value);
    this.moveVideo(index, 0);
  }

  removeValue(value) {
    var index = this.listVideo.indexOf(value);
    console.log("index", index);
    if (index !== -1) this.listVideo.splice(index, 1);
  }
}

export default VideoList;
