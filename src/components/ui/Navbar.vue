<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info" fixed="top">
      <b-navbar-brand to="/">
        <div class="brand-title">
          <font-awesome-icon :icon="trello" size="lg"/>
          <h3 class="mb-0 ml-2">Planner</h3>
        </div>
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto" v-show="uid">
        <b-nav-item href="#" disabled>
          <div class="user">{{initials}}</div>
        </b-nav-item>
        <b-nav-item class="logout" href="#" @click="signOut">Logout</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script>
  import {BNavbar, BNavbarBrand, BNavbarNav, BNavItem } from
      'bootstrap-vue'
  import { faTrello } from '@fortawesome/free-brands-svg-icons'
  import { mapState } from 'vuex';

  export default {
    name: "Navbar",
    components: {
      BNavbar,
      BNavbarBrand,
      BNavbarNav,
      BNavItem
    },
    computed: {
      trello () {
        return faTrello
      },
      ...mapState(['uid', "initials"])
    },
    methods: {
      signOut() {
        this.$store.dispatch('signOut').then(() => {
          this.$router.push('/auth')
        });
      }
    }
  }
</script>

<style scoped>
  .brand-title{
    display: flex;
  }

  .user{
    border: 1px solid gainsboro;
    padding: 2px;
    border-radius: 50%;
    height: 36px;
    width: 36px;
    justify-content: center;
    display: flex;
    margin-right: 0.5rem;
  }

  .nav-link{
    padding: 0 !important;
  }

  .navbar-nav{
    align-items: center;
    flex-direction: row;
  }

  .navbar{
      background-color: rgb(56, 64, 100)!important;
  }

  .logout {
    font-size: 1.2em;
  }
</style>