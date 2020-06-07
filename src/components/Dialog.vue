<template>
  <div>
    <div class="modal" :class="{active: isActive}" id="modal-id">
      <!-- <a href="#close" class="modal-overlay"  aria-label="Close"></a> -->
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title h5"></div>
        </div>
        <div class="modal-body">
          <div class="content">
            <div>{{message}}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="onClose" @click="onClose()" class="btn btn-primary">Cancel</button>
          <button v-if="onOk" @click="onOk()" class="btn btn-primary">Ok</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  //props: ["isActive", "message", "onClose","onOk"],
  data() {
    return {
      isActive: false,
      message: "",
      onClose: {},
      onOk: {}
    };
  }
};
</script>
