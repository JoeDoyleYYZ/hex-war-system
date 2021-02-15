<template>
  <div>
    <div class="home">
      <h1>
        <span class="title1">Cry Havoc</span>
        &nbsp;
        <span class="title2">Battle System</span>
      </h1>
      <img class="logo" src="../assets/images/CryHavoc.png" aria-hidden="true" />
    </div>
    <div class="get-started">
      <a href>Get Started...</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  props: {
    msg: String
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home {
  text-align: center;
}
.logo {
  height: 300px;
}
.get-started {
  font-size: 30px;
  text-align: center;
}
a {
  color: olivedrab;
}
.title1 {
  font-size: 50px;
  font-style: italic;
  color: olivedrab;
}
.title2 {
  font-size: 50px;
  color: olivedrab;
}
</style>
