<template>

<div>
  <h1>Custom Unit Creator</h1>
  <body>
    <div class="wrapper">
      <div class="box a input_block">
        <div class="input_item">
          Unit Label:
          <input type="text" name="unittype" id="unitTypeId" class="text_input_field">
        </div>
        <div class="input_item">
          Attack Factor:
          <input
            id="attackFactorId"
            type="number"
            name="attackfactor"
            value="1"
            min="0"
            class="numeric_input_field"
          >
        </div>
        <div class="input_item">
          Defense Factor:
          <input
            id="defenseFactorId"
            type="number"
            name="defensefactor"
            value="1"
            min="0"
            class="numeric_input_field"
          >
        </div>
        <div class="input_item">
          Movement Factor:
          <input
            id="movementFactorId"
            type="number"
            name="movementfactor"
            value="1"
            min="1"
            class="numeric_input_field"
          >
        </div>
        <div class="input_item">
          Range:
          <input
            id="rangeId"
            type="number"
            name="range"
            value="2"
            min="1"
            class="numeric_input_field"
          >
        </div>
        <div class="input_item">
          Era:
          <select id="unit_era" class="text_input_field">
            <option value="Pre-Historic">Ancient</option>
            <option value="Classical">Classical</option>
            <option value="Medieval">Medieval</option>
            <option value="Industrial">Industrial</option>
            <option value="Early Modern">Early Modern</option>
            <option value="Modern">Modern</option>
            <option value="Post-Modern 1">Post-Modern 1</option>
            <option value="Post-Modern 2">Post-Modern 2</option>
            <option value="Post-Modern 3">Post-Modern 3</option>
          </select>
        </div>
        <div class="input_item">
          Zone-of-Control:
          <select id="zone-of-control" class="text_input_field">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div class="input_item">
          Splittable:
          <select id="splittableId" class="text_input_field">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div class="input_item">
          Unit Type:
          <select id="unit_role" class="text_input_field">
            <option value="leader">Leader</option>
            <option value="combat_unit">Combat Unit</option>
            <option value="supply_unit">Supply Unit</option>
            <option value="fixed_unit">Fixed Unit</option>
          </select>
        </div>
        <div class="input_item">
          Unit Shape:
          <select id="unit_shape" class="text_input_field">
            <option value="square">Square</option>
            <option value="circle">Circle</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
      </div>
      <div class="box c input_block">
        <div>
          <input
            type="button"
            id="imageChooserMask"
            value="Select Unit Badge"
            onclick="document.getElementById('image_chooser').click();"
          >
        </div>
        <input
          type="file"
          id="image_chooser"
          ref="myFiles"
          accept="image/png"
          v-on:change="readURL"
          style="display:none"
        >
        <div class="badge_display">
          <img :src="src" id="img" width="75px">
        </div>
      </div>
      <div class="box b input_block">
          <img :src="src" id="img" width="150px">
      </div>
      <div class="box d">
        <div class="block">
          <input
            value="Create Unit"
            type="button"
            name="splittable"
            id="splittableId"
            v-on:click="doCreate"
          >
        </div>
      </div>
    </div>
  </body>
</div>
</template>


<script>
import { createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from '../../game-js/GeneralUtilities.js'

export default {
  name: "UnitAuthor",
  props: {
    msg: String,
    movementFactorId: Number
  },
  data: function() {
    return { src: "" };
  },
  methods: {
    doCreate: function(){
      createUnit();
    },
    readURL: function(event) {
      console.log("readURL");
      console.log(event.target);
      console.log(event);
      console.log(document);
      console.log(document.files);
      console.log(this);
      console.log(this.$refs);
      this.files = this.$refs.myFiles.files;
      console.log(this.files);

      if (this.files && this.files[0]) {
        console.log("PreReader");

        var reader = new FileReader();
        let self = this;
        reader.onload = function(e) {
          console.log("On Load");
          console.log(self);
          self.src = e.target.result;
          //self.product.image = e.target.result;

          /*$("#sel_image")
            .attr("src", e.target.result)
            .width(75)
            .height(75);*/
        };

        reader.readAsDataURL(this.files[0]);
      }
      console.log("End readURL");
      }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: olivedrab;
  text-align: center;
  font-size: 50px;
}
body {
  background: linear-gradient(to bottom, rgb(43, 148, 116), #999);
  background-attachment: fixed;
}
.input_block {
  display: inline-block;
  padding: 5%;
  width: 455px;
  background-color: rgba(251, 255, 0, 0.678);
  border: thin solid black;
}
.input_layout {
  display: inline-block;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
}
.text_input_field {
  float: right;
  text-align: left;
  width: 100px;
  background-color: rgb(235, 219, 219);
}
.numeric_input_field {
  float: right;
  text-align: center;
  width: 50px;
  background-color: rgb(235, 219, 219);
}
.input_item {
  margin-bottom: 10px;
  margin-top: 10px;
  text-align: left;
}
.badge_selector {
  text-align: center;
}
.badge_display {
  margin-top: 10px;
  display: inline-block;
  margin-left: 85px;
}
.create_unit {
  text-align: center;
  display: inline-block;
  margin-left: 50px;
  align-self: center;
  padding: 1%;
  border: thin solid black;
}
.badge_preview {
  border: thin solid black;
  width: 250px;
  height: 100px;
  margin-top: 5px;
  padding: 5%;
  margin-left: 5px;
}
.wrapper {
  display: grid;
  grid-gap: 010px;
  grid-template-columns: 100px, 100px, 100px;
  background-color: rgb(36, 138, 151);
  color: rgb(166, 199, 197);
}
.box {
  background-color: rgba(104, 108, 158, 0.582);
  color: rgb(255, 255, 255);
  border-radius: 5px;
  padding: 20px;
  font-size: 150%;
}
.a {
  grid-column: 1 / span 2;
}
.b {
  grid-column: 3;
  grid-row: 1 / span 2;
}
.c {
  grid-column: 1 / span 2;
  grid-row: 2;
}
.d {
  grid-column: 1 / span 3;
  grid-row: 3;
}
.block {
  display: block;
  width: 100%;
  text-align: center;
  border: none;
}
</style>
