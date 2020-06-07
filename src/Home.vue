<template>
  <div>
    <h2>
      <i class="las la-home"></i>Live.CHAT
    </h2>

    <div class="form-group has-success">
      <label class="form-label" for="input-example-1">User</label>
      <input class="form-input" type="text" placeholder="User" v-model="userid">
      <p class="form-input-hint" v-if="(!userid)">User cannot be blank</p>
    </div>

    <div class="form-group has-success">
      <label class="form-label" for="input-example-1">Room</label>
      <input class="form-input" type="text" placeholder="Room" v-model="roomid">
      <p class="form-input-hint" v-if="(!roomid)">Room cannot be blank</p>
    </div>

    <button @click="call()" class="btn btn-primary">
      <i class="las la-phone-volume"></i>Chat
    </button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      userid: "",
      roomid: "ekb123"
    };
  },
  methods: {
    call() {
      if (!this.userid || !this.userid) return;
      this.$router.push({
        path: `/call/${this.roomid}/${this.userid}`
      });
    }
  }
};
</script>
