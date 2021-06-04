<template>
  <div id="app" :style="headerStyle">
    <Navbar/>
    <div class="content">
      <router-view/>
    </div>
  </div>
</template>

<script>
  import Navbar from "./components/ui/Navbar";
  export default {
    components: {Navbar},
    created() {
      this.$store.dispatch('checkIsAuthenticated');
    },
    props: {
      header: {
        type: String,
        default: require("@/assets/leaf.jpg")
      }
    },
    computed: {
      headerStyle() {
        return {
          backgroundImage: `url(${this.header})`
        };
      }
    }
  }
</script>

<style>
  @import './assets/styles/variables.css';

  html, body {
    height:100%;
    background-color: white !important;
    min-width: 320px !important;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 2px grey;
    border-radius: 5px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #696969;
    border-radius: 5px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #696969;
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 1.25rem;
    background: rgb(60, 161, 60);
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .content {
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.75);
    padding-top: 4rem;
  }

  .smooth-dnd-container{
    min-height: 10px !important;
    min-width: 0 !important;
  }

  .smooth-dnd-container.horizontal{
    display: flex !important;
    overflow-x: auto !important;
  }
</style>